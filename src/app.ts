import express from 'express';
import fileUpload from 'express-fileupload';
import { readFileSync } from 'fs';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { createRouter } from './routes/index.js';
import DbClient from './models/dbClient.js';

const firebaseKey = JSON.parse(readFileSync(path.join(process.cwd(), 'secrets/firebase-svcaccount-key.json')).toString());
const firebaseApp = initializeApp({
  credential: cert(firebaseKey),
});

const dbClient = new DbClient();

const app = express();

app.use(fileUpload());



const { router } = createRouter(firebaseApp, dbClient);
app.use('/', router);

export default app;
