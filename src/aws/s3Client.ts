import {S3} from '@aws-sdk/client-s3';
import { REGION } from './constants.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import getContentTypeFromFileName from '../utils/contentTypes.js';
dotenv.config({path: "secrets/.env.prod"});

const AWSConfig = {
    region: REGION
};

const s3 = new S3(AWSConfig);

interface GetObjectResponse {
    body: any,
    contentType?: string
    contentEncoding?: string,
}

async function readFile(bucketName: string, bucketSubdirectory: string, objectKey: string): Promise<GetObjectResponse> {
    const fullObjectKey = path.join(bucketSubdirectory, objectKey)
    const object = await s3.getObject({Bucket: bucketName, Key: fullObjectKey});
    
    return {
        body: object.Body,
        contentType: object.ContentType,
        contentEncoding: object.ContentEncoding, 
    };
}

async function uploadDir(bucketName: string, bucketSubdirectory: string, directory: string, rootDirectory: string) {
    /**
     * 
     */
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const fileStat = fs.statSync(filePath);


        if (fileStat.isDirectory()) {
            await uploadDir(bucketName, bucketSubdirectory, filePath, rootDirectory); // Recursively upload directory
        } else {
            // Read file content
            const fileContent = fs.readFileSync(filePath);

            // Determine the S3 key (file path in S3)
            const s3Key = path.join(bucketSubdirectory, filePath.substring(rootDirectory.length + 1)); // +1 to remove the /

            // Upload file to S3
            const uploadParams = {
                Bucket: bucketName,
                Key: s3Key,
                Body: fileContent,
                ContentType: getContentTypeFromFileName(s3Key)
            };

            try {
                // TODO await all promises simultaneously to speed up upload
                await s3.putObject(uploadParams);
                console.log(`File uploaded successfully: ${s3Key}`);
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    }
}

export {uploadDir, readFile, GetObjectResponse};