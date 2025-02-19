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
    text: "SELECT id, product_id, body, date, asker_name, helpfulness FROM questions WHERE product_id = ($1) AND reported = 'false'",
    values: [input]
  }

  var result = await client.query(query);
  result.rows.forEach((row) => row.answers = [])

  var questionIds = result.rows.map((row) => row.id);

  var answersQuery = {
    text: "SELECT * FROM answers WHERE question_id = ANY ($1) AND reported = 'false'",
    values: questionIds
  }
  var answers = [];

  for await (var id of questionIds) {
    var query = {
      text: "SELECT * FROM answers WHERE question_id = ($1) AND reported = 'false'",
      values: [id]
    }
    var answer = await client.query(query)
    answers = answers.concat(answer.rows)
  }

  for (var i = 0; i < answers.length; i++) {
    for (var j = 0; j < result.rows.length; j++) {
      if (result.rows[j].id === answers[i].question_id) {
        result.rows[j].answers.push(answers[i])
      }
    }
  }
  res.send(result.rows)
})


app.get('/api/qa/questions/:question_id/answers', async (req, res) => {
  var id = Number(req.params.question_id);

  var query = {
    text: "SELECT * FROM answers WHERE question_id = ($1) AND reported = 'false'",
    values: [id]
  }

  var answers = await client.query(query)
  res.send(answers.rows)
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
    text: 'INSERT INTO questions (product_id, body, date, helpfulness, reported, asker_name) VALUES ($1, $2, $3, $4, $5, $6)',
    values: [values.product_id, values.body, values.date, values.helpfulness, values.reported, values.name]
  }
  await client.query(query);
  res.send('successfully added question')
})

app.post('/api/qa/questions/:question_id/answers', async (req, res) => {
  var date = new Date().toDateString();

  var values = {
    ...req.body,
    question_id: req.params.question_id,
    date: date,
    helpfulness: 0,
    reported: false
  }

  console.log(values)
  var query = {
    text: 'INSERT INTO answers (question_id, body, answerer_name, date, helpfulness, reported) VALUES ($1, $2, $3, $4, $5. $6)',
    // values: [values.product_id, values.body, values.date, values.helpfulness, values.reported]
  }
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

var server = app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`)
})


module.exports = server;