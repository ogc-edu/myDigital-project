import app from './app.js';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import User from './models/User.js';
import Image from './models/Image.js';

dotenv.config({ override: true });

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database online');

    await app.listen(PORT);
    console.log(`Backend on port ${PORT}`);
  } catch (error) {
    console.error('Server dead, error:', error);
    process.exit(1);
  }
}

startServer();