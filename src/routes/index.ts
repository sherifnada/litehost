import { Router, Request} from 'express';
import express from 'express';



import { readFile, uploadDir } from '../aws/s3Client.js';
import { unzipToTmpDir, listZipfileContents, zipfileContains } from '../utils/zip.js';
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
        validateContentRoot(req.body);
        assertZipFile(req);

        const contentRoot: string = req.body.contentRoot;
        const zipFile = new AdmZip((req.files.zipFile as UploadedFile).data);
        validateZipContents(contentRoot, zipFile);
        
        const subdomain = req.body.subdomain;
        const bucketSiteUrl = `https://${subdomain}.litehost.io`;
        const tmpDir = unzipToTmpDir(zipFile);
        const uploadRoot = path.join(tmpDir, contentRoot);
        // await uploadDir(HOSTING_BUCKET_NAME, subdomain, uploadRoot, uploadRoot);
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
    const subdomain : string = body.subdomain;
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

function validateContentRoot(body: any){
    const contentRoot: string | undefined = body.contentRoot;
        if (contentRoot === undefined){
            // TODO autogenerate type conformity checks, and even better use generated types

            throw new ValidationError(400,{
                error: "invalid_request_body", 
                message: `Expected request body to contain indexhtmlPath. Request body: ${JSON.stringify(body)}`
            });
        }
}

function validateZipContents(contentRoot: string, zipFile: AdmZip){
    if (contentRoot !== "" && !zipfileContains(contentRoot, zipFile)){
        throw new ValidationError(400, { 
            error: `content_root_not_found`,
            message: `${contentRoot} does not exist in the uploaded zip file.`,
            zipFileEntries: listZipfileContents(zipFile)
        });
    }

    if (!zipfileContains(path.join(contentRoot, "index.html"), zipFile)){
        throw new ValidationError(400, { 
            error: `index_html_not_found`,
            message: `${contentRoot}/index.html does not exist in the uploaded zip file.`,
            zipFileEntries: listZipfileContents(zipFile)
        });
    }
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



export default router;