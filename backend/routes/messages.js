const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/messages - Genel pano tebrik mesajı ekleme
router.post("/", async (req, res) => {
  const { org_id, user_name, message, parent_id, is_time_capsule, unlock_date, media_url, media_type } = req.body;

  if (!org_id || !user_name || !message) {
    return res.status(400).json({ success: false, error: "Eksik bilgi girdiniz." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO general_messages 
       (org_id, user_name, message, parent_id, likes, is_time_capsule, unlock_date, media_url, media_type) 
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [
        org_id,
        user_name,
        message,
        parent_id || null,
        is_time_capsule ? 1 : 0,
        unlock_date || null,
        media_url || null,
        media_type || 'Text'
      ]
    );

    res.status(201).json({
      success: true,
      message: "Mesaj başarıyla eklendi.",
      message_data: {
        id: result.insertId,
        org_id,
        user_name,
        message,
        parent_id: parent_id || null,
        likes: 0,
        is_time_capsule: is_time_capsule ? 1 : 0,
        unlock_date: unlock_date || null,
        media_url: media_url || null,
        media_type: media_type || 'Text',
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error("Add general message error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/messages/like/:messageId - Mesajı beğen
router.post("/like/:messageId", async (req, res) => {
  const { messageId } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE general_messages SET likes = likes + 1 WHERE id = ?",
      [messageId]
    );

    // Güncel beğeni sayısını çek
    const [msgs] = await pool.query("SELECT likes FROM general_messages WHERE id = ?", [messageId]);
    if (msgs.length === 0) {
      return res.status(404).json({ success: false, error: "Mesaj bulunamadı." });
    }

    res.json({
      success: true,
      likes: msgs[0].likes
    });
  } catch (error) {
    console.error("Like message error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// PUT /api/messages/:messageId - Mesajı düzenle
router.put("/:messageId", async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Mesaj boş bırakılamaz." });
  }

  try {
    await pool.query("UPDATE general_messages SET message = ? WHERE id = ?", [message, messageId]);
    res.json({ success: true, message: "Mesaj başarıyla güncellendi." });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// DELETE /api/messages/:messageId - Mesajı sil
router.delete("/:messageId", async (req, res) => {
  const { messageId } = req.params;

  try {
    await pool.query("DELETE FROM general_messages WHERE id = ?", [messageId]);
    res.json({ success: true, message: "Mesaj başarıyla silindi." });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/messages/contact-form - İletişim Formu Mesajı Kaydetme
router.post("/contact-form", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Lütfen adınızı, e-posta adresinizi ve mesajınızı doldurun." });
  }

  try {
    await pool.query(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject || null, message]
    );

    res.json({
      success: true,
      message: "Mesajınız başarıyla alınmıştır! En kısa sürede sizinle iletişime geçeceğiz. 🌸"
    });
  } catch (error) {
    console.error("Save contact message error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası oluştu. Mesajınız gönderilemedi." });
  }
});

module.exports = router;
