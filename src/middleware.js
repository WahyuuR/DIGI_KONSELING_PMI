const express = require("express");
const path = require("path");
const session = require("cookie-session");

const middleware = (app) => {
  app.set("trust proxy", 1); // Required for Vercel
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "..", "public")));

  // cookie-session stores session data in the cookie itself, perfect for Vercel.
  app.use(
    session({
      name: "session",
      keys: [process.env.SESSION_SECRET || "dev-secret-key"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    })
  );
};

module.exports = middleware;
