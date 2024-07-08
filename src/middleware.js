const express = require("express");
const path = require("path");

const middleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
};

module.exports = middleware;
