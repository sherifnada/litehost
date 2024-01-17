// import { S3Client, ListBucketsCommand, ListObjectsCommand, DeleteObjectCommand, DeleteBucketCommand } from "@aws-sdk/client-s3";

// // Initialize the S3 Client

// async function deleteAllObjectsInBucket(bucketName: string) {
//     const objects = await s3.send(new ListObjectsCommand({ Bucket: bucketName }));
//     if (objects.Contents) {
//         for (const object of objects.Contents) {
//             await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key! }));
//         }
//     }
// }
// // J^z*l*BfBqJ6b6S!
// async function deleteAllBuckets() {
//     try {
//         const buckets = await s3.send(new ListBucketsCommand({}));
//         if (buckets.Buckets) {
//             for (const bucket of buckets.Buckets) {
//                 const bucketName = bucket.Name!;
//                 await deleteAllObjectsInBucket(bucketName);
//                 await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
//                 console.log(`Deleted bucket: ${bucketName}`);
//             }
//         }
//     } catch (error) {
//         console.error("Error in deleting buckets:", error);
//     }
// }

// (async () => {
//     console.log("hello!!")
//     await deleteAllBuckets()
// })();