import { Router } from 'express';
import express from 'express';


import { generateRandomBucketName, createS3Bucket, uploadDir } from '../aws/s3Client.js';
import { unzipToTmpDir, listZipfileContents, zipfileContains } from '../utils/zip.js';
import AdmZip from 'adm-zip';
import path from 'path';

const router = Router();

router.post('/create_site', async (req, res) => {
    
    // TODO replace this with specific origins
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
        // Handle zip file upload here
        // TODO add API contract somewhere as middleware, this is insanity
        const contentRoot: string | undefined = req.body.contentRoot;
        if (contentRoot === undefined){
            // TODO autogenerate type conformity checks, and even better use generated types

            res.status(400).send({
                error: "invalid_request_body", 
                message: `Expected request body to contain indexhtmlPath. Request body: ${req.body}`
            });
            return;
        }

        
        const zipFile = new AdmZip(req.files.zipFile.data);

        if (contentRoot !== "" && !zipfileContains(contentRoot, zipFile)){

            res.status(400).send({ 
                error: `content_root_not_found`,
                message: `${contentRoot} does exist in the uploaded zip file.`,
                zipFileEntries: listZipfileContents(zipFile)
            });
            return;
        }

        if (!zipfileContains(path.join(contentRoot, "index.html"), zipFile)){
            res.status(400).send({ 
                error: `index_html_not_found`,
                message: `${contentRoot}/index.html does not exist in the uploaded zip file.`,
                zipFileEntries: listZipfileContents(zipFile)
            });
            return;
        }

        const bucketName = generateRandomBucketName();
        const bucketSiteUrl = await createS3Bucket(bucketName);
        
        const tmpDir = unzipToTmpDir(zipFile);
        const uploadRoot = path.join(tmpDir, contentRoot);
        await uploadDir(bucketName, uploadRoot, uploadRoot);
        res.status(200).send({message: `Site created at ${bucketSiteUrl}`});
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating the site');
    }
});

router.use('/', express.static('frontend'));

export default router;