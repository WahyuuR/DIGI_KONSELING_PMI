const express = require("express");
const path = require("path");

const middleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  // Tambahkan rute untuk mengarahkan ke index.html
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  });
};

module.exports = middleware;
