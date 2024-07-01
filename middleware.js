const express = require("express");

const middleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

module.exports = middleware;
