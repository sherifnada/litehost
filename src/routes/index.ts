import express, { Request, Router } from 'express';

import AdmZip from 'adm-zip';
import { UploadedFile } from 'express-fileupload';
import { App } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import path from 'path';
import { HOSTING_BUCKET_NAME } from '../aws/constants.js';
import { readFile, uploadDir } from '../aws/s3Client.js';
import DbClient from '../models/dbClient.js';
import { listZipfileContents, unzipToTmpDir } from '../utils/zip.js';
import { ValidationError } from './errors.js';
import { SubdomainOwnerModel } from '../models/subdomainOwner.js';


interface AuthorizedRequest extends Request {
  userToken: DecodedIdToken;
}

const createRouter = (firebaseApp: App, dbClient: DbClient) => {
  const router = Router();
  const subdomainOwnerModel = new SubdomainOwnerModel(dbClient);

  function parseBearerToken(token: string): string | undefined {
    const split = token?.split(" ");
    if (split && split.length === 2) {
      return split[1];
    }

    return undefined;
  }

  async function validateUserSignedIn(req, res, next) {
    const idToken = parseBearerToken(req.headers?.authorization);
    if (!idToken) {
      res.status(401).send({ error: "auth", message: "Expected a bearer token" });
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      const decodedToken = await auth.verifyIdToken(idToken);
      req.userToken = decodedToken;
      next();
    } catch (error) {
      res.status(401).send({ error: "auth", message: "Invalid auth token" })
    }
  }

  async function validateUserCanUpdateSite(req: AuthorizedRequest, _, next) {
    validateSubdomain(req.body);
    const subdomain = req.body.subdomain;
    await assertSubdomainAvailableForUser(subdomain, req.userToken.uid);
    next();
  }

  function asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(error.status).send(error.body);
        } else {
          // You can log the error here if needed
          console.log(error);
          res.status(500).send({ error: "internal", message: "Internal server error" });
        }
      }
    };
  }

  router.post('/is_site_available', asyncHandler(async (req, res) => {
    validateSubdomain(req.body);
    const available = !await subdomainOwnerModel.subdomainAlreadyInUse(req.body.subdomain);
    if (!available && req.userToken) {
      const subdomainOwner = await subdomainOwnerModel.getRowForSubdomain(req.body.subdomain);
      if (subdomainOwner.owner === req.userToken.uid) {
        res.status(200).send({ available: true });
        return;
      }
    }
    res.status(200).send({ available });
  }));



  router.post('/create_site',
    validateUserSignedIn,
    asyncHandler(validateUserCanUpdateSite),
    asyncHandler(async (req: AuthorizedRequest, res) => {
      // TODO add API contract somewhere as middleware, this validation is nuts
      assertZipFile(req);

      // in zipFile, find the content root i.e the shallowest directory which contains an index.html file.
      // If no such directory exists then raise a ValidationError
      const zipFile = new AdmZip((req.files.zipFile as UploadedFile).data);
      const contentRoot: string = inferContentRoot(zipFile);

      const subdomain = req.body.subdomain;
      const uid = req.userToken.uid;
      const thisIsANewDomain = !await subdomainOwnerModel.getRowForSubdomain(subdomain);
      if (thisIsANewDomain) {
        await subdomainOwnerModel.associateSubdomainWithOwner(subdomain, uid);
      }

      const bucketSiteUrl = `https://${subdomain}.litehost.io`;
      const tmpDir = unzipToTmpDir(zipFile);
      const uploadRoot = path.join(tmpDir, contentRoot);
      await uploadDir(HOSTING_BUCKET_NAME, subdomain, uploadRoot, uploadRoot);
      // TODO replace this with specific origins
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).send({ message: `Site created at ${bucketSiteUrl}`, websiteUrl: bucketSiteUrl });
    }));

  router.get('*', asyncHandler(async (req, res, next) => {
    try {
      const subdomain = extractSubdomainFromHost(req.headers.host);
      if (subdomain) {
        let objectPath = req.originalUrl.split("?")[0];
        if (!isRequestForFile(objectPath) && objectPath.endsWith("/")) {
          objectPath = path.join(objectPath, "index.html");
        }

        const readFileOutput = await readFile(HOSTING_BUCKET_NAME, subdomain, objectPath);
        res.status(200);
        res.setHeader("Content-Type", readFileOutput.contentType);
        readFileOutput.body.pipe(res);
      } else {
        next();
      }
    } catch (error) {
      if (error.name === "NoSuchKey") {
        res.status(404).send("File does not exist");
      } else {
        throw error;
      }
    }
  }));


  router.use("/", express.static("frontend"));

  async function assertSubdomainAvailableForUser(subdomain: string, user: string) {
    const subdomainOwnershipRecord = await subdomainOwnerModel.getRowForSubdomain(subdomain);
    if (subdomainOwnershipRecord && subdomainOwnershipRecord.owner !== user) {
      throw new ValidationError(
        400,
        {
          error: "subdomain_already_in_use",
          message: `Subdomain ${subdomain} is already in use`
        }
      );
    }
  }

  function extractSubdomainFromHost(host: string) {
    const url = new URL("http://" + host);
    const hostname = url.hostname;
    const parts = hostname.split('.');

    // contains exactly one subdomain
    if (parts.length === 3 && parts[0] !== "www") {
      return parts[0];
    } else {
      return null;
    }
  }

  function isRequestForFile(path: string) {
    return /\.[^./]+$/.test(path);
  }

  function validateSubdomain(body: any) {
    const subdomain: string = body?.subdomain;
    if (!subdomain) {
      throw new ValidationError(
        400,
        {
          error: "invalid_request_body",
          message: `Expected request body to contain subdomain. Request body: ${JSON.stringify(body)}`
        }
      );
    }

    if (!subdomain.match("^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$")) {
      throw new ValidationError(
        400,
        {
          error: "invalid subdomain",
          message: "Domain must only contain alphanumeric characters, hyphens, and cannot start or end with a hyphen or period."
        }
      );
    }
  }

  function inferContentRoot(zipFile: AdmZip): string {
    const entryPaths = listZipfileContents(zipFile);
    let anyContentRootFound = false;
    let shallowestDepth = Number.MAX_VALUE;
    let shallowestDir = "";
    let dirsAtThisDepth = 0;

    // first get all entries which have an index.html
    entryPaths.filter(entryPath => entryPath.endsWith("index.html"))
      // then keep track of # of entries at this depth
      .forEach(entryPath => {
        const entryDepth = entryPath.split('/').length - 1;
        if (entryDepth < shallowestDepth) {
          shallowestDepth = entryDepth;
          shallowestDir = entryPath.replace(/\/?index\.html$/, '');
          anyContentRootFound = true;
          dirsAtThisDepth = 1;
        } else if (entryDepth === shallowestDepth) {
          dirsAtThisDepth++;
        }
      });

    if (!anyContentRootFound) {
      throw new ValidationError(400, {
        error: "invalid_content_root",
        message: 'We could not find an index.html file in your uploaded zip file. Please upload a zip file containing an index.html'
      });
    }

    if (dirsAtThisDepth > 1) {
      throw new ValidationError(400, {
        error: "ambiguous_content_root",
        message: 'Ambiguous content root. The uploaded zip file cannot have two index.html files at the same depths.'
      })
    }

    return shallowestDir;
  }

  function assertZipFile(req) {
    if (!req.files || !req.files.zipFile) {
      throw new ValidationError(400, {
        error: "no_files_uploaded",
        message: "The input must contain exactly a single file"
      });
    }

    if (req.files.zipFile.mimetype !== "application/zip") {
      throw new ValidationError(400, {
        error: "file_not_zipfile",
        message: "The uploaded file is not a zipfile. Please upload a zipfile."
      });
    }
  }


  return { router, inferContentRoot, validateUserSignedIn };
}


export { createRouter };
