const { Client } = require('pg');
require('dotenv').config();
const express = require('express');
const path = require('path');
const auth = require('../../Atelier/server/middleware/authorization.js');
const axios = require('axios');

const app = express();

app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json())

app.get('/api/qa/questions', async (req, res) => {
  console.log('body:', req.body, 'query:', req.query)
  var input = Number(req.query.product_id)
  var query = {
    text: 'SELECT * FROM questions WHERE product_id = ($1)',
    values: [input]
  }

  var result = await client.query(query);
  res.send(result.rows)
})

app.post('/api/qa/questions', async (req, res) => {

  var date = new Date().toDateString()
  var values = {
    ...req.body,
    date: date,
    helpfulness: 0,
    reported: false
   };

  var query = {
    text: 'INSERT INTO questions (product_id, body, date, helpfulness, reported, asker_name) VALUES ($1, $2, $3, $4, $5. $6)',
    values: [values.product_id, values.body, values.date, values.helpfulness, values.reported, values.name]
  }
  await client.query(query);
  res.send('successfully added question')
})

app.put('/api/qa/questions/:question_id/helpful', async (req, res) => {
  console.log(req.params.question_id)
  var query = {
    text: "UPDATE questions SET helpfulness = helpfulness + 1 WHERE id = ($1)",
    values: [req.params.question_id]
  }
  await client.query(query);
  res.send('successfully updated question: helpful')
})

app.put('/api/qa/answers/:answer_id/helpful', async (req, res) => {
  console.log(req.params.answer_id)
  var query = {
    text: "UPDATE answers SET helpfulness = helpfulness + 1 WHERE answer_id = ($1)",
    values: [req.params.answer_id]
  }
  await client.query(query);
  res.send('successfully updated answer: helpful')
})

app.put('/api/qa/answers/:answer_id/report', async (req, res) => {
  console.log(req.query)
  var query = {
    text: 'UPDATE answers SET reported = "true" WHERE answer_id = ($1)',
    values: [req.query.answer_id]
  }
  await client.query(query)
  res.send('answer successfully reported')
})

app.put('/api/qa/questions/:question_id/report', async (req, res) => {
  var query = {
    text: 'UPDATE questions SET reported = "true" WHERE id = ($1)',
    values: [req.query.id]
  }
  await client.query(query)
  res.send('answer successfully reported')
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