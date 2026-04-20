import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

dotenv.config({ override: true });

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//All Routes
app.use('/api', routes);

//Base route
app.get('/', (req, res) => {
  res.json({ message: 'Testing and alive' });
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;

/*
/api/register
/api/login
/api/images/upload
 */
