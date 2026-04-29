const express = require("express");
const path = require("path");
const session = require("express-session");

const middleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Session untuk fitur login admin & perubahan username/password.
  // NOTE: untuk produksi, sebaiknya set `SESSION_SECRET` di `.env`.
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );
};

module.exports = middleware;
