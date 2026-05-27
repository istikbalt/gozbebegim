const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// Yaş, Cinsiyet ve Kategoriye Göre Akıllı Dinamik Şablon Seçim Fonksiyonu
function getTemplatesForEvent(type, age, ageMilestone, gender) {
  const eventAge = Number(ageMilestone || age || 0);
  const childGender = String(gender || "Bilinmiyor").trim();

  // 1. DOĞUM (Yenidoğan İhtiyaçları)
  if (type === "Doğum") {
    if (childGender === "Kız") {
      return [
        { name: "Kız bebek giysi seti (Pembe/Ekru)", category: "Kıyafet", is_group: 0 },
        { name: "Pembe organik bebek battaniyesi", category: "Uyku", is_group: 0 },
        { name: "Kız bebek saç bandı ve patiği seti", category: "Kıyafet", is_group: 0 },
        { name: "Peluş tavşan uyku arkadaşı", category: "Oyuncak", is_group: 0 },
        { name: "Kız bebek şampuan & bakım seti", category: "Banyo", is_group: 0 },
        { name: "Bebek arabası (Travel sistem)", category: "Ulaşım", is_group: 1, group_target: 3 },
        { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 2 },
        { name: "Bebek telsizi & monitörü", category: "Güvenlik", is_group: 0 },
        { name: "Altın takısı (Çeyrek Altın)", category: "Takı & Altın", is_group: 0 }
      ];
    } else if (childGender === "Erkek") {
      return [
        { name: "Erkek bebek giysi seti (Mavi/Ekru)", category: "Kıyafet", is_group: 0 },
        { name: "Mavi organik bebek battaniyesi", category: "Uyku", is_group: 0 },
        { name: "Erkek bebek papyonlu tulum ve patiği seti", category: "Kıyafet", is_group: 0 },
        { name: "Peluş ayı uyku arkadaşı", category: "Oyuncak", is_group: 0 },
        { name: "Erkek bebek şampuan & bakım seti", category: "Banyo", is_group: 0 },
        { name: "Bebek arabası (Travel sistem)", category: "Ulaşım", is_group: 1, group_target: 3 },
        { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 2 },
        { name: "Bebek telsizi & monitörü", category: "Güvenlik", is_group: 0 },
        { name: "Altın takısı (Çeyrek Altın)", category: "Takı & Altın", is_group: 0 }
      ];
    } else {
      return [
        { name: "Unisex pamuklu bebek giysi seti", category: "Kıyafet", is_group: 0 },
        { name: "Unisex soft organik bebek battaniyesi", category: "Uyku", is_group: 0 },
        { name: "Eğitici oyun halısı (Baby play gym)", category: "Oyuncak", is_group: 0 },
        { name: "Bebek bakım sırt çantası", category: "Diğer", is_group: 0 },
        { name: "Bebek arabası (Travel sistem)", category: "Ulaşım", is_group: 1, group_target: 3 },
        { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 2 },
        { name: "Bebek telsizi & monitörü", category: "Güvenlik", is_group: 0 },
        { name: "Altın takısı (Çeyrek Altın)", category: "Takı & Altın", is_group: 0 }
      ];
    }
  }

  // 2. SÜNNET (Geleneksel ve Yaşa Uygun Hediyeler)
  if (type === "Sünnet") {
    if (eventAge < 5) {
      return [
        { name: "Sünnet kıyafeti ve şapkası seti", category: "Kıyafet", is_group: 0 },
        { name: "Uzaktan kumandalı drifter araba", category: "Oyuncak", is_group: 0 },
        { name: "Lego Duplo büyük set", category: "Oyuncak", is_group: 0 },
        { name: "Çocuk Akıllı Saat (Mavi)", category: "Teknoloji", is_group: 1, group_target: 2 },
        { name: "Altın takısı (Çeyrek Altın)", category: "Takı & Altın", is_group: 0 },
        { name: "Nakit takı havuzu (EFT)", category: "Takı & Altın", is_group: 0 }
      ];
    } else {
      return [
        { name: "Sünnet kıyafeti ve pelerini seti", category: "Kıyafet", is_group: 0 },
        { name: "Bisiklet (20 Jant - Dağ Tipi)", category: "Spor/Aktivite", is_group: 1, group_target: 3 },
        { name: "Lego Ninjago büyük set", category: "Oyuncak", is_group: 0 },
        { name: "Çocuk Akıllı Saat (Mavi)", category: "Teknoloji", is_group: 1, group_target: 2 },
        { name: "PlayStation 5 Katkı Havuzu", category: "Teknoloji", is_group: 1, group_target: 5 },
        { name: "Altın takısı (Çeyrek Altın)", category: "Takı & Altın", is_group: 0 }
      ];
    }
  }

  // 3. MEZUNİYET (Yaşa Göre Eğitim ve Başarı Hediyeleri)
  if (type === "Mezuniyet") {
    if (eventAge <= 10) { // İlkokul mezuniyeti
      if (childGender === "Kız") {
        return [
          { name: "Sevimli mezuniyet elbisesi (Kız)", category: "Kıyafet", is_group: 0 },
          { name: "Instax Mini anlık kamera (Pembe)", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Çocuk Akıllı Saat (Pembe)", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Eğitici kutu oyunları (Monopoly/Tabu)", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Genç kitap serisi (10 Kitap)", category: "Eğitim/Kitap", is_group: 0 }
        ];
      } else {
        return [
          { name: "Şık mezuniyet takımı (Erkek)", category: "Kıyafet", is_group: 0 },
          { name: "Mikroskop seti (Eğitici/Işıklı)", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Çocuk Akıllı Saat (Mavi)", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Lego Creator 3'ü 1 arada set", category: "Oyuncak", is_group: 0 },
          { name: "Macera kitapları serisi (10 Kitap)", category: "Eğitim/Kitap", is_group: 0 }
        ];
      }
    } else if (eventAge > 10 && eventAge <= 14) { // Ortaokul mezuniyeti
      return [
        { name: "Kablosuz bluetooth kulak üstü kulaklık", category: "Teknoloji", is_group: 0 },
        { name: "Akıllı bileklik / spor takip saati", category: "Teknoloji", is_group: 0 },
        { name: "Ergonomik okul sırt çantası", category: "Eğitim/Kitap", is_group: 0 },
        { name: "Dünya Klasikleri serisi (15 Kitap)", category: "Eğitim/Kitap", is_group: 0 },
        { name: "Teleskop başlangıç seti", category: "Eğitim/Kitap", is_group: 1, group_target: 2 }
      ];
    } else { // Lise ve üzeri mezuniyet
      return [
        { name: "Kablosuz gürültü engelleyici kulaklık", category: "Teknoloji", is_group: 1, group_target: 2 },
        { name: "E-kitap okuyucu (Kindle Touch)", category: "Teknoloji", is_group: 1, group_target: 3 },
        { name: "Üniversite hazırlık kitapları seti", category: "Eğitim/Kitap", is_group: 0 },
        { name: "Taşınabilir bluetooth hoparlör", category: "Teknoloji", is_group: 0 },
        { name: "Şık mezuniyet deri sırt çantası", category: "Kıyafet", is_group: 0 }
      ];
    }
  }

  // 4. YAŞ GÜNÜ (En Detaylı Bölüm: Cinsiyet ve Yaş Dilimleri)
  if (type === "Yaş Günü") {
    // 4a. BEBEK (0-2 yaş)
    if (eventAge <= 2) {
      if (childGender === "Kız") {
        return [
          { name: "İlk adım pembe ayakkabısı", category: "Kıyafet", is_group: 0 },
          { name: "Konuşan peluş pembe tavşan", category: "Oyuncak", is_group: 0 },
          { name: "Bebek aktivite masası (Pembe)", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 2 },
          { name: "Kız bebek pamuklu doğum günü elbisesi", category: "Kıyafet", is_group: 0 }
        ];
      } else if (childGender === "Erkek") {
        return [
          { name: "İlk adım mavi ayakkabısı", category: "Kıyafet", is_group: 0 },
          { name: "Konuşan eğitici köpekçik", category: "Oyuncak", is_group: 0 },
          { name: "Bebek aktivite masası (Mavi)", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Mama sandalyesi", category: "Beslenme", is_group: 1, group_target: 2 },
          { name: "Erkek bebek papyonlu doğum günü tulumu", category: "Kıyafet", is_group: 0 }
        ];
      } else {
        return [
          { name: "İlk adım unisex bebek patiği", category: "Kıyafet", is_group: 0 },
          { name: "Eğitici aktivite masası", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Montessori ahşap oyuncak seti", category: "Oyuncak", is_group: 0 },
          { name: "Sallanan ahşap at", category: "Oyuncak", is_group: 0 },
          { name: "İlk yaşım anı albümü", category: "Diğer", is_group: 0 }
        ];
      }
    }
    // 4b. OKUL ÖNCESİ (3-5 yaş)
    else if (eventAge >= 3 && eventAge <= 5) {
      if (childGender === "Kız") {
        return [
          { name: "Barbie rüya evi seti", category: "Oyuncak", is_group: 1, group_target: 3 },
          { name: "Lego Duplo aile evi pembe set", category: "Oyuncak", is_group: 0 },
          { name: "3 Tekerlekli pembe scooter", category: "Spor/Aktivite", is_group: 0 },
          { name: "Resimli kız çocuk masal kitapları", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Disney prenses kostümü (Elsa/Pamuk Prenses)", category: "Kıyafet", is_group: 0 }
        ];
      } else if (childGender === "Erkek") {
        return [
          { name: "Hot Wheels çılgın viraj pist seti", category: "Oyuncak", is_group: 0 },
          { name: "Lego Duplo şantiye araçları seti", category: "Oyuncak", is_group: 0 },
          { name: "3 Tekerlekli mavi scooter", category: "Spor/Aktivite", is_group: 0 },
          { name: "Oyuncak ahşap tamir tezgahı seti", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Süper kahraman kostümü (Örümcek Adam/Batman)", category: "Kıyafet", is_group: 0 }
        ];
      } else {
        return [
          { name: "Lego Duplo büyük yaratıcı kutu", category: "Oyuncak", is_group: 0 },
          { name: "Oyun çadırı (Kızılderili temalı unisex)", category: "Oyuncak", is_group: 0 },
          { name: "Akülü araba (Unisex)", category: "Oyuncak", is_group: 1, group_target: 4 },
          { name: "Çocuk oyun kili & oyun hamuru dev seti", category: "Oyuncak", is_group: 0 },
          { name: "Eğitici sesli çocuk hikaye kitapları", category: "Eğitim/Kitap", is_group: 0 }
        ];
      }
    }
    // 4c. ÇOCUK (6-10 yaş)
    else if (eventAge >= 6 && eventAge <= 10) {
      if (childGender === "Kız") {
        return [
          { name: "Pembe 20 Jant sepetli bisiklet", category: "Spor/Aktivite", is_group: 1, group_target: 3 },
          { name: "Lego Friends büyük otel seti", category: "Oyuncak", is_group: 0 },
          { name: "Akıllı çocuk saati (Pembe)", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Kız çocuk boncuklu takı tasarım seti", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Barbie meslekler bebekleri seti", category: "Oyuncak", is_group: 0 }
        ];
      } else if (childGender === "Erkek") {
        return [
          { name: "Mavi 20 Jant dağ bisikleti", category: "Spor/Aktivite", is_group: 1, group_target: 3 },
          { name: "Lego City polis merkezi seti", category: "Oyuncak", is_group: 0 },
          { name: "Akıllı çocuk saati (Mavi)", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Nerf Elite dart tabancası", category: "Oyuncak", is_group: 0 },
          { name: "Uzaktan kumandalı arazi cipi (RC Jeep)", category: "Oyuncak", is_group: 0 }
        ];
      } else {
        return [
          { name: "Bisiklet (20 Jant unisex)", category: "Spor/Aktivite", is_group: 1, group_target: 3 },
          { name: "Lego Creator 3'ü 1 arada set", category: "Oyuncak", is_group: 0 },
          { name: "Akıllı çocuk saati (Siyah/Nötr)", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Eğitici kutu oyunları seti (Monopoly/Scrabble)", category: "Oyuncak", is_group: 0 },
          { name: "Çocuk teleskobu başlangıç seti", category: "Eğitim/Kitap", is_group: 1, group_target: 2 }
        ];
      }
    }
    // 4d. GENÇ (11-18 yaş)
    else {
      if (childGender === "Kız") {
        return [
          { name: "Instax Mini anlık fotoğraf makinesi", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Bluetooth kulaküstü kulaklık (Pembe/Gold)", category: "Teknoloji", is_group: 0 },
          { name: "Dijital çizim tableti ve kalemi", category: "Teknoloji", is_group: 1, group_target: 2 },
          { name: "Genç kız sürükleyici roman seti (10 Kitap)", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Kişisel bakım ve makyaj çantası seti", category: "Diğer", is_group: 0 }
        ];
      } else if (childGender === "Erkek") {
        return [
          { name: "Profesyonel oyuncu kulaklığı & mouse seti", category: "Teknoloji", is_group: 0 },
          { name: "Bluetooth kulaküstü kulaklık (Siyah/Mat)", category: "Teknoloji", is_group: 0 },
          { name: "Lego Technic spor araba seti", category: "Oyuncak", is_group: 0 },
          { name: "Tuttuğu takımın lisanslı orijinal forması", category: "Kıyafet", is_group: 0 },
          { name: "Akıllı bileklik / spor takip saati", category: "Teknoloji", is_group: 0 }
        ];
      } else {
        return [
          { name: "Kablosuz bluetooth kulaküstü kulaklık", category: "Teknoloji", is_group: 0 },
          { name: "Dünya Klasikleri kitap seti (20 Kitap)", category: "Eğitim/Kitap", is_group: 0 },
          { name: "Taşınabilir kablosuz bluetooth hoparlör", category: "Teknoloji", is_group: 0 },
          { name: "Ergonomik genç sırt çantası", category: "Kıyafet", is_group: 0 },
          { name: "Akıllı saat / spor izleme bilekliği", category: "Teknoloji", is_group: 1, group_target: 2 }
        ];
      }
    }
  }

  return [];
}

// GET /api/organizations/search - Veli adı, çocuk adı veya organizasyon başlığı ile ara
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json({ success: true, organizations: [] });
  }

  const searchTerm = `%${q.trim()}%`;
  try {
    const [orgs] = await pool.query(
      `SELECT o.*, c.name AS child_name, c.gender AS child_gender, c.age AS child_age,
              u.first_name AS parent_first_name, u.last_name AS parent_last_name
       FROM organizations o 
       JOIN children c ON o.child_id = c.id 
       JOIN users u ON o.parent_id = u.id
       WHERE u.first_name LIKE ? 
          OR u.last_name LIKE ? 
          OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
          OR c.name LIKE ?
          OR o.title LIKE ?
          OR o.slug LIKE ?
       ORDER BY o.date DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
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

    // Hediyeleri yorumlarıyla birleştir (Misafir anonim/sürpriz seçtiyse ismi sürpriz olarak göster)
    const giftsWithComments = gifts.map(g => {
      const maskedGift = { ...g };
      if (g.is_bought && g.is_anonymous) {
        maskedGift.buyer_name = "🎁 Sürpriz Misafir";
      }

      const filteredComments = comments.filter(c => c.gift_id === g.id);

      return {
        ...maskedGift,
        comments: filteredComments
      };
    });

    // Pano genel tebrik mesajlarını getir (Zaman kapsülü kilitliyse içeriği maskele)
    const [messages] = await pool.query(
      "SELECT * FROM general_messages WHERE org_id = ? ORDER BY created_at DESC",
      [org.id]
    );

    const maskedMessages = messages.map(m => {
      const isLocked = m.is_time_capsule && m.unlock_date && (new Date(m.unlock_date) > new Date());
      if (isLocked) {
        return {
          id: m.id,
          org_id: m.org_id,
          user_name: m.user_name,
          parent_id: m.parent_id,
          likes: m.likes,
          is_time_capsule: m.is_time_capsule,
          unlock_date: m.unlock_date,
          media_type: m.media_type,
          created_at: m.created_at,
          message: "⏳ Bu tebrik mesajı bir Zaman Kapsülü'dür! Geleceğe gönderildi ve kilitlendi. 🤫",
          media_url: null
        };
      }
      return m;
    });

    res.json({
      success: true,
      organization: org,
      gifts: giftsWithComments,
      messages: maskedMessages
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
    age_milestone,     // Tören anındaki yaş dönemi (Yaş günü/Sünnet için kaç yaşında olduğu)
    surprise_mode,     // Sürpriz modu (açılış tarihine kadar isimleri gizler)
    hospital_name,     // Hastane Modu detayları
    hospital_room,
    visit_hours,
    maps_link,
    flower_link
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
    const [children] = await connection.query("SELECT name, age, gender FROM children WHERE id = ?", [finalChildId]);
    const child = children[0];
    const childName = child.name;
    const childAge = child.age;
    const childGender = child.gender || 'Bilinmiyor';

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
      `INSERT INTO organizations (parent_id, child_id, type, slug, parent_slug, title, date, city, hospital, notes, age_milestone, surprise_mode, hospital_name, hospital_room, visit_hours, maps_link, flower_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [parent_id, finalChildId, type, slug, parentSlug, title, date, city, hospital || null, notes || null, age_milestone || null, surprise_mode ? 1 : 0, hospital_name || null, hospital_room || null, visit_hours || null, maps_link || null, flower_link || null]
    );
    const orgId = orgResult.insertId;

    // 3. Yaşa göre dinamik şablon listeyi belirle ve ekle
    const selectedAge = age_milestone || childAge || 0;
    const templateGifts = getTemplatesForEvent(type, childAge, selectedAge, childGender);

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

// PUT /api/organizations/iban/:orgId - IBAN bilgilerini güncelle
router.put("/iban/:orgId", async (req, res) => {
  const { iban, iban_name } = req.body;
  try {
    await pool.query(
      "UPDATE organizations SET iban = ?, iban_name = ? WHERE id = ?",
      [iban || null, iban_name || null, req.params.orgId]
    );
    res.json({ success: true, message: "IBAN bilgileri başarıyla güncellendi. 🎉" });
  } catch (error) {
    console.error("Update IBAN error:", error);
    res.status(500).json({ success: false, error: "Sunucu hatası." });
  }
});

module.exports = router;
