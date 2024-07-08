const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: "require",
  },
});

module.exports = pool;
