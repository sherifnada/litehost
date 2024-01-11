import express from 'express';
import fileUpload from 'express-fileupload';

const app = express();

app.use(fileUpload());

// Import routes
import indexRouter from './routes/index.js';
app.use('/', indexRouter);

export default app;
