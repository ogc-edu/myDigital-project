import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

dotenv.config({ override: true });

const app = express();

//Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser()); //req.cookies
app.use(express.json()); //turn json into object from req.body
app.use(express.urlencoded({ extended: true })); //form data, but only sent in multipart/form-data, for postman testing

//All Routes
app.use('/api', routes);

//health check route
app.get('/', (req, res) => {
  res.json({ message: 'Testing and alive' });
});

//global error handler
app.use(globalErrorHandler);

export default app;

/*
/api/register
/api/login
/api/images/upload
/ -> postman health check
 */
