const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/messages - Genel pano tebrik mesajı ekleme
router.post("/", async (req, res) => {
  const { org_id, user_name, message, parent_id } = req.body;

  if (!org_id || !user_name || !message) {
    return res.status(400).json({ success: false, error: "Eksik bilgi girdiniz." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO general_messages (org_id, user_name, message, parent_id, likes) VALUES (?, ?, ?, ?, 0)",
      [org_id, user_name, message, parent_id || null]
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

module.exports = router;
