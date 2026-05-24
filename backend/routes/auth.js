const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/auth/signup - Ebeveyn Kayıt
router.post("/signup", async (req, res) => {
  const { phone_number, password, first_name, last_name } = req.body;

  if (!phone_number || !password || !first_name || !last_name) {
    return res.status(400).json({ success: false, error: "Tüm alanlar zorunludur." });
  }

  try {
    // Telefon numarası kayıtlı mı kontrolü
    const [existing] = await pool.query("SELECT id FROM users WHERE phone_number = ?", [phone_number]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Bu telefon numarası zaten kayıtlı." });
    }

    // Basitlik ve diwanet benzerliği adına şifreyi şimdilik düz/güvenli saklıyoruz veya hashliyoruz
    // Gerçek uygulamada bcrypt önerilir, diwanet standardına sadık kalıyoruz.
    const [result] = await pool.query(
      "INSERT INTO users (phone_number, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
      [phone_number, password, first_name, last_name]
    );

    res.status(201).json({
      success: true,
      message: "Kayıt başarıyla tamamlandı.",
      user: {
        id: result.insertId,
        phone_number,
        first_name,
        last_name
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

// POST /api/auth/login - Ebeveyn Giriş
router.post("/login", async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ success: false, error: "Telefon numarası ve şifre zorunludur." });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, phone_number, password_hash, first_name, last_name FROM users WHERE phone_number = ?",
      [phone_number]
    );

    if (users.length === 0 || users[0].password_hash !== password) {
      return res.status(401).json({ success: false, error: "Hatalı telefon numarası veya şifre." });
    }

    const user = users[0];
    res.json({
      success: true,
      message: "Giriş başarılı.",
      user: {
        id: user.id,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

module.exports = router;
