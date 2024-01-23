import { Router, Request} from 'express';
import express from 'express';

import { readFile, uploadDir } from '../aws/s3Client.js';
import { unzipToTmpDir, listZipfileContents } from '../utils/zip.js';
import AdmZip from 'adm-zip';
import path from 'path';
import { HOSTING_BUCKET_NAME } from '../aws/constants.js';
import { ValidationError } from './errors.js';
import { UploadedFile } from 'express-fileupload';

const router = Router();

router.post('/create_site', async (req: Request, res) => {
    // TODO add API contract somewhere as middleware, this validation is nuts
    try {
        // TODO replace this with specific origins
        // validate the uploaded file is a zip file
        res.setHeader("Access-Control-Allow-Origin", "*");
        validateSubdomain(req.body);
        assertZipFile(req);

        // in zipFile, find the content root i.e the shallowest directory which contains an index.html file. 
        // If no such directory exists then raise a ValidationError        
        const zipFile = new AdmZip((req.files.zipFile as UploadedFile).data);
        const contentRoot: string = inferContentRoot(zipFile);
        console.log(`contentRoot: ${contentRoot}`);
        
        const subdomain = req.body.subdomain;
        const bucketSiteUrl = `https://${subdomain}.litehost.io`;
        const tmpDir = unzipToTmpDir(zipFile);
        const uploadRoot = path.join(tmpDir, contentRoot);
        await uploadDir(HOSTING_BUCKET_NAME, subdomain, uploadRoot, uploadRoot);
        res.status(200).send({message: `Site created at ${bucketSiteUrl}`, websiteUrl: bucketSiteUrl});
    } catch (error) {
        if (error instanceof ValidationError){
            res.status(error.status).send(error.body);
        } else {
            console.error(error);
            res.status(500).send('An error occurred while creating the site');
        }
        
    }
});

router.post('/session_login', async (req, res)=>{
    console.log("session login!!");
    console.log(req.headers);
    res.status(200).send();
})

router.get('*', async(req, res, next) => {
    try {
        const subdomain = extractSubdomainFromHost(req.headers.host);
        if (subdomain){
            let objectPath = req.originalUrl.split("?")[0];
            if (!isRequestForFile(objectPath) && objectPath.endsWith("/")){
                objectPath = path.join(objectPath, "index.html");
            }

            const readFileOutput = await readFile(HOSTING_BUCKET_NAME, subdomain, objectPath);
            res.status(200);
            res.setHeader("Content-Type", readFileOutput.contentType);
            readFileOutput.body.pipe(res);
        } else {
            next();
        }
    } catch(error) {
        if (error.name === "NoSuchKey") {
            res.status(404).send("File does not exist");
        } else {
            res.status(500).send("An unkonwn error happened");
        }
    }
});

router.use("/", express.static("frontend"));

function extractSubdomainFromHost(host: string){
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

function isRequestForFile(path: string){
    return /\.[^./]+$/.test(path);
}

function validateSubdomain(body: any){
    const subdomain : string = body?.subdomain;
    if (!subdomain) {
        throw new ValidationError(
            400, 
            {
                error: "invalid_request_body",
                message: `Expected request body to contain subdomain. Request body: ${JSON.stringify(body)}`
            }
        );
    }

    if (!subdomain.match("^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$")){
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
            } else if (entryDepth === shallowestDepth){
                dirsAtThisDepth++;
            }
        });

        if (!anyContentRootFound) {
            throw new ValidationError(400, {
                error: "invalid_content_root",
                message: 'We could not find an index.html file in your uploaded zip file. Please upload a zip file containing an index.html'
            });
        }

        if (dirsAtThisDepth > 1){
            throw new ValidationError(400, {
                error: "ambiguous_content_root",
                message: 'Ambiguous content root. The uploaded zip file cannot have two index.html files at the same depths.'
            })
        }

        return shallowestDir;
}

function assertZipFile(req){
    if (! req.files || !req.files.zipFile){
        throw new ValidationError(400, {
            error: "no_files_uploaded",
            message: "The input must contain exactly a single file"
        });
    }

    if (req.files.zipFile.mimetype !== "application/zip"){
        throw new ValidationError(400, {
            error: "file_not_zipfile",
            message: "The uploaded file is not a zipfile. Please upload a zipfile."
        });
    }
}



export {inferContentRoot}; 

export default router;