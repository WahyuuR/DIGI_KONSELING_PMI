const express = require("express");
const middleware = require("./src/middleware");
const routes = require("./src/routes");
const app = express();
const speedInsights = require("@vercel/speed-insights");

app.use(speedInsights.middleware());

middleware(app);
app.use(routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
