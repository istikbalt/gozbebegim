const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/circles - Yeni Aile Çemberi Oluştur
router.post("/", async (req, res) => {
  const { creator_id, name } = req.body;

  if (!creator_id || !name) {
    return res.status(400).json({ success: false, error: "Eksik bilgi girdiniz." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Benzersiz 6 karakterli davet kodu üret
    let inviteCode = "";
    let exists = true;
    while (exists) {
      inviteCode = "FAM" + Math.floor(100 + Math.random() * 900); // Örn: FAM482
      const [rows] = await connection.query("SELECT id FROM family_circles WHERE invite_code = ?", [inviteCode]);
      if (rows.length === 0) exists = false;
    }

    // 1. Çemberi ekle
    const [circleResult] = await connection.query(
      "INSERT INTO family_circles (name, creator_id, invite_code) VALUES (?, ?, ?)",
      [name, creator_id, inviteCode]
    );
    const circleId = circleResult.insertId;

    // 2. Oluşturan kişiyi Admin olarak ekle
    await connection.query(
      "INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, 'Admin')",
      [circleId, creator_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Aile Çemberiniz başarıyla oluşturuldu! 🎉",
      circle: {
        id: circleId,
        name,
        invite_code: inviteCode
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create circle error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  } finally {
    connection.release();
  }
});

// POST /api/circles/join - Davet Kodu ile Çembere Katıl
router.post("/join", async (req, res) => {
  const { user_id, invite_code } = req.body;

  if (!user_id || !invite_code) {
    return res.status(400).json({ success: false, error: "Lütfen davet kodunu girin." });
  }

  const codeUpper = invite_code.trim().toUpperCase();

  try {
    // Çemberi bul
    const [circles] = await pool.query("SELECT * FROM family_circles WHERE invite_code = ?", [codeUpper]);
    if (circles.length === 0) {
      return res.status(404).json({ success: false, error: "Geçersiz davet kodu! Lütfen kontrol edin." });
    }

    const circle = circles[0];

    // Kullanıcı zaten üye mi kontrol et
    const [existing] = await pool.query(
      "SELECT role FROM circle_members WHERE circle_id = ? AND user_id = ?",
      [circle.id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Bu Aile Çemberine zaten katılmışsınız." });
    }

    // Çembere üye olarak ekle
    await pool.query(
      "INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, 'Member')",
      [circle.id, user_id]
    );

    res.json({
      success: true,
      message: `${circle.name} çemberine başarıyla katıldınız! 🤗`,
      circle
    });
  } catch (error) {
    console.error("Join circle error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// GET /api/circles/user/:userId - Kullanıcının dahil olduğu çemberleri ve üyelerini getir
router.get("/user/:userId", async (req, res) => {
  try {
    // Kullanıcının üye olduğu çemberler
    const [circles] = await pool.query(
      `SELECT fc.*, cm.role AS my_role 
       FROM family_circles fc 
       JOIN circle_members cm ON fc.id = cm.circle_id 
       WHERE cm.user_id = ? 
       ORDER BY fc.created_at DESC`,
      [req.params.userId]
    );

    const circleIds = circles.map(c => c.id);
    let allMembers = [];
    if (circleIds.length > 0) {
      const [members] = await pool.query(
        `SELECT cm.circle_id, cm.role, u.id AS user_id, u.first_name, u.last_name, u.email, u.phone_number
         FROM circle_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.circle_id IN (?)`,
        [circleIds]
      );
      allMembers = members;
    }

    // Çemberleri üyeleriyle birleştir
    const circlesWithMembers = circles.map(c => ({
      ...c,
      members: allMembers.filter(m => m.circle_id === c.id)
    }));

    res.json({ success: true, circles: circlesWithMembers });
  } catch (error) {
    console.error("Fetch user circles error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// GET /api/circles/events/:circleId - Aile Çemberindeki çocukların yaklaşan etkinliklerini/doğum günlerini listele
router.get("/events/:circleId", async (req, res) => {
  try {
    // Çember üyelerinin çocuklarına ait organizasyonları getir
    const [events] = await pool.query(
      `SELECT o.*, c.name AS child_name, c.gender AS child_gender, c.age AS child_age,
              u.first_name AS parent_first_name, u.last_name AS parent_last_name
       FROM circle_members cm
       JOIN children c ON cm.user_id = c.parent_id
       JOIN organizations o ON c.id = o.child_id
       JOIN users u ON cm.user_id = u.id
       WHERE cm.circle_id = ?
       ORDER BY o.date ASC`,
      [req.params.circleId]
    );

    res.json({ success: true, events });
  } catch (error) {
    console.error("Fetch circle events error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

module.exports = router;
