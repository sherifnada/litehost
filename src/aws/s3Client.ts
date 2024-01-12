import {BucketCannedACL, S3} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({path: "secrets/.env.prod"});

// Configure AWS with your credentials
// It's recommended to configure credentials through environment variables or shared credential files
const AWSConfig = {
    region: 'us-west-2' // or your preferred region
};

const s3 = new S3(AWSConfig);

function generateRandomBucketName(length: number = 10): string {
    let result = 'easy-hosting-bucket-';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function uploadDir(bucketName: string, directory: string, rootDirectory: string) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const fileStat = fs.statSync(filePath);


        if (fileStat.isDirectory()) {
            await uploadDir(bucketName, filePath, rootDirectory); // Recursively upload directory
        } else {
            // Read file content
            const fileContent = fs.readFileSync(filePath);

            // Determine the S3 key (file path in S3)
            const s3Key = filePath.substring(rootDirectory.length + 1); // +1 to remove the /

            // Upload file to S3
            const uploadParams = {
                Bucket: bucketName,
                Key: s3Key,
                Body: fileContent
            };

            try {
                await s3.putObject(uploadParams);
                console.log(`File uploaded successfully: ${s3Key}`);
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    }
}

async function createS3Bucket(bucketName: string) {
    const params = {
        Bucket: bucketName,
        
    };

    try {
        const data = await s3.createBucket(params);
        console.log(`Bucket created successfully. CreateBucket response: ${JSON.stringify(data)}`);

        

        await s3.putBucketOwnershipControls({Bucket: bucketName, OwnershipControls: {Rules: [{ObjectOwnership: 'BucketOwnerPreferred'}]}});
        console.log(`Updated bucket ownership controls`);

        await s3.putPublicAccessBlock({Bucket: bucketName, PublicAccessBlockConfiguration: {
            IgnorePublicAcls: false,
            BlockPublicAcls: false,
            BlockPublicPolicy: false, 
            RestrictPublicBuckets: false
        }});
        console.log(`Removed public ACL restrictions`);

        await s3.putBucketAcl({Bucket: bucketName, ACL: BucketCannedACL.public_read });
        console.log("updated bucket ACL to public_read");

        const websiteParams = {
            Bucket: bucketName, 
            WebsiteConfiguration: {
                IndexDocument: { Suffix: "index.html" }
            }
        };
        const putWebsiteResponse = await s3.putBucketWebsite(websiteParams);
        console.log(`Put Website Request completed. Response: ${JSON.stringify(putWebsiteResponse)}`);

        const policyParams = {
            Bucket: bucketName,
            Policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${bucketName}/*`
                }]
            })
        };

        const putBucketPolicyResponse = await s3.putBucketPolicy(policyParams);
        console.log(`Bucket policy updated. Response: ${putBucketPolicyResponse}`);

        return data;
    } catch (error) {
        console.error("Error creating the bucket:", error);
        throw error;
    }
}

// import { S3Client, ListBucketsCommand, ListObjectsCommand, DeleteObjectCommand, DeleteBucketCommand } from "@aws-sdk/client-s3";

// // Initialize the S3 Client
// const s3Client = new S3Client({ region: "your-region" });

// async function deleteAllObjectsInBucket(bucketName: string) {
//     const objects = await s3Client.send(new ListObjectsCommand({ Bucket: bucketName }));
//     if (objects.Contents) {
//         for (const object of objects.Contents) {
//             await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key! }));
//         }
//     }
// }

// async function deleteAllBuckets() {
//     try {
//         const buckets = await s3Client.send(new ListBucketsCommand({}));
//         if (buckets.Buckets) {
//             for (const bucket of buckets.Buckets) {
//                 const bucketName = bucket.Name!;
//                 await deleteAllObjectsInBucket(bucketName);
//                 await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
//                 console.log(`Deleted bucket: ${bucketName}`);
//             }
//         }
//     } catch (error) {
//         console.error("Error in deleting buckets:", error);
//     }
// }

// deleteAllBuckets();


export {generateRandomBucketName, createS3Bucket, uploadDir};