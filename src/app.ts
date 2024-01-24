import express from 'express';
import fileUpload from 'express-fileupload';
import { readFileSync } from 'fs';
import path from 'path';
import {initializeApp, cert} from 'firebase-admin/app';

const firebaseKey = JSON.parse(readFileSync(path.join(process.cwd(), 'secrets/firebase-svcaccount-key.json')).toString());
const firebaseApp = initializeApp({
    credential: cert(firebaseKey),
});

const app = express();

app.use(fileUpload());

// Import routes
import {createRouter} from './routes/index.js';
const {router} = createRouter(firebaseApp);
app.use('/', router);  

export default app;
