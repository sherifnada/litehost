import * as dotenv from 'dotenv';
dotenv.config({ path: "secrets/.env" });

const HOSTING_BUCKET_NAME = process.env['AWS_HOSTING_BUCKET'];
const AWS_REGION = 'us-east-2';
export { HOSTING_BUCKET_NAME, AWS_REGION as REGION };