import app from './app.js';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import User from './models/User.js';
import Zip from './models/Zip.js';
import Image from './models/Image.js';

dotenv.config({ override: true });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    await app.listen(PORT);
    console.log('🚀 Database connected and tables synced');
    const [results, metadata] = await sequelize.query('SELECT * FROM users');
    console.log("Raw SQL results:", results);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();