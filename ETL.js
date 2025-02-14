const fs =  require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');
require('dotenv').config();

const filePathQuestions =  '/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set)/questions.csv'

const filePathAnswers = '/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set) 3/answers.csv'

const filePathPhotos = '/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set) 3/answers_photos.csv'

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432 // Default PostgreSQL port
})

const saveData = async (query) => {
  console.log(query)
    try {
      await client.query(query)
    } catch (error) {
      console.log(error)
    }

}


async function extractDataQuestions (source) {
  var queries = [];

    var stream = fs.createReadStream('/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set)/questions.csv')

    stream
    .pipe(csv())
    .on('data', (chunk) => {

        chunk.date_written = new Date(Number(chunk.date_written)).toDateString();
        var query = {
          text: "INSERT INTO questions (id, product_id, body, date, asker_name, asker_email, helpfulness, reported) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          values: [chunk.id, chunk.product_id, chunk.body, chunk.date_written, chunk.asker_name, chunk.asker_email, chunk.helpful, chunk.reported]
        }
        queries.push(query)

      })
      .on('end', async () => {
        console.log('stream has ended')
        for (var query of queries) {
          await saveData(query)
        }
      })
      .on('error', (error) => {
        console.log(error)
      })

}

async function extractDataAnswers (source) {
  var queries = [];

    var stream = fs.createReadStream('/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set) 3/answers.csv')

    stream
    .pipe(csv())
    .on('data', (chunk) => {
        chunk.date_written = new Date(Number(chunk.date_written)).toDateString();
        var query = {
          text: "INSERT INTO answers (answer_id, question_id, body, date, answerer_name, answerer_email, helpfulness, reported) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          values: [chunk.id, chunk.question_id, chunk.body, chunk.date_written, chunk.answerer_name, chunk.answerer_email, chunk.helpful, chunk.reported]
        }
        queries.push(query)

      })
      .on('end', async () => {
        console.log(queries.length)
        console.log('stream has ended')
        for (var query of queries) {
          await saveData(query)
        }
      })
      .on('error', (error) => {
        console.log(error)
      })

}

async function extractDataPhotos (source) {
  var queries = [];

    var stream = fs.createReadStream('/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set) 3/answers_photos.csv')

    stream
    .pipe(csv())
    .on('data', (chunk) => {
      console.log(chunk.id)
        var query = {
          text: "INSERT INTO photos (answer_id, id, url) VALUES ($1, $2, $3)",
          values: [chunk.answer_id, chunk.id, chunk.url]
        }
        queries.push(query)

      })
      .on('end', async () => {
        console.log(queries.length)
        console.log('stream has ended')
        for (var query of queries) {
          await saveData(query)
        }
      })
      .on('error', (error) => {
        console.log(error)
      })

}

client.connect()
  .then(() => console.log(`successfully connected to ${client.database} on ${client.port}`))
  .then(() => extractDataAnswers(filePathAnswers))
  .then(() => extractDataQuestions(filePathQuestions))
  .then(() => extractDataPhotos(filePathPhotos))
  .catch((err) => console.log(err))

module.exports.extractDataQuestions = extractDataQuestions;