const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/auth/signup - Ebeveyn & Üye Kayıt
router.post("/signup", async (req, res) => {
  const { phone_number, email, password, first_name, last_name } = req.body;

  if (!password || !first_name || !last_name) {
    return res.status(400).json({ success: false, error: "Şifre, ad ve soyad alanları zorunludur." });
  }

  if (!phone_number && !email) {
    return res.status(400).json({ success: false, error: "Kayıt için en azından Telefon veya E-posta girilmelidir." });
  }

  try {
    // Telefon numarası kayıtlı mı kontrolü
    if (phone_number) {
      const [existingPhone] = await pool.query("SELECT id FROM users WHERE phone_number = ?", [phone_number]);
      if (existingPhone.length > 0) {
        return res.status(400).json({ success: false, error: "Bu telefon numarası zaten kayıtlı." });
      }
    }

    // E-posta kayıtlı mı kontrolü
    if (email) {
      const [existingEmail] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ success: false, error: "Bu e-posta adresi zaten kayıtlı." });
      }
    }

    // Basitlik ve diwanet benzerliği adına şifreyi şimdilik düz saklıyoruz
    const [result] = await pool.query(
      "INSERT INTO users (phone_number, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      [phone_number || null, email || null, password, first_name, last_name]
    );

    res.status(201).json({
      success: true,
      message: "Kayıt başarıyla tamamlandı.",
      user: {
        id: result.insertId,
        phone_number: phone_number || null,
        email: email || null,
        first_name,
        last_name
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

// POST /api/auth/login - Ebeveyn & Üye Giriş
router.post("/login", async (req, res) => {
  const { phone_number, email, password } = req.body;

  // phone_number alanı 'email_or_phone' olarak da kullanılabilir
  const identifier = phone_number || email;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: "Giriş bilgileri ve şifre zorunludur." });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, phone_number, email, password_hash, first_name, last_name FROM users WHERE phone_number = ? OR email = ?",
      [identifier, identifier]
    );

    if (users.length === 0 || users[0].password_hash !== password) {
      return res.status(401).json({ success: false, error: "Hatalı giriş bilgileri veya şifre." });
    }

    const user = users[0];
    res.json({
      success: true,
      message: "Giriş başarılı.",
      user: {
        id: user.id,
        phone_number: user.phone_number,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

// POST /api/auth/guest-signup - frictionless guest signup
router.post("/guest-signup", async (req, res) => {
  const { first_name, last_name, phone_number, email } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ success: false, error: "Ad ve soyad alanları zorunludur." });
  }

  if (!phone_number && !email) {
    return res.status(400).json({ success: false, error: "Kayıt için en azından Telefon veya E-posta girilmelidir." });
  }

  try {
    let existingUser = null;

    // Telefon numarası kayıtlı mı kontrolü
    if (phone_number) {
      const [users] = await pool.query(
        "SELECT id, phone_number, email, first_name, last_name FROM users WHERE phone_number = ?",
        [phone_number]
      );
      if (users.length > 0) {
        existingUser = users[0];
      }
    }

    // E-posta kayıtlı mı kontrolü
    if (!existingUser && email) {
      const [users] = await pool.query(
        "SELECT id, phone_number, email, first_name, last_name FROM users WHERE email = ?",
        [email]
      );
      if (users.length > 0) {
        existingUser = users[0];
      }
    }

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "Mevcut kayıtlı hesabınız tespit edildi ve giriş yapıldı.",
        user: {
          id: existingUser.id,
          phone_number: existingUser.phone_number,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name
        }
      });
    }

    // Eğer kullanıcı yoksa yeni bir geçici şifreli gerçek hesap açıyoruz
    const tempPassword = Math.random().toString(36).slice(-8); // 8 karakterli rastgele şifre
    const [result] = await pool.query(
      "INSERT INTO users (phone_number, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      [phone_number || null, email || null, tempPassword, first_name, last_name]
    );

    res.status(201).json({
      success: true,
      message: "Misafir hesabınız başarıyla oluşturuldu ve oturum açıldı.",
      user: {
        id: result.insertId,
        phone_number: phone_number || null,
        email: email || null,
        first_name,
        last_name
      }
    });
  } catch (error) {
    console.error("Guest signup error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

// GET /api/auth/children/:parentId - Ebeveynin tüm çocuklarını listele
router.get("/children/:parentId", async (req, res) => {
  try {
    const [children] = await pool.query(
      "SELECT * FROM children WHERE parent_id = ? ORDER BY name ASC",
      [req.params.parentId]
    );
    res.json({ success: true, children });
  } catch (error) {
    console.error("Fetch children error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/auth/forgot-password - Şifre Sıfırlama Kodu Talebi
router.post("/forgot-password", async (req, res) => {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return res.status(400).json({ success: false, error: "Lütfen kayıtlı e-posta veya telefon numaranızı girin." });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, email, phone_number, first_name FROM users WHERE email = ? OR phone_number = ?",
      [emailOrPhone, emailOrPhone]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "Girdiğiniz e-posta veya telefon numarasıyla kayıtlı bir kullanıcı bulunamadı." });
    }

    const user = users[0];
    // 6 haneli güvenli sıfırlama kodu üret
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli

    await pool.query(
      "UPDATE users SET reset_code = ?, reset_expires = ? WHERE id = ?",
      [resetCode, resetExpires, user.id]
    );

    console.log(`[PASSWORD RESET] Generated code for user ${user.id} (${emailOrPhone}): ${resetCode}`);

    res.json({
      success: true,
      message: "Şifre sıfırlama kodunuz başarıyla oluşturuldu. 🎉",
      debug_code: resetCode // Test kolaylığı açısından ekranda doğrudan gösterilecek
    });
  } catch (error) {
    console.error("Forgot password request error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

// POST /api/auth/reset-password - Şifre Yenileme
router.post("/reset-password", async (req, res) => {
  const { emailOrPhone, resetCode, newPassword } = req.body;

  if (!emailOrPhone || !resetCode || !newPassword) {
    return res.status(400).json({ success: false, error: "Lütfen tüm alanları doldurun." });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, reset_code, reset_expires FROM users WHERE email = ? OR phone_number = ?",
      [emailOrPhone, emailOrPhone]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "Kullanıcı bulunamadı." });
    }

    const user = users[0];

    if (!user.reset_code || user.reset_code !== String(resetCode)) {
      return res.status(400).json({ success: false, error: "Girdiğiniz sıfırlama kodu geçersiz." });
    }

    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ success: false, error: "Sıfırlama kodunun süresi dolmuş. Lütfen tekrar kod talep edin." });
    }

    // Şifreyi güncelle ve sıfırlama kodlarını temizle
    await pool.query(
      "UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?",
      [newPassword, user.id]
    );

    res.json({
      success: true,
      message: "Şifreniz başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz. 🔐"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu." });
  }
});

module.exports = router;
