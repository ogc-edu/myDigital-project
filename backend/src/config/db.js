import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ override: true });    //overriding var in system

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: (msg) => console.log(msg)  //logging all queries to console
  }
);

export default sequelize;
