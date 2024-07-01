const express = require("express");
const middleware = require("./middleware");
const routes = require("./routes");
const app = express();

middleware(app);
app.use(routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
