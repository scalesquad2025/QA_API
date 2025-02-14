const { Client } = require('pg');
const { extractDataQuestions } = require('../ETL.js');
require('dotenv').config();

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432 // Default PostgreSQL port
})

client.connect()
  .then(() => console.log(`successfully connected to ${client.database} on ${client.port}`))
  .catch((err) => console.log(err))
