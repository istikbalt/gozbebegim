const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// Yaşa Göre Dinamik Şablon Seçim Fonksiyonu
function getTemplatesForEvent(type, age, ageMilestone) {
  const eventAge = Number(ageMilestone || age || 0);

  if (type === "Yaş Günü") {
    if (eventAge < 3) {
      return [
        { name: "Bebek aktivite masası", category: "Eğitim", is_group: 0 },
        { name: "Peluş uyku oyuncağı", category: "Oyuncak", is_group: 0 },
        { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 3 },
        { name: "İlk yaşım anı albümü", category: "Anı", is_group: 0 },
        { name: "Bebek giysi seti", category: "Kıyafet", is_group: 0 }
      ];
    } else if (eventAge >= 3 && eventAge < 7) {
      return [
        { name: "Scooter (3 Tekerlekli)", category: "Spor/Aktivite", is_group: 0 },
        { name: "Lego Duplo büyük set", category: "Oyuncak", is_group: 0 },
        { name: "Akülü Araba", category: "Oyuncak", is_group: 1, group_target: 4 },
        { name: "Resimli hikaye kitapları", category: "Eğitim", is_group: 0 },
        { name: "Oyun çadırı", category: "Oyuncak", is_group: 0 }
      ];
    } else { // 7 yaş ve üzeri (Kız/Erkek büyük çocuk)
      return [
        { name: "Bisiklet (20 Jant)", category: "Spor/Aktivite", is_group: 1, group_target: 2 },
        { name: "Lego Technic / Creator Seti", category: "Oyuncak", is_group: 0 },
        { name: "Çocuk Akıllı Saat", category: "Teknoloji", is_group: 1, group_target: 3 },
        { name: "Eğitici kutu oyunları (Monopoly)", category: "Oyuncak", is_group: 0 },
        { name: "Okul sırt çantası (Ergonomik)", category: "Eğitim", is_group: 0 },
        { name: "Genç kitap serisi (10 Kitap)", category: "Eğitim", is_group: 0 }
      ];
    }
  }

  if (type === "Sünnet") {
    if (eventAge < 5) {
      return [
        { name: "Sünnet kıyafeti seti", category: "Kıyafet", is_group: 0 },
        { name: "Altın takısı (Çeyrek)", category: "Para/Değerli", is_group: 0 },
        { name: "Uzaktan kumandalı küçük araba", category: "Oyuncak", is_group: 0 },
        { name: "Nakit takı havuzu", category: "Para", is_group: 0 }
      ];
    } else { // 5 yaş ve üzeri
      return [
        { name: "Sünnet kıyafeti seti", category: "Kıyafet", is_group: 0 },
        { name: "Altın takısı (Çeyrek)", category: "Para/Değerli", is_group: 0 },
        { name: "Bisiklet (20 Jant)", category: "Spor/Aktivite", is_group: 1, group_target: 3 },
        { name: "Tablet Katkı Havuzu", category: "Teknoloji", is_group: 1, group_target: 4 },
        { name: "Lego Harry Potter / Ninjago Seti", category: "Oyuncak", is_group: 0 }
      ];
    }
  }

  if (type === "Doğum") {
    return [
      { name: "Bebek arabası", category: "Ulaşım", is_group: 0 },
      { name: "Uyku tulumu x3", category: "Kıyafet", is_group: 0 },
      { name: "Küvet seti", category: "Banyo", is_group: 0 },
      { name: "Pike takımı", category: "Uyku", is_group: 0 },
      { name: "Oyuncak seti", category: "Oyuncak", is_group: 0 },
      { name: "Giysi seti", category: "Kıyafet", is_group: 0 },
      { name: "500₺ para hediyesi", category: "Para", is_group: 0 },
      { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 3 },
      { name: "Emzik seti", category: "Beslenme", is_group: 0 },
      { name: "Bebek monitörü", category: "Güvenlik", is_group: 0 },
      { name: "Banyo seti", category: "Banyo", is_group: 0 }
    ];
  }

  if (type === "Mezuniyet") {
    return [
      { name: "Çocuk Akıllı Saat", category: "Teknoloji", is_group: 1, group_target: 3 },
      { name: "Okul sırt çantası (Ergonomik)", category: "Eğitim", is_group: 0 },
      { name: "Dünya Klasikleri serisi", category: "Eğitim", is_group: 0 },
      { name: "Mikroskop seti (Eğitici)", category: "Eğitim", is_group: 0 }
    ];
  }

  return [];
}

// GET /api/organizations/search - Veli adı/soyadı, e-posta veya telefon ile organizasyon ara
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json({ success: true, organizations: [] });
  }

  const searchTerm = `%${q.trim()}%`;
  try {
    const [orgs] = await pool.query(
      `SELECT o.*, c.name AS child_name, c.gender AS child_gender, 
              u.first_name AS parent_first_name, u.last_name AS parent_last_name
       FROM organizations o 
       JOIN children c ON o.child_id = c.id 
       JOIN users u ON o.parent_id = u.id
       WHERE u.first_name LIKE ? 
          OR u.last_name LIKE ? 
          OR u.email LIKE ? 
          OR u.phone_number LIKE ?
          OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
       ORDER BY o.date DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    res.json({ success: true, organizations: orgs });
  } catch (error) {
    console.error("Search organizations error:", error);
    res.status(500).json({ success: false, error: "Arama hatası oluştu." });
  }
});

// GET /api/organizations/parent/:parentId - Annenin tüm organizasyonlarını listele
router.get("/parent/:parentId", async (req, res) => {
  try {
    const [orgs] = await pool.query(
      `SELECT o.*, c.name AS child_name, c.gender AS child_gender, c.age AS child_age 
       FROM organizations o 
       JOIN children c ON o.child_id = c.id 
       WHERE o.parent_id = ? 
       ORDER BY o.date DESC`,
      [req.params.parentId]
    );
    res.json({ success: true, organizations: orgs });
  } catch (error) {
    console.error("Fetch parent orgs error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// GET /api/organizations/slug/:parentSlug/:orgSlug - Tek bir organizasyonun detaylarını slug ile getir (Misafir Sayfası)
router.get("/slug/:parentSlug/:orgSlug", async (req, res) => {
  const { parentSlug, orgSlug } = req.params;

  try {
    const [orgs] = await pool.query(
      `SELECT o.*, c.name AS child_name, c.gender AS child_gender, c.age AS child_age,
              u.first_name AS parent_first_name, u.last_name AS parent_last_name
       FROM organizations o 
       JOIN children c ON o.child_id = c.id
       JOIN users u ON o.parent_id = u.id
       WHERE o.parent_slug = ? AND o.slug = ?`,
      [parentSlug, orgSlug]
    );

    if (orgs.length === 0) {
      return res.status(404).json({ success: false, error: "Organizasyon bulunamadı." });
    }

    const org = orgs[0];

    // İlgili hediyeleri getir
    const [gifts] = await pool.query(
      "SELECT * FROM gifts WHERE org_id = ? ORDER BY is_bought ASC, created_at DESC",
      [org.id]
    );

    // Hediye yorumlarını getir
    const giftIds = gifts.map(g => g.id);
    let comments = [];
    if (giftIds.length > 0) {
      const [gc] = await pool.query(
        "SELECT * FROM gift_comments WHERE gift_id IN (?) ORDER BY created_at ASC",
        [giftIds]
      );
      comments = gc;
    }

    // Hediyeleri yorumlarıyla birleştir
    const giftsWithComments = gifts.map(g => {
      return {
        ...g,
        comments: comments.filter(c => c.gift_id === g.id)
      };
    });

    // Pano genel tebrik mesajlarını getir
    const [messages] = await pool.query(
      "SELECT * FROM general_messages WHERE org_id = ? ORDER BY created_at DESC",
      [org.id]
    );

    res.json({
      success: true,
      organization: org,
      gifts: giftsWithComments,
      messages: messages
    });
  } catch (error) {
    console.error("Fetch org by slug error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

// POST /api/organizations - Yeni Organizasyon Başlat (Çocuk Seç/Ekle ve Şablon Listeyi Doldur)
router.post("/", async (req, res) => {
  const {
    parent_id,
    child_id,          // Mevcut çocuk ID'si (varsa)
    new_child_name,    // VEYA Yeni çocuk bilgileri
    new_child_gender,
    new_child_age,     // Doğum tarihi yerine YAŞ (Güven endişesini çözer)
    type,              // Doğum, Sünnet vb.
    date,              // Tören tarihi
    city,
    hospital,
    notes,
    age_milestone      // Tören anındaki yaş dönemi (Yaş günü/Sünnet için kaç yaşında olduğu)
  } = req.body;

  if (!parent_id || !type || !date || !city) {
    return res.status(400).json({ success: false, error: "Eksik bilgi girdiniz." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let finalChildId = child_id;

    // 1. Eğer yeni çocuk ekleniyorsa ekle
    if (!finalChildId && new_child_name) {
      const [childResult] = await connection.query(
        "INSERT INTO children (parent_id, name, gender, age) VALUES (?, ?, ?, ?)",
        [parent_id, new_child_name, new_child_gender || 'Bilinmiyor', new_child_age || null]
      );
      finalChildId = childResult.insertId;
    }

    if (!finalChildId) {
      throw new Error("Lütfen bir çocuk seçin veya yeni çocuk ekleyin.");
    }

    // Çocuk bilgilerini çek
    const [children] = await connection.query("SELECT name, age FROM children WHERE id = ?", [finalChildId]);
    const child = children[0];
    const childName = child.name;
    const childAge = child.age;

    // Ebeveyn isimlerini al (Slug oluşturmak için)
    const [parents] = await connection.query("SELECT first_name, last_name FROM users WHERE id = ?", [parent_id]);
    const parent = parents[0];

    // Slug ve Parent_Slug oluşturma
    // Örn: Ayşe Demir -> ayse-demir
    const parentSlug = `${parent.first_name}-${parent.last_name}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    // Örn: Zeynep Doğum 2025 -> zeynep-dogum-2025
    const year = new Date(date).getFullYear();
    const typeEnglish = type === "Doğum" ? "dogum" : type === "Sünnet" ? "sunnet" : type === "Yaş Günü" ? "yasgunu" : "mezuniyet";
    const slug = `${childName}-${typeEnglish}-${year}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    // Kaçıncı yaş günü olduğunu başlığa ekle
    let title = `${childName}'in ${type} Organizasyonu`;
    if (type === "Yaş Günü" && age_milestone) {
      title = `${childName}'in ${age_milestone}. Yaş Günü Kutlaması`;
    }

    // 2. Organizasyonu ekle
    const [orgResult] = await connection.query(
      `INSERT INTO organizations (parent_id, child_id, type, slug, parent_slug, title, date, city, hospital, notes, age_milestone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [parent_id, finalChildId, type, slug, parentSlug, title, date, city, hospital || null, notes || null, age_milestone || null]
    );
    const orgId = orgResult.insertId;

    // 3. Yaşa göre dinamik şablon listeyi belirle ve ekle
    const selectedAge = age_milestone || childAge || 0;
    const templateGifts = getTemplatesForEvent(type, childAge, selectedAge);

    for (const gift of templateGifts) {
      await connection.query(
        `INSERT INTO gifts (org_id, name, category, is_group, group_target)
         VALUES (?, ?, ?, ?, ?)`,
        [orgId, gift.name, gift.category, gift.is_group, gift.is_group ? gift.group_target : 1]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Organizasyon ve hediye listesi başarıyla oluşturuldu.",
      url: `/${parentSlug}/${slug}`,
      org_id: orgId
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create org error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Sunucu hatası oluştu." });
  } finally {
    connection.release();
  }
});

module.exports = router;
