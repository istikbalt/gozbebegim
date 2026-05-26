const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// POST /api/gifting - Misafir Altın/Para (Takı) EFT bildiriminde bulunur
router.post("/", async (req, res) => {
  const { org_id, buyer_name, buyer_phone, gift_type, amount, is_anonymous } = req.body;

  if (!org_id || !buyer_name || !buyer_phone || !gift_type) {
    return res.status(400).json({ success: false, error: "Eksik bilgi girdiniz." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO gold_and_cash_gifts (org_id, buyer_name, buyer_phone, gift_type, amount, is_anonymous, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        org_id,
        buyer_name,
        buyer_phone,
        gift_type,
        gift_type === 'Nakit Para' ? amount : null,
        is_anonymous ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: "EFT bildiriminiz başarıyla iletildi. Ebeveyn kontrolünden sonra takı sandığına eklenecektir. Teşekkür ederiz! 🪙",
      gift_id: result.insertId
    });
  } catch (error) {
    console.error("Submit gold/cash gift error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// GET /api/gifting/org/:orgId - Organizasyona ait tüm takıları listele (Ebeveyn veya Misafir listesi için)
router.get("/org/:orgId", async (req, res) => {
  try {
    const [gifts] = await pool.query(
      "SELECT * FROM gold_and_cash_gifts WHERE org_id = ? ORDER BY created_at DESC",
      [req.params.orgId]
    );
    res.json({ success: true, gifts });
  } catch (error) {
    console.error("Fetch gold/cash gifts error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/gifting/confirm/:giftId - Ebeveyn gelen takıyı/EFT'yi onaylar
router.post("/confirm/:giftId", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE gold_and_cash_gifts SET status = 'Confirmed' WHERE id = ?",
      [req.params.giftId]
    );
    res.json({ success: true, message: "Takı başarıyla onaylandı ve sandığa eklendi! 💎" });
  } catch (error) {
    console.error("Confirm gold/cash gift error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// DELETE /api/gifting/:giftId - Ebeveyn gelen takıyı reddeder/siler
router.delete("/:giftId", async (req, res) => {
  try {
    await pool.query("DELETE FROM gold_and_cash_gifts WHERE id = ?", [req.params.giftId]);
    res.json({ success: true, message: "Takı bildirimi silindi." });
  } catch (error) {
    console.error("Delete gold/cash gift error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

module.exports = router;
