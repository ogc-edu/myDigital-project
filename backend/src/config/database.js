require('dotenv').config()

const initOptions = {
  query(e){
    console.log(e); //printing out each query
  }
}

const pgp = require('pg-promise')(initOptions);

const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}

const db = pgp(cn) //create connection to export

module.exports = { db, pgp};

