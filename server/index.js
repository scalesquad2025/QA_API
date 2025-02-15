const { Client } = require('pg');
require('dotenv').config();
const express = require('express');
const path = require('path');
const auth = require('../../Atelier/server/middleware/authorization.js');
const axios = require('axios');

const app = express();

app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json())

app.use('/api/qa', auth, (req, res) => {
  console.log(req.body, req.params)
  res.send('success')
  // client.query()
})

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

app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`)
})