import { Router } from 'express';
import express from 'express';


import { readFile, uploadDir } from '../aws/s3Client.js';
import { unzipToTmpDir, listZipfileContents, zipfileContains } from '../utils/zip.js';
import AdmZip from 'adm-zip';
import path from 'path';
import { HOSTING_BUCKET_NAME } from '../aws/constants.js';
import { ValidationError } from './errors.js';

const router = Router();

router.post('/create_site', async (req, res) => {
    // TODO add API contract somewhere as middleware, this validation is nuts
    try {
        // TODO replace this with specific origins
        // validate the uploaded file is a zip file
        res.setHeader("Access-Control-Allow-Origin", "*");
        validateSubdomain(req.body);
        validateContentRoot(req.body);
        const contentRoot: string = req.body.contentRoot;
        const zipFile = new AdmZip(req.files.zipFile.data);
        validateZipContents(contentRoot, zipFile);
        
        const subdomain = req.body.subdomain;
        const bucketSiteUrl = "https://placeholderwebsite.com";
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

router.get('*', async(req, res, next) => {
    const subdomain = extractSubdomainFromHost(req.headers.host);
    if (subdomain){
        const objectPath = req.originalUrl.split("?")[0];
        const readFileOutput = await readFile(HOSTING_BUCKET_NAME, subdomain, objectPath);
        res.status(200);
        res.setHeader("Content-Type", readFileOutput.contentType);
        res.send(readFileOutput.body);
    } else {
        next();
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


export default router;