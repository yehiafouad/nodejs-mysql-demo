const mysql2 = require("mysql2/promise");

console.log(process.env.SQL_HOST, process.env.SQL_USERNAME);
// Connection pool to the MySQL database
const db = mysql2.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  port: process.env.SQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
