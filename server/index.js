const { Client } = require('pg');
const NodeCache = require( "node-cache" );
require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const cache = new NodeCache();

app.use(express.json())

app.get('/api/qa/questions', async (req, res) => {
  var product_id = req.query.product_id

  var result = {
    product_id: product_id,
    results: []
  }

  value = cache.get( "questions" );

  if ( value == undefined ){
    var query = {
      text: `WITH questions AS (
        SELECT
          q.id AS question_id,
          q.product_id,
          q.body AS question_body,
          q.date AS question_date,
          q.asker_name,
          q.helpfulness AS question_helpfulness,
          q.reported,
          json_object_agg(
            a.answer_id,
            json_build_object(
              'id', a.answer_id,
              'body', a.answer_body,
              'date', a.answer_date,
              'answerer_name', a.answerer_name,
              'helpfulness', a.answer_helpfulness,
              'photos', COALESCE(
                (SELECT json_agg(json_build_object('id', p.photo_id, 'url', p.Url))
                FROM Photos p
                WHERE p.answer_id = a.answer_id),
                '[]'::json
              )
            )
          ) FILTER (WHERE a.answer_id IS NOT NULL) AS answers
        FROM Questions q
        LEFT JOIN Answers a ON q.id = a.question_id
        WHERE q.product_id = ($1) AND q.reported = false
        GROUP BY q.id
        )
        SELECT
              json_build_object(
                'question_id', question_id,
                'question_body', question_body,
                'question_date', question_date,
                'asker_name', asker_name,
                'question_helpfulness', question_helpfulness,
                'reported', reported,
                'answers', answers
              )
          AS results
        FROM questions`,
     values: [product_id]
    }

    var test = await client.query(query)

    result['results'] = test.rows[0].results
    cache.set("questions", result)
    res.send(result)
  } else {
    var q = cache.get("questions")
    res.send(q)
  }
})


app.get('/api/qa/questions/:question_id/answers', async (req, res) => {
  var id = Number(req.params.question_id);

  var query = {
    text: "SELECT * FROM answers WHERE question_id = ($1) AND reported = 'false'",
    values: [id]
  }

  var answers = await client.query(query)
  res.send(result)
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
    values: [values.question_id, values.body, values.answerer_name, values.date, values.helpfulness, values.reported]
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
