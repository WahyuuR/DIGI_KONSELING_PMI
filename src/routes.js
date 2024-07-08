const express = require("express");
const router = express.Router();
const pool = require("./db");
const path = require("path");

const routes = [
  { path: "/login", redirect: "/login.html" },
  { path: "/", redirect: "/index.html" },
  { path: "/admin", redirect: "/admin.html" },
  { path: "/formKehadiran", redirect: "/formKehadiran.html" },
  { path: "/loket2", redirect: "/loket2.html" },
  { path: "/loketdisnakertrans", redirect: "/loketdisnakertrans.html" },
  { path: "/layanan", redirect: "/layanan.html" },
  { path: "/loket3", redirect: "/loket3.html" },
  { path: "/loket6", redirect: "/loket6_bpjs.html" },
  { path: "/loket7", redirect: "/loket7_imigrasi.html" },
  { path: "/faq", redirect: "/faq.html" },
  { path: "/konselor", redirect: "/konselor.html" },
];

routes.forEach((route) => {
  router.get(route.path, (req, res) => {
    res.redirect(route.redirect);
  });
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
