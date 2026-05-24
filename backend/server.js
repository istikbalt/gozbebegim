require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./database/db");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Tüm origin'lere izin ver
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Statik Dosyalar (assets vb. için)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/organizations", require("./routes/organizations"));
app.use("/api/gifts", require("./routes/gifts"));
app.use("/api/messages", require("./routes/messages"));

// --- CLEAN HTML ROUTES (Ugly .html uzantılarını gizlemek için) ---
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dashboard.html"));
});

app.get("/create-organization", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "create-organization.html"));
});

// --- PRETTY URL ROUTE FOR SPECIFIC ORGANIZATIONS ---
// Örn: gozbebegim.com/ayse-demir/zeynep-dogum-2025
app.get("/:parentSlug/:orgSlug", (req, res, next) => {
  // Eğer parametreler assets veya api ise atla
  if (req.params.parentSlug === "api" || req.params.parentSlug === "assets") {
    return next();
  }
  res.sendFile(path.join(__dirname, "..", "frontend", "profil.html"));
});

// Ana Sayfa (Landing / Coming soon)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// Health check API
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ success: true, db: rows[0].ok === 1 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Gözbebeğim server running on port ${PORT}`);
});
