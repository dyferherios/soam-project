// db.js
const { Client } = require('pg');

const client = new Client({
    user: "dyferherios",
    host: "localhost",
    database: "soam_db",
    password: "dyFer1823*db",
    port: 5432,
});

client.connect()  
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
