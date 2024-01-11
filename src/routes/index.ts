import { Router } from 'express';
import express from 'express';
import { generateRandomBucketName, createS3Bucket } from '../aws/s3Client.js';

const router = Router();

interface File {
    name: string;
    data: Buffer;
    size: number;
    mimetype: string;
}

router.post('/create_site', async (req, res) => {
    // Handle zip file upload here
    // TODO add API contract somewhere as middleware, this is insanity
    const files : File = req.files.zipFile;
    console.log(files);
    const bucketName = generateRandomBucketName();
    const bucketCreationResponse = await createS3Bucket(bucketName);
    console.log(bucketCreationResponse);

    res.send('Site creation endpoint');
});

router.use('/', express.static('frontend'));


export default router;