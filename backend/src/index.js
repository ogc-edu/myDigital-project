import app from './app.js';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import User from './models/User.js';
import Image from './models/Image.js';

dotenv.config({ override: true });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('🚀 Database connected and tables synced');

    await app.listen(PORT);
    console.log(`Server listening on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();