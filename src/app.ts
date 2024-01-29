// ENV must be imported first
import express from 'express';
import fileUpload from 'express-fileupload';
import { cert, initializeApp } from 'firebase-admin/app';
import DbClient from './models/dbClient.js';
import { createRouter } from './routes/index.js';
import { readJsonSecret } from './utils/index.js';


const firebaseKey = readJsonSecret('firebase-svcaccount-key.json');
const firebaseApp = initializeApp({
  credential: cert(firebaseKey),
});

const dbConfig = readJsonSecret('db-config.json');
const dbClient = new DbClient(dbConfig);

const app = express();
app.use(fileUpload());
app.use(express.json());

const { router } = createRouter(firebaseApp, dbClient);
app.use('/', router);

export default app;
