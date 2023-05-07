const mysql2 = require("mysql2/promise");

// Connection pool to the MySQL database
const db = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "root1234",
  database: "nodeDB-demo",
  port: "3306",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
