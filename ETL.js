const fs =  require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');
require('dotenv').config();

const filePath = '/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set)/questions.csv';

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432 // Default PostgreSQL port
})

const saveData = async (queries) => {
  for (var query of queries) {
    client.query(query)
  }
  // stream.resume();
}


async function extractDataQuestions (source) {
  var queries = [];
  var data = [];

    var stream = fs.createReadStream('/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set)/questions.csv').pipe(csv())

    try {
      for await (const chunk of stream) {
        // var piped = chunk.toString();
        chunk.date_written = new Date(Number(chunk.date_written)).toDateString();
        var query = {
          text: `INSERT INTO questions (id, product_id, body, date, asker_name, asker_email, helpfulness, reported) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          values: [chunk.id, chunk.product_id, chunk.body, chunk.date_written, chunk.asker_name, chunk.asker_email, chunk.helpful, chunk.reported]
        }
        // console.log(piped)
        queries.push(query)
        console.log(chunk)
        // console.log(queries[0])
      }
    } catch (error) {
      console.log(error)
    }

    if(queries.length >= 1000) { //pause when batch size is reached ,
      stream.pause();
//await processing of data, finish this, THEN clear data and unpause stream
       saveData(queries);
        // queries = [];
        // stream.resume();
      }

    // stream
    // .pipe(csv())
    // .on('data', async (chunk) => {

    //     // data.push(chunk) //data length = batch size
    //     chunk.date_written = new Date(Number(chunk.date_written)).toDateString();
    //     var query = {
    //       text: `INSERT INTO questions (id, product_id, body, date, asker_name, asker_email, helpfulness, reported) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    //       values: [chunk.id, chunk.product_id, chunk.body, chunk.date_written, chunk.asker_name, chunk.asker_email, chunk.helpful, chunk.reported]
    //     }
    //     queries.push(query)
    //     console.log(chunk)
        // console.log(chunk.id)
        // console.log(queries.length)
        // console.log(count)



      // })
      // .on('pause',  () => {
      //   console.log('paused')
      //   // await saveData(queries);
      //   stream.resume();
      // })
      // .on('resume', () => {
      //   console.log('resumed')
      //   count = 0;
      // })
      // .on('end', () => {
      //   console.log('stream has ended')
      // })
      // .on('error', (error) => {
      //   console.log(error)
      // })



}

// extractDataQuestions('/Users/bonnie/Downloads/SDC Application Data - Atelier Project (_Clean_ Data Set)/questions.csv')


client.connect()
  .then(() => console.log(`successfully connected to ${client.database} on ${client.port}`))
  .then(() => extractDataQuestions(filePath))
  .catch((err) => console.log(err))

module.exports.extractDataQuestions = extractDataQuestions;