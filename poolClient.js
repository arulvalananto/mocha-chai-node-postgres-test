const Pool = require("pg-pool");

const pool = new Pool({
  database: "postgres",
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin@123",
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports.query = (text, params) => pool.query(text, params);
