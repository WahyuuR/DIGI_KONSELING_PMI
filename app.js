const express = require("express");
const path = require("path");
const pool = require("./db");
const app = express();
const PORT = 5000;

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk file statis
app.use(express.static("public"));

//route
const pages = {
  "/": "index.html",
  "/login": "login.html",
  "/admin": "admin.html",
  "/formKehadiran": "formKehadiran.html",
  "/loket2": "loket2.html",
  "/loketdisnakertrans": "loketdisnakertrans.html",
  "/layanan": "layanan.html",
  "/Konseling": "Konseling.html",
  "/loket3": "loket3.html",
  "/loket4": "loket4.html",
  "/loket5": "loket5.html",
  "/loket6": "loket6.html",
  "/digitalKonseling": "digitalKonseling.html",
  "/faq": "faq.html",
  "/konselor": "konselor.html",
};

Object.entries(pages).forEach(([route, pages]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "public", pages));
  });
});

// Create a route to handle the form submission
app.post("/submit", (req, res) => {
  const { nama, no_telpon, alamat, jenis_keperluan } = req.body;
  const query = {
    text: `INSERT INTO daftar_hadir (nama, nomer_hp, alamat, jenis_keperluan) VALUES ($1, $2, $3, $4) RETURNING *`,
    values: [nama, no_telpon, alamat, jenis_keperluan],
  };
  pool.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error submitting form");
    } else {
      res.redirect("/layanan");
    }
  });
});

// Create a route to handle the GET request
app.get("/get-data", (req, res) => {
  const query = {
    text: `SELECT * FROM daftar_hadir`,
  };
  pool.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving data");
    } else {
      res.json(result.rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
