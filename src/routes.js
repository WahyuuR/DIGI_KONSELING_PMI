const express = require("express");
const router = express.Router();
const pool = require("./db");
const path = require("path");
const cors = require("cors");

const multer = require("multer");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const fs = require("fs");

router.use(express.static(path.join(__dirname, "..", "public")));
// Middleware CORS
router.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 5MB is usually enough for small admin template uploads
    fileSize: 5 * 1024 * 1024,
  },
});

const pages = {
  "/": "index.html",
  "/login": "login.html",
  "/formKehadiran": "formKehadiran.html",
  "/loket2": "loket2.html",
  "/loketdisnakertrans": "loketdisnakertrans.html",
  "/layanan": "layanan.html",
  "/Konseling": "konselor.html",
  "/loket3": "loket3.html",
  "/loket4": "loket4.html",
  "/loket5": "loket5.html",
  "/loket6": "loket6.html",
  "/digitalKonseling": "digitalKonseling.html",
  "/faq": "faq.html",
};

Object.entries(pages).forEach(([route, page]) => {
  router.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", page));
  });
});

const ADMIN_JENIS_KEPERLUAN = [
  "Layanan Informasi",
  "Pengaduan",
  "Konsultasi",
  "Lainnya",
];

// Ensure tabel admin_credentials siap (seed default admin/admin kalau kosong).
let adminInitPromise;
let dbAvailable = true;
const ensureAdminCredentials = async () => {
  if (adminInitPromise) return adminInitPromise;
  adminInitPromise = (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_credentials (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      const { rows } = await pool.query(
        `SELECT id FROM admin_credentials ORDER BY id ASC LIMIT 1`
      );
      if (rows.length > 0) return;

      const hash = await bcrypt.hash("admin", 10);
      await pool.query(
        `INSERT INTO admin_credentials (username, password_hash) VALUES ($1, $2)`,
        ["admin", hash]
      );
    } catch (err) {
      // Kalau user tidak punya akses DB, login admin tetap harus bisa (fallback).
      dbAvailable = false;
      console.error("DB unavailable for admin_credentials init:", err);
    }
  })();
  return adminInitPromise;
};

const requireAdminAuth = (req, res, next) => {
  if (req.session && req.session.admin && req.session.admin.username) {
    return next();
  }
  const isAjax =
    req.xhr ||
    (req.headers && req.headers.accept
      ? String(req.headers.accept).includes("application/json")
      : false) ||
    (req.headers && req.headers["content-type"]
      ? String(req.headers["content-type"]).includes("application/json")
      : false);
  if (isAjax) return res.status(401).send("Unauthorized");
  return res.redirect("/login");
};

// Protected admin page (so fitur ubah username/password & import tidak bisa diakses tanpa login).
router.get("/admin", (req, res) => {
  if (!req.session || !req.session.admin || !req.session.admin.username) {
    return res.redirect("/login");
  }
  return res.redirect("/admin-data");
});

router.get("/admin-credentials", requireAdminAuth, (req, res) => {
  return res.sendFile(
    path.join(__dirname, "..", "public", "admin-credentials.html")
  );
});

router.get("/admin-layanan", requireAdminAuth, (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "admin-wa.html"));
});

router.get("/admin-import", requireAdminAuth, (req, res) => {
  return res.sendFile(
    path.join(__dirname, "..", "public", "admin-import.html")
  );
});

router.get("/admin-gallery", requireAdminAuth, (req, res) => {
  return res.sendFile(
    path.join(__dirname, "..", "public", "admin-gallery.html")
  );
});

router.get("/admin-data", requireAdminAuth, (req, res) => {
  return res.sendFile(
    path.join(__dirname, "..", "public", "admin-data.html")
  );
});

// Logout admin (clear session).
router.get("/admin-logout", requireAdminAuth, (req, res) => {
  if (req.session) req.session.admin = null;
  return res.redirect("/login");
});

// --- Image Management (Database-backed for Vercel) ---
const uploadImg = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

async function ensureGalleryTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        mime_type TEXT NOT NULL,
        data BYTEA NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error("Gallery table error:", err);
  }
}

// Route to serve images from DB
router.get("/images/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { rows } = await pool.query(
      "SELECT data, mime_type FROM gallery WHERE filename = $1",
      [filename]
    );
    
    if (rows.length === 0) {
      // Fallback: If not in DB, try serving from physical folder
      const physicalPath = path.join(process.cwd(), "public", "images", filename);
      if (fs.existsSync(physicalPath)) {
        return res.sendFile(physicalPath);
      }
      return res.status(404).send("Not found");
    }

    res.setHeader("Content-Type", rows[0].mime_type);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    return res.send(rows[0].data);
  } catch (err) {
    return res.status(404).send("Not found");
  }
});

router.get("/admin/list-images", requireAdminAuth, async (req, res) => {
  try {
    await ensureGalleryTable();
    // 1. Get from DB
    const { rows } = await pool.query("SELECT filename FROM gallery ORDER BY updated_at DESC");
    const dbFiles = rows.map(r => r.filename);

    // 2. Get from Physical Folder (Fallback for legacy files)
    let physicalFiles = [];
    const dir = path.join(__dirname, "..", "public", "images");
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        physicalFiles = files.filter(f => 
          [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(path.extname(f).toLowerCase())
        );
      } catch (e) { /* ignore readdir error */ }
    }

    // 3. Merge and unique
    const allFiles = [...new Set([...dbFiles, ...physicalFiles])];
    res.json(allFiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to list images" });
  }
});

router.post("/admin/upload-image", requireAdminAuth, uploadImg.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    await ensureGalleryTable();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname) || ".jpg";
    const filename = "upload-" + uniqueSuffix + ext;

    await pool.query(
      "INSERT INTO gallery (filename, mime_type, data) VALUES ($1, $2, $3)",
      [filename, req.file.mimetype, req.file.buffer]
    );

    res.json({ filename, path: "/images/" + filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload to DB" });
  }
});

router.post("/admin/delete-image", requireAdminAuth, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: "Filename required" });
    
    const safeFilename = path.basename(filename);
    const result = await pool.query("DELETE FROM gallery WHERE filename = $1", [safeFilename]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: "File not found in DB" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image from DB" });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    await ensureAdminCredentials();

    const { username, password } = req.body || {};
    const u = String(username || "").trim();
    const p = String(password || "");
    if (!u || !p) return res.status(400).send("Username dan password wajib diisi.");

    // Fallback kalau DB tidak bisa diakses.
    if (!dbAvailable) {
      if (u === "admin" && p === "admin") {
        req.session.admin = { username: "admin" };
        return res.status(200).json({ ok: true });
      }
      return res.status(401).send("Username atau password salah!");
    }

    const { rows } = await pool.query(
      `SELECT username, password_hash FROM admin_credentials WHERE username=$1 LIMIT 1`,
      [u]
    );
    if (rows.length === 0)
      return res.status(401).send("Username atau password salah!");

    const ok = await bcrypt.compare(p, rows[0].password_hash);
    if (!ok) return res.status(401).send("Username atau password salah!");

    req.session.admin = { username: rows[0].username };
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Jika DB error (misal timeout), coba fallback ke admin/admin sebagai pengaman
    const { username, password } = req.body || {};
    if (username === "admin" && password === "admin") {
      req.session.admin = { username: "admin" };
      return res.status(200).json({ ok: true });
    }
    console.error("LOGIN ERROR:", err.message || err);
    return res.status(500).send("Gagal login admin. Terjadi gangguan koneksi database.");
  }
});

router.post(
  "/admin-update-credentials",
  requireAdminAuth,
  async (req, res) => {
    try {
      if (!dbAvailable) {
        return res.status(503).send(
          "Database tidak tersedia, perubahan username/password belum bisa dilakukan."
        );
      }

      await ensureAdminCredentials();

      const { currentPassword, newUsername, newPassword } = req.body || {};
      const cp = String(currentPassword || "");
      const nu = String(newUsername || "").trim();
      const np = String(newPassword || "");

      if (!cp || !nu || !np) {
        return res
          .status(400)
          .send("currentPassword, newUsername, dan newPassword wajib diisi.");
      }

      const current = await pool.query(
        `SELECT id, username, password_hash FROM admin_credentials WHERE username=$1 ORDER BY id ASC LIMIT 1`,
        [req.session.admin.username]
      );

      if (current.rows.length === 0) return res.status(401).send("Unauthorized");

      const ok = await bcrypt.compare(cp, current.rows[0].password_hash);
      if (!ok) return res.status(403).send("Password saat ini salah.");

      const newHash = await bcrypt.hash(np, 10);
      await pool.query(
        `UPDATE admin_credentials SET username=$1, password_hash=$2, updated_at=NOW() WHERE id=$3`,
        [nu, newHash, current.rows[0].id]
      );

      req.session.admin = { username: nu };
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Gagal menyimpan username/password.");
    }
  }
);

// -------- WA Configuration (Database-backed for Vercel compatibility) --------
const DEFAULT_WA_CONFIG = {
  waMessage: "Halo, saya membutuhkan informasi lebih lanjut.",
  loket1_disnakertrans: "+6281358438471",
  detail_disnakertrans: "Layanan ketenagakerjaan terintegrasi.",
  qa_disnakertrans: JSON.stringify({
    "Verivikasi Dokumen untuk Pembuatan Paspor PMI": "Dokumen yang Diperlukan:<br>1. Surat Permohonan dari PPPMI. <br>2. Lampiran Surat Permohonan. <br>3. Surat Ijin Kel. Diketahui Kepdes/Lurah. <br>4. Menyertakan Foto Copy KTP dan KK.<br>5. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>6. Menyertakan Foto Copy Surat Nikah / Akte Cerai. <br>7. Rekom dari Disnaker Kab/Kota. <br>8. Terregistrasi ID SISKOTKALN.<br>9. SIP (Surat ijin Pengerahan) Negara Tujuan. <br><br> Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Verivikasi Dokumen untuk Rekomendasi Paspor PMI Mandiri": "Berkas yang Diperlukan:<br>1. Surat Rekomendasi Paspor dari LTSA-PMI Jatim. <br>2. Menyertakan Foto Copy KTP dan KK. <br>3.  Surat Ijin Kel. Diketahui Kepdes/Lurah. <br>4. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>5. Menyertakan Foto Copy Surat Nikah / Akte Cerai. <br>6. Draft Kontrak Kerja/Job Offer/Surat Panggilan Kerja dari Perusahaan. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Verivikasi Dokumen untuk Pencabutan Status Sebagai PMI": "Prosedur dan Berkas yang Diperlukan:<br>1. Surat Permohonan. <br>2. Menyertakan Foto Copy KTP dan KK. <br>3. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>4. Menyertakan Foto Copy Paspor <br>5. Surat Pernyataan yang dibuat oleh yang bersangkutan. <br>6. Surat Pernyataan jaminan. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Panduan Pendaftaran Calon Pekerja Migran Indonesia ": "Untuk Pendaftaran sebagai Calon PMI saudara bisa melihat panduan dengan mendownload panduan dibawah ini<br><br><a href='/file/Panduan CPMI.pdf' class='btn btn-warning' download><i class='bx bx-download'></i> Download Panduan</a><br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini."
  }),
  loket2_bp2mi: "+6282141040084",
  detail_bp2mi: "Layanan perlindungan pekerja migran oleh BP2MI.",
  qa_bp2mi: JSON.stringify({
    "Layanan Informasi Penempatan/Job's Info melalui SISKOP2MI (Skema G to G, dan P to P)": "Tata Cara :<br>1. buka website www.siskop2mi.bp2mi.go.id <br>2. klik lowongan <br>3. klik job's yang diinginkan .<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini",
    "Pendaftaran PMI Skema Perseorangan melalui SISKOP2MI": "Tata Cara :<br>1. buka website www.siskop2mi.bp2mi.go.id <br>2. klik pada kolom Mendaftar sebagai PMI Perseorangan <br>3. Pilih penempatan program (Regular, SSW/Specified Skill Worker, Re- entry/Perpanjangan perjanjian Kerja, PTM/Pekerja Teknis Menengah) <br>4. Ketik No. NIK <br>5. Persyaratan Dokumen akan otomatis muncul, baca dan persiapkan dokumen sesuai yang tertera pada halaman tersebut. <br>6. Unduh dokumen Persyaratan berupa Surat Keterangan status perkawinan, surat izin suami/istri/orang tua atau wali dan suket pernyataan bertanggung jawab yang ditandatangani oleh para pihak disertai materai RP. 10.000,-. <br>7. Lanjutkan proses pendaftaran dan isi seluruh identitas serta upload dokumen yang dipersyaratkan. <br>8. Pada halaman akhir pilih BPMI atau P4MI terdekat sesuai domisili untuk melakukan proses verifikasi. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Persyaratan dokumen Perseorangan Regular": "1. surat keterangan status perkawinan, bagi yang telah menikah melampirkan fotokopi buku nikah ((link format surat); <br>2. surat keterangan izin suami atau istri, izin orang tua, atau izin wali yang diketahui oleh kepala desa atau lurah atau sebutan lainnya (link format surat); <br>3. surat keterangan sehat. <br>4. kartu kepesertaan jaminan kesehatan nasional. <br>5. salinan surat panggilan kerja dari Pemberi Kerja berbadan hukum. <br>6. profil Pemberi Kerja berbadan hukum. <br>7. Perjanjian Kerja. <br>8. Paspor. <br>9. Visa Kerja. <br>10. Surat pernyataan bertanggung jawab terhadap segala risiko ketenagakerjaan yang dialami (link format surat); <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Persyaratan dokumen Perseorangan Specified Skill Worker": "1. surat keterangan status perkawinan, bagi yang telah menikah melampirkan fotokopi buku nikah ((link format surat) <br>2. surat keterangan izin suami atau istri, izin orang tua, atau izin wali yang diketahui oleh kepala desa atau lurah atau sebutan lainnya (link format surat) <br>3. surat keterangan sehat <br>4. kartu kepesertaan jaminan kesehatan nasional<br>5. Paspor<br>6. Perjanjian Kerja<br>7. Certificate of Eligibility (CoE)/Resident Card <br>8. Surat pernyataan bertanggung jawab terhadap segala risiko ketenagakerjaan yang dialami. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Persyaratan dokumen Perseorangan Perpanjangan perjanjian Kerja": "1. Paspor.<br>2. Perjanjian Kerja Baru.<br>3. Visa kerja/izin kerja/permanent resident(sesuai ketentuan yang berlaku di negara penempatan).<br>4. Memiliki jaminan sosial ketenagakerjaan, dan/atau asuransi sesuai dengan jangka waktu perpanjangan Perjanjian Kerja atau pembaharuan Perjanjian Kerja.<br>5. Surat cuti dari Pemberi Kerja. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Persyaratan dokumen Perseorangan Pekerja Teknis Menengah": "1. surat keterangan status perkawinan, bagi yang telah menikah melampirkan fotokopi buku nikah (link format surat).<br>2. surat keterangan izin suami atau istri, izin orang tua, atau izin wali yang diketahui oleh kepala desa atau lurah atau sebutan lainnya (link format surat).<br>3. Surat keterangan sehat.<br>4. Kartu kepesertaan jaminan kesehatan nasional (BPJS Kesehatan).<br>5. Surat Izin Kerja dari Ministry of Labor Taiwan.<br>6. Surat Pernyataan Mematuhi Peraturan di Taiwan dari Ministry of Labor Taiwan; 7. Perjanjian Kerja yang telah dilegalisasi oleh KDEI Taipei.<br>8. Paspor.<br>9. Visa Kerja.<br>10. Surat pernyataan bertanggung jawab terhadap segala risiko ketenagakerjaan yang dialami .<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini"
  }),
  loket3_verifikasi_data: "+6282141040084",
  detail_verifikasi: "Verifikasi data kependudukan dan validasi dokumen.",
  qa_verifikasi: JSON.stringify({
    "Verifikasi data kependudukan": "Berkas yang diperlukan: <br>1. Ektp <br>2. kk<br>3. id siap kerja<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini."
  }),
  loket6_bpjs: "+6282141040084",
  detail_bpjs: "Layanan jaminan sosial tenaga kerja BPJS.",
  qa_bpjs: JSON.stringify({
    "PERSYARATAN PENDAFTARAN BPJS KETENAGAKERJAAN PMI": "(DIPASTIKAN SUDAH VERIFIKASI DATA DI BP2MI)<br>1. KTP.<br>2.PASPOR.<br>3.PERJANJIAN KERJA.<br>4. NOMOR WA<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "PERSYARATAN KLAIM JAMINAN JKK": "1. Kartu Peserta BPJS Ketenagakerjaan.<br>2. Paspor.<br>3. Surat Keterangan dari Pemberi Kerja, Perwakilan Republik Indonesia, KDEI, atau instansi pemerintah di bidang ketenagakerjaan.<br>4. Resume medis dari rumah sakit atau fasilitas kesehatan di negara tujuan penempatan; 5. Bukti pembayaran biaya transportasi di negara tujuan penempatan.<br>6. Rekening tabungan atas nama PMI atau rekening tabungan dari pihak lain yang membayar terlebih dahulu.<br>7. Bukti pembayaran atau dokumen lainnya yang terkait dengan Kecelakaan Kerja.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "PERSYARATAN KLAIM JAMINAN JKM": "Layanan ini merupakan media pengajuan klaim jaminan kematian untuk kategori klaim dengan sebab :<br>1. Meninggal dunia karena sakit.<br>2. Meninggal dunia karena kecelakaan yang ridak berhubungan dengan pekerjaan.<br><br>Demi kelancaran proses klaim Bapak/Ibu dapat menyiapkan dokumen sebagai berikut:<br>1. Kartu Peserta BPJS Ketenagakerjaan.<br>2. KTP ahli waris (wajib) dan KTP peserta (jika masih ada).<br>3. Surat keterangan kematian dari pejabat yang berwenang.<br>4. Kartu keluarga ahli waris (wajib) dan kartu keluarga peserta (jika masih ada).<br>5. Surat keterangan ahli waris dari pejabat yang berwenang.<br>6. Buku rekening atas nama ahli waris (pada halaman yang tertera nomor rekening dan masih aktif).<br>7. Foto diri ahli waris yang terbaru (tampak depan).<br>8. Formulir pengajuan klaim JKM.<br><br>Adapun manfaat beasiswa (maksimal untuk 2 orang anak) bagi PMI yang meninggal dunia pada masa selama bekerja dapat menyampaikan dokumen sebagai berikut:<br>1. Akta Lahir Anak.<br>2. Kartu Keluarga.<br>5. Kartu tanda penduduk atau bukti identitas lainnya dari Anak penerima manfaat beasiswa.<br>6. Rekening tabungan atas nama anak penerima manfaat beasiswa.<br>Pastikan seluruh dokumen di atas sudah lengkap untuk melanjutkan ke tahap berikutnya.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini."
  }),
  loket7_imigrasi: "+6282228888134",
  detail_imigrasi: "Layanan keimigrasian terpadu (Paspor & Data).",
  qa_imigrasi: JSON.stringify({
    "Permohonan Paspor untuk PMI P2P": "Syarat yang diperlukan:<br>1. Ektp.<br>2. Kk.<br>3. Akte.<br>4. Surat permohonan P3MI.<br>5.Id siap kerja.<br>6. Ijazah.<br>7. Buku nikah. (opsional)<br>7. Paspor lama. (jika sudah punya)<br>8. Surat ijin keluarga yang diketahui oleh kelurahan atau desa.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Permohonan paspor untuk PMI G2G": "Syarat yang diperlukan:<br>1. Ektp.<br>2. Kk.<br>3. Akte.<br>4. Surat permohonan P3MI.<br>5.Id siap kerja.<br>6. Ijazah.<br>7. Buku nikah. (opsional)<br>7. Surat permohonan dari imigrasi<br>8. Kontrak kerja yang sudah di validasi oleh kbri sesuai negara penempatan.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Perubahan data paspor": "Syarat yang diperlukan:<br>1.Surat penetapan pengadilan<br>2. Ektp.<br>3. Kk.<br>.4.Id siap kerja.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini."
  }),
  konselor_1_name: "Defrina Sukma Satiti, S.IP",
  konselor_1_wa: "+6285732747920",
  konselor_1_img: "/images/profil_DEFRINA.jpg",
  konselor_2_name: "Siti Halimatus Sa'diyah, S.E",
  konselor_2_wa: "+6285335909931",
  konselor_2_img: "/images/profil_Siti.jpg",
  konselor_3_name: "Suprayitna, S.H",
  konselor_3_wa: "+6282141040084",
  konselor_3_img: "/images/profil_suprayitna.jpg",
  konselor_4_name: "Dina Nur Fitriani, S.Psi",
  konselor_4_wa: "+6285648323939",
  konselor_4_img: "/images/profil_dina.jpg",
  konselor_5_name: "Ferdianto, S.Psi",
  konselor_5_wa: "+6281232926465",
  konselor_5_img: "/images/profil_Ferdianto.jpg",
  link_informasi_penempatan: "https://forms.gle/bsq9WMS4RxmFB9pM7",
  qa_faq: JSON.stringify({
    "Pembuatan Paspor PMI": "Dokumen yang Diperlukan:<br>1. Surat Permohonan dari PPPMI. <br>2. Lampiran Surat Permohonan. <br>3. Surat Ijin Kel. Diketahui Kepdes/Lurah. <br>4. Menyertakan Foto Copy KTP dan KK.<br>5. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>6. Menyertakan Foto Copy Surat Nikah / Akte Cerai. <br>7. Rekom dari Disnaker Kab/Kota. <br>8. Terregistrasi ID SISKOTKALN.<br>9. SIP (Surat ijin Pengerahan) Negara Tujuan. <br><br> Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Layanan Pengadaan Rekomendasi Paspor PMI Mandiri": "Berkas yang Diperlukan:<br>1. Surat Rekomendasi Paspor dari LTSA-PMI Jatim. <br>2. Menyertakan Foto Copy KTP dan KK. <br>3.  Surat Ijin Kel. Diketahui Kepdes/Lurah. <br>4. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>5. Menyertakan Foto Copy Surat Nikah / Akte Cerai <br>6. Draft Kontrak Kerja/Job Offer/Surat Panggilan Kerja dari Perusahaan. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Layanan Pencabutan Status Sebagai PMI": "Prosedur dan Berkas yang Diperlukan:<br>1. Surat Permohonan. <br>2. Menyertakan Foto Copy KTP dan KK. <br>3. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>4. Menyertakan Foto Copy Paspor <br>5. Surat Pernyataan yang dibuat oleh yang bersangkutan. <br>6. Surat Pernyataan jaminan. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Layanan Informasi Penempatan/Job's Info melalui SISKOP2MI": "Tata Cara :<br>1. buka website www.siskop2mi.bp2mi.go.id <br>2. klik lowongan <br>3. klik job's yang diinginkan .<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini",
    "Pendaftaran PMI Skema Perseorangan melalui SISKOP2MI": "Tata Cara :<br>1. buka website www.siskop2mi.bp2mi.go.id <br>2. klik pada kolom Mendaftar sebagai PMI Perseorangan <br>3. Pilih penempatan program (Regular, SSW/Specified Skill Worker, Re- entry/Perpanjangan perjanjian Kerja, PTM/Pekerja Teknis Menengah) <br>4. Ketik No. NIK <br>5. Persyaratan Dokumen akan otomatis muncul, baca dan persiapkan dokumen sesuai yang tertera pada halaman tersebut. <br>6. Unduh dokumen Persyaratan berupa Surat Keterangan status perkawinan, surat izin suami/istri/orang tua atau wali dan suket pernyataan bertanggung jawab yang ditandatangani oleh para pihak disertai materai RP. 10.000,-. <br>7. Lanjutkan proses pendaftaran dan isi seluruh identitas serta upload dokumen yang dipersyaratkan. <br>8. Pada halaman akhir pilih BPMI atau P4MI terdekat sesuai domisili untuk melakukan proses verifikasi. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "PERSYARATAN PENDAFTARAN BPJS KETENAGAKERJAAN PMI": "(DIPASTIKAN SUDAH VERIFIKASI DATA DI BP2MI)<br>1. KTP.<br>2.PASPOR.<br>3.PERJANJIAN KERJA.<br>4. NOMOR WA<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
    "Permohonan Paspor untuk PMI P2P": "Syarat yang diperlukan:<br>1. Ektp.<br>2. Kk.<br>3. Akte.<br>4. Surat permohonan P3MI.<br>5.Id siap kerja.<br>6. Ijazah.<br>7. Buku nikah. (opsional)<br>7. Paspor lama. (jika sudah punya)<br>8. Surat ijin keluarga yang diketahui oleh kelurahan atau desa.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini."
  }),
  detail_konselor: "Silahkan Konsultasi Kerja dan Pengaduan dengan Konselor yang tersedia pada saat jam kerja.",
};

async function ensureWaConfig() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wa_config (
        id SERIAL PRIMARY KEY,
        config_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    const { rows } = await pool.query("SELECT id FROM wa_config LIMIT 1");
    if (rows.length === 0) {
      await pool.query("INSERT INTO wa_config (config_json) VALUES ($1)", [JSON.stringify(DEFAULT_WA_CONFIG)]);
    }
  } catch (err) {
    console.error("DB Error in ensureWaConfig:", err);
  }
}

async function readWaConfig() {
  try {
    await ensureWaConfig();
    const { rows } = await pool.query("SELECT config_json FROM wa_config ORDER BY id ASC LIMIT 1");
    if (rows.length > 0) {
      const parsed = typeof rows[0].config_json === 'string' ? JSON.parse(rows[0].config_json) : rows[0].config_json;
      return { ...DEFAULT_WA_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error("Gagal membaca wa_config dari DB:", err);
  }
  return { ...DEFAULT_WA_CONFIG };
}

async function writeWaConfig(next) {
  try {
    const current = await readWaConfig();
    const merged = { ...current, ...(next || {}) };
    await pool.query("UPDATE wa_config SET config_json=$1, updated_at=NOW()", [JSON.stringify(merged)]);
    return merged;
  } catch (err) {
    console.error("Gagal menulis wa_config ke DB:", err);
    throw err;
  }
}

// Public endpoint (dipakai oleh front-end untuk membuat link wa.me).
router.get("/wa-config", async (req, res) => {
  const config = await readWaConfig();
  return res.json(config);
});

// Admin update WA config (database-backed).
router.post("/admin/wa-config", requireAdminAuth, async (req, res) => {
  try {
    const allowedKeys = Object.keys(DEFAULT_WA_CONFIG);
    const body = req.body || {};

    const next = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        next[key] = String(body[key]).trim();
      }
    }

    const saved = await writeWaConfig(next);
    return res.status(200).json({ ok: true, config: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Gagal menyimpan konfigurasi layanan.");
  }
});

// Download template Excel untuk import data.
// Kolom yang diharapkan: nama, nomer_hp, alamat, jenis_keperluan, tanggal
router.get("/template-daftar-hadir.xlsx", (req, res) => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Petunjuk Pengisian
  const instructions = [
    ["PETUNJUK PENGISIAN IMPORT DAFTAR HADIR"],
    [""],
    ["1. Kolom Wajib diisi (Sheet 'Template'):"],
    ["   - nama: Nama lengkap pengunjung."],
    ["   - nomer_hp: Nomor telepon aktif."],
    ["   - alamat: Alamat domisili."],
    ["   - jenis_keperluan: Keperluan (Harus sesuai dengan daftar di bawah)."],
    ["   - tanggal: Tanggal kunjungan (Format: DD/MM/YYYY)."],
    [""],
    ["2. Daftar Jenis Keperluan yang Valid (HANYA INI):"],
    ...ADMIN_JENIS_KEPERLUAN.map((j) => ["   - " + j]),
    [""],
    ["3. PENTING: Mohon jangan mengubah nama header (baris pertama) di sheet 'Template'. | nama | nomer_hp | alamat | jenis_keperluan | tanggal |"],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Petunjuk Pengisian");

  // 2. Sheet Template Data
  const headers = ["nama", "nomer_hp", "alamat", "jenis_keperluan", "tanggal"];
  const sampleRow = [
    "Nama Contoh",
    "081234567890",
    "Alamat contoh",
    "Layanan Informasi",
    "29/04/2026",
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // Sheet referensi isi dropdown jenis_keperluan (biar jelas inputnya harus sama persis)
  const wsJenis = XLSX.utils.aoa_to_sheet([
    ["jenis_keperluan"],
    ...ADMIN_JENIS_KEPERLUAN.map((j) => [j]),
  ]);
  XLSX.utils.book_append_sheet(wb, wsJenis, "Referensi Jenis");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="daftar-hadir-template.xlsx"'
  );
  res.send(buffer);
});

router.post("/submit", (req, res) => {
  const { nama, no_telpon, alamat, jenis_keperluan } = req.body;
  const query = {
    text: `INSERT INTO daftar_hadir (nama, nomer_hp, alamat, jenis_keperluan, tanggal)
           VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
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

router.post(
  "/import-daftar-hadir",
  requireAdminAuth,
  upload.single("excel"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("File Excel wajib diupload.");
      }

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
        cellDates: true,
      });
      const worksheet = workbook.Sheets["Template"] || workbook.Sheets[workbook.SheetNames[0]];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      if (!rawRows || rawRows.length === 0) {
        return res.status(400).send("Excel tidak berisi data (cek header).");
      }

      // Kalau database tidak tersedia, tetap pastikan proses upload/parsing tidak error.
      if (!dbAvailable) {
        return res.redirect("/admin-data?importDb=unavailable&rows=" + rawRows.length);
      }

      const normalizeKey = (k) => String(k).trim().toLowerCase();
      const getFirstNonEmpty = (obj, keys) => {
        for (const key of keys) {
          const val = obj[key];
          const s = val === null || val === undefined ? "" : String(val).trim();
          if (s) return s;
        }
        return "";
      };

      const normalizePhone = (v) => {
        if (v === null || v === undefined) return "";
        const s = String(v).trim();
        // Hindari menghilangkan leading zero; untuk Excel numeric biasanya sudah hilang,
        // jadi cara terbaik adalah isi nomor HP sebagai teks.
        return s.replace(/\D/g, "");
      };

      const parseExcelDate = (v) => {
        if (v === null || v === undefined) return null;
        if (v instanceof Date) return v;
        const s = String(v).trim();
        if (!s) return null;

        // Format paling aman untuk menghindari shift timezone:
        // contoh: 2026-04-29
        const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymd) {
          const year = Number(ymd[1]);
          const month = Number(ymd[2]);
          const day = Number(ymd[3]);
          return new Date(year, month - 1, day);
        }

        // Format ID yang mungkin: 29/04/2026 atau 29.04.2026
        const dmySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmySlash) {
          const day = Number(dmySlash[1]);
          const month = Number(dmySlash[2]);
          const year = Number(dmySlash[3]);
          return new Date(year, month - 1, day);
        }
        const dmyDot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (dmyDot) {
          const day = Number(dmyDot[1]);
          const month = Number(dmyDot[2]);
          const year = Number(dmyDot[3]);
          return new Date(year, month - 1, day);
        }

        // Jika Excel menyimpan sebagai number (serial date)
        const n = Number(s);
        if (!Number.isNaN(n) && s !== "") {
          const parsed = XLSX.SSF.parse_date_code(n);
          if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
        }

        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) return d;
        return null;
      };

      let inserted = 0;
      let skipped = 0;

      // Insert per-row (simple + predictable). For large files, batch insert bisa dipertimbangkan.
      for (const row of rawRows) {
        const normalized = {};
        for (const k of Object.keys(row)) {
          normalized[normalizeKey(k)] = row[k];
        }

        const nama = getFirstNonEmpty(normalized, ["nama"]);
        const nomer_hp = getFirstNonEmpty(normalized, [
          "nomer_hp",
          "nomer hp",
          "nomor_hp",
          "nomor hp",
          "no_telpon",
          "no telpon",
          "no hp",
          "notelpon",
        ]);
        const alamat = getFirstNonEmpty(normalized, ["alamat"]);
        const jenis_keperluan = getFirstNonEmpty(normalized, [
          "jenis_keperluan",
          "jenis keperluan",
        ]);

        const tanggalRaw = getFirstNonEmpty(normalized, [
          "tanggal",
          "tgl",
          "date",
        ]);
        const tanggal = parseExcelDate(tanggalRaw) || new Date();

        const nomer_hp_norm = normalizePhone(nomer_hp);

        // Validasi dropdown harus sama persis seperti yang ada di sistem.
        if (
          !nama ||
          !nomer_hp_norm ||
          !alamat ||
          !jenis_keperluan ||
          !ADMIN_JENIS_KEPERLUAN.includes(jenis_keperluan)
        ) {
          skipped += 1;
          continue;
        }

        await pool.query(
          `INSERT INTO daftar_hadir (nama, nomer_hp, alamat, jenis_keperluan, tanggal)
           VALUES ($1, $2, $3, $4, $5)`,
          [nama, nomer_hp_norm, alamat, jenis_keperluan, tanggal]
        );
        inserted += 1;
      }

      // Setelah import, arahkan kembali ke halaman admin agar data ter-refresh.
      // (Admin page akan auto-GET /get-data saat load.)
      return res.redirect("/admin-data");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Gagal import Excel.");
    }
  }
);

router.get("/get-data", requireAdminAuth, (req, res) => {
  if (!dbAvailable) {
    return res.json([]);
  }
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
