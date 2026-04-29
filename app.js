const express = require("express");
const middleware = require("./src/middleware");
const routes = require("./src/routes");

const app = express();

middleware(app);
app.use(routes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
