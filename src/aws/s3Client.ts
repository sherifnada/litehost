import {S3, BucketCannedACL} from '@aws-sdk/client-s3';

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

async function createS3Bucket(bucketName: string) {
    const params = {
        Bucket: bucketName,
        ACL: BucketCannedACL.public_read
    };

    try {
        const data = await s3.createBucket(params);
        console.log(`Bucket created successfully. CreateBucket response: ${data}`);

        const websiteParams = {
            Bucket: bucketName, 
            WebsiteConfiguration: {
                // TODO accept an error document
                // ErrorDocument: {Key: "error.html"},
                IndexDocument: { Suffix: "index.html"}
            }
        };

        const putWebsiteResponse = await s3.putBucketWebsite(websiteParams);

        console.log(`Put Website Request completed. Response: ${putWebsiteResponse}`);

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

export {generateRandomBucketName, createS3Bucket};
