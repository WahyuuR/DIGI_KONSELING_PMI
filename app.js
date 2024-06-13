const express = require("express");
const app = express();
const PORT = 5000;

// Middleware untuk file statis
app.use(express.static("public"));

const pages = {
  "/": "index.html",
  "/login": "login.html",
  "/admin": "admin.html",
  "/formKehadiran": "formKehadiran.html",
  "/loket2": "loket2.html",
  "/loketdisnakertrans": "loketdisnakertrans.html",
  "/layanan": "layanan.html",
  "/Konseling": "Konseling.html",
  "/loket3": "loket3.html",
  "/loket4": "loket4.html",
  "/loket5": "loket5.html",
  "/loket6": "loket6.html",
  "/digitalKonseling": "digitalKonseling.html",
  "/faq": "faq.html",
};

Object.entries(pages).forEach(([route, pages]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "public", pages));
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
