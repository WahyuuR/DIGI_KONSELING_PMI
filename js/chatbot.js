const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data simulasi untuk pertanyaan dan jawaban
const questionsAndAnswers = {
  "Apa itu HTML?":
    "HTML adalah bahasa markup yang digunakan untuk membuat struktur halaman web.",
  "Apa itu CSS?":
    "CSS adalah bahasa yang digunakan untuk mendesain halaman web.",
  "Apa itu JavaScript?":
    "JavaScript adalah bahasa pemrograman yang digunakan untuk membuat interaksi pada halaman web.",
};
