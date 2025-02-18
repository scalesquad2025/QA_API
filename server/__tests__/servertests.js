const request = require('supertest');
const { Client } = require('pg');
const app = require('../index.js');
require("dotenv").config();

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432 // Default PostgreSQL port
})

// beforeEach(async () => {
//   await client.connect();
// });

// afterEach(async () => {
//   await client.end();
// });

describe('GET api/qa/questions', () => {

  it('should return list of questions based on product id', async () => {
    const res = await request(app).get('/api/qa/questions?product_id=40347')
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  })
})

describe('GET api/qa/answers', () => {

  it('should return list of quesitons based on product id', async () => {
    const res = await request(app).get('/api/qa/questions/1/answers')
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  })
})