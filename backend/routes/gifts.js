const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/gifts - Manuel hediye ekleme (Misafir veya Ebeveyn listeye olmayan bir hediye eklediğinde)
router.post("/", async (req, res) => {
  const { org_id, name, category, buyer_name, buyer_phone, is_anonymous } = req.body;

  if (!org_id || !name || !category) {
    return res.status(400).json({ success: false, error: "Organizasyon, hediye adı ve kategori zorunludur." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO gifts (org_id, name, category, buyer_name, buyer_phone, is_bought, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        org_id,
        name,
        category,
        buyer_name || null,
        buyer_phone || null,
        buyer_name ? 2 : 0, // Manuel girilmişse doğrudan "Alındı (2)" olarak işaretle
        is_anonymous ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: "Hediye başarıyla eklendi.",
      gift_id: result.insertId
    });
  } catch (error) {
    console.error("Add custom gift error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/gifts/buy/:giftId - Hediyeyi Rezerve Et / Biri Alacak Olarak İşaretle (Aşama 1)
router.post("/buy/:giftId", async (req, res) => {
  const { giftId } = req.params;
  const { buyer_name, buyer_phone, is_anonymous } = req.body;

  if (!buyer_name || !buyer_phone) {
    return res.status(400).json({ success: false, error: "İsim ve telefon numarası doğrulaması zorunludur." });
  }

  try {
    // Mevcut hediye durumunu çek
    const [gifts] = await pool.query("SELECT * FROM gifts WHERE id = ?", [giftId]);
    if (gifts.length === 0) {
      return res.status(404).json({ success: false, error: "Hediye bulunamadı." });
    }

    const gift = gifts[0];

    if (gift.is_bought === 2) {
      return res.status(400).json({ success: false, error: "Bu hediye zaten alınmış." });
    }

    if (gift.is_group) {
      // Grup hediyesi katkısı
      const newCurrent = gift.group_current + 1;
      const isNowBought = newCurrent >= gift.group_target ? 2 : 0; // Hedef tamamlandıysa Alındı (2), yoksa Açık (0)

      // Katılımcı ismini ekle
      let newBuyerName = gift.buyer_name ? `${gift.buyer_name} · ${buyer_name}` : buyer_name;
      if (is_anonymous) {
        newBuyerName = gift.buyer_name ? `${gift.buyer_name} · Anonim` : "Anonim";
      }

      await pool.query(
        `UPDATE gifts 
         SET group_current = ?, is_bought = ?, buyer_name = ?, buyer_phone = ?, is_anonymous = ?
         WHERE id = ?`,
        [newCurrent, isNowBought, newBuyerName, buyer_phone, is_anonymous ? 1 : 0, giftId]
      );

      res.json({
        success: true,
        message: isNowBought === 2 ? "Tebrikler, grup hediyesi tamamlandı!" : "Grup hediyesine katkınız eklendi.",
        gift: { ...gift, group_current: newCurrent, is_bought: isNowBought, buyer_name: newBuyerName }
      });
    } else {
      // Normal hediye için Rezerve Etme (Aşama 1 -> is_bought = 1)
      await pool.query(
        `UPDATE gifts 
         SET is_bought = 1, buyer_name = ?, buyer_phone = ?, is_anonymous = ?
         WHERE id = ?`,
        [buyer_name, buyer_phone, is_anonymous ? 1 : 0, giftId]
      );

      res.json({
        success: true,
        message: "Hediye başarıyla rezerve edildi.",
        gift: { ...gift, is_bought: 1, buyer_name: is_anonymous ? "Anonim" : buyer_name }
      });
    }
  } catch (error) {
    console.error("Reserve gift error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/gifts/bought/:giftId - Hediyenin Alındığını/Satın Alındığını Doğrula (Aşama 3)
router.post("/bought/:giftId", async (req, res) => {
  const { giftId } = req.params;
  const { gift_link, gift_photo } = req.body;

  try {
    const [gifts] = await pool.query("SELECT * FROM gifts WHERE id = ?", [giftId]);
    if (gifts.length === 0) {
      return res.status(404).json({ success: false, error: "Hediye bulunamadı." });
    }

    // Alındı (2) durumuna çek ve link/fotoğrafı kaydet
    await pool.query(
      `UPDATE gifts 
       SET is_bought = 2, gift_link = ?, gift_photo = ?
       WHERE id = ?`,
      [gift_link || null, gift_photo || null, giftId]
    );

    res.json({
      success: true,
      message: "Hediye alımı başarıyla onaylandı ve tamamlandı."
    });
  } catch (error) {
    console.error("Finalize bought gift error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/gifts/comment/:giftId - Hediyenin altına mikro yorum yaz
router.post("/comment/:giftId", async (req, res) => {
  const { giftId } = req.params;
  const { user_name, comment } = req.body;

  if (!user_name || !comment) {
    return res.status(400).json({ success: false, error: "İsim ve yorum boş bırakılamaz." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO gift_comments (gift_id, user_name, comment) VALUES (?, ?, ?)",
      [giftId, user_name, comment]
    );

    res.status(201).json({
      success: true,
      message: "Yorum eklendi.",
      comment: {
        id: result.insertId,
        gift_id: Number(giftId),
        user_name,
        comment,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error("Add gift comment error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

module.exports = router;
