const express = require("express");
const router = express.Router();
const pool = require("../db");
const path = require("path");
const session = require("express-session");

router.get("/login", (req, res) => {
  console.log(req.sessionID);
  const { username, password } = req.body;
  if (username && password) {
    if (req.session.authenticated) {
      res.json(req.session);
    } else {
      if (password === "admin") {
        req.session.authenticated = true;
        req.session.user = {
          username,
          password,
        };
        res.json(req.session);
      } else {
        res.status(403).json({ msg: "bad Credential" });
      }
    }
  } else res.status(403).json({ msg: "bad Credential" });
  res.redirect("/login.html");
});

router.get("/", (req, res) => {
  res.redirect("/index.html");
});

router.get("/admin", (req, res) => {
  res.redirect("/admin.html");
});

router.get("/formKehadiran", (req, res) => {
  res.redirect("/formKehadiran.html");
});

router.get("/loket2", (req, res) => {
  res.redirect("/loket2.html");
});

router.get("/loketdisnakertrans", (req, res) => {
  res.redirect("/loketdisnakertrans.html");
});

router.get("/layanan", (req, res) => {
  res.redirect("/layanan.html");
});

router.get("/loket3", (req, res) => {
  res.redirect("/loket3.html");
});

router.get("/loket6", (req, res) => {
  res.redirect("/loket6_bpjs.html");
});

router.get("/loket7", (req, res) => {
  res.redirect("/loket7_imigrasi.html");
});

router.get("/faq", (req, res) => {
  res.redirect("/faq.html");
});

router.get("/konselor", (req, res) => {
  res.redirect("/konselor.html");
});

router.post("/submit", (req, res) => {
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

router.get("/get-data", (req, res) => {
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

module.exports = router;
