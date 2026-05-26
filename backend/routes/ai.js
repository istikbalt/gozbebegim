const express = require("express");
const router = express.Router();

// Yerel Akıllı Öneri Listesi (Gemini API Key bulunmadığında veya hata durumunda Fallback olarak çalışır)
function getLocalAISuggestions(age, gender, budget, interest) {
  const years = Number(age || 0);
  const lowerInterest = (interest || "").toLowerCase();

  let suggestions = [];

  if (years < 1) {
    suggestions = [
      { name: "Oyun Halısı (Piyanolu)", category: "Eğitici", description: "Bebeklerin kaba motor becerilerini ve müzikal duyularını geliştirir.", price_estimate: 800 },
      { name: "Diş Kaşıyıcı Peluş Oyuncak", category: "Bebek", description: "Diş çıkarma dönemindeki kaşıntıyı azaltan, organik peluş.", price_estimate: 250 },
      { name: "Bebek Uyku Telsizi", category: "Güvenlik", description: "Yüksek ses hassasiyetine sahip, anne babanın içi rahat etsin diye.", price_estimate: 1200 },
      { name: "İlk Yaşım Anı Kitabı", category: "Anı", description: "Bebeğinizin tüm ilklerini kaydedebileceğiniz premium albüm.", price_estimate: 350 },
      { name: "Müslin Bez Seti (4'lü)", category: "Kıyafet", description: "%100 organik pamuk, çok amaçlı yumuşak dokulu örtü seti.", price_estimate: 300 }
    ];
  } else if (years >= 1 && years < 3) {
    suggestions = [
      { name: "Bultak Eğitici Kova", category: "Eğitici", description: "El-göz koordinasyonunu ve geometrik şekilleri tanımayı destekler.", price_estimate: 200 },
      { name: "İlk Adım Arabası (Yürüteç)", category: "Gelişim", description: "Bebeğin güvenle ilk adımlarını atmasını sağlayan ahşap yürüteç.", price_estimate: 950 },
      { name: "Ahşap Blok Seti (50 Parça)", category: "Oyuncak", description: "Denge kurma ve hayal gücünü geliştiren doğal boyalı bloklar.", price_estimate: 400 },
      { name: "Sesli Çocuk Kitapları Seti", category: "Kitap", description: "Hayvan sesleri ve temel kelimeleri eğlenceli şekilde öğretir.", price_estimate: 350 },
      { name: "Bebek Aktivite Masası", category: "Eğitici", description: "Işıklı, müzikli ve birçok ince motor beceri aktivitesi sunar.", price_estimate: 1500 }
    ];
  } else if (years >= 3 && years < 7) {
    suggestions = [
      { name: "Lego Duplo Büyük Set", category: "Lego/Yapım", description: "Küçük eller için özel tasarlanmış dev lego parçaları.", price_estimate: 750 },
      { name: "Pedalsız Denge Bisikleti", category: "Spor/Aktivite", description: "Denge kontrolünü geliştiren, pedallı bisiklete geçişi kolaylaştıran ürün.", price_estimate: 1800 },
      { name: "Katlanabilir Çocuk Oyun Çadırı", category: "Oyuncak", description: "Kendi odasında veya bahçede kendine ait özel bir oyun köşesi yaratır.", price_estimate: 500 },
      { name: "Kinetik Kum ve Kalıp Seti", category: "Sanat", description: "Ev kirlenmeden oyun hamuru benzeri kumla motor beceriler geliştirir.", price_estimate: 300 },
      { name: "Eğitici Türkçe Kutu Oyunu", category: "Zeka", description: "Görsel hafıza ve eşleştirme yeteneğini artıran çocuk oyunu.", price_estimate: 450 }
    ];
  } else {
    // 7 yaş ve üzeri
    suggestions = [
      { name: "Lego Creator 3'ü 1 Arada", category: "Lego/Yapım", description: "Tek bir kutudan 3 farklı model yapabilmeyi sağlayan yaratıcı set.", price_estimate: 900 },
      { name: "Çocuk Akıllı Saat (GPS)", category: "Teknoloji", description: "Ebeveyn kontrolü, konum takibi ve sesli görüşme sunan saat.", price_estimate: 2500 },
      { name: "Mikroskop Seti (Eğitici)", category: "Bilim", description: "Doğayı ve mikro dünyayı keşfetmesini sağlayan 1200x büyütmeli set.", price_estimate: 1100 },
      { name: "Monopoly Junior", category: "Zeka", description: "Klasik Monopoly oyununun çocuklara özel basitleştirilmiş eğlenceli versiyonu.", price_estimate: 500 },
      { name: "Ergonomik Okul Sırt Çantası", category: "Eğitim", description: "Sırt ve omurga sağlığını destekleyen, bol bölmeli hafif çanta.", price_estimate: 800 }
    ];
  }

  // İlgi alanına göre filtrele / özelleştir
  if (lowerInterest) {
    if (lowerInterest.includes("lego") || lowerInterest.includes("yapım")) {
      suggestions.unshift({ name: "Lego Classic Yapım Kutusu", category: "Lego", description: "Hayal gücünü sınırlamayan yüzlerce renkli klasik lego parçası.", price_estimate: 600 });
    }
    if (lowerInterest.includes("resim") || lowerInterest.includes("boyama") || lowerInterest.includes("sanat")) {
      suggestions.unshift({ name: "Ahşap Şövale ve Boyama Seti", category: "Sanat", description: "Akrilik boya, fırça ve tuvallerle küçük ressamlar için şövale set.", price_estimate: 750 });
    }
    if (lowerInterest.includes("spor") || lowerInterest.includes("bisiklet") || lowerInterest.includes("aktivite")) {
      suggestions.unshift({ name: "3 Tekerlekli Işıklı Scooter", category: "Spor", description: "Tekerlekleri hareket ettikçe ışık yanan şık çocuk scooterı.", price_estimate: 1100 });
    }
    if (lowerInterest.includes("uzay") || lowerInterest.includes("bilim")) {
      suggestions.unshift({ name: "Projeksiyonlu Teleskop Seti", category: "Bilim", description: "Odasının tavanına takımyıldızları yansıtan ve gökyüzünü izleten set.", price_estimate: 1350 });
    }
  }

  // Bütçeye göre filtrele (Girilmişse bütçenin %30 yukarısına kadar izin ver)
  const maxBudget = Number(budget || 999999);
  let filtered = suggestions.filter(s => s.price_estimate <= maxBudget * 1.3);
  
  if (filtered.length === 0) {
    filtered = suggestions; // Boş kalmaması için
  }

  // Trendyol/Amazon arama linklerini ekle
  return filtered.slice(0, 10).map(item => {
    const query = encodeURIComponent(item.name);
    return {
      ...item,
      search_link: `https://www.trendyol.com/sr?q=${query}`
    };
  });
}

// POST /api/ai/suggest - Çocuk Bilgilerine Göre AI Hediye Önerileri Üret
router.post("/suggest", async (req, res) => {
  const { age, gender, budget, interest } = req.body;

  const childAge = age ? Number(age) : 0;
  const childGender = gender || "Bilinmiyor";
  const searchBudget = budget ? Number(budget) : 1000;
  const searchInterest = interest || "";

  // 1. Eğer Gemini API Key varsa gerçek Gemini API'sini çağır
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("[AI Assistant] Gemini API ile hediye önerileri üretiliyor...");
      const prompt = `Sen Türkiye'de çalışan bir dijital çocuk hediye önerme asistanısın. Bana ${childAge} yaşında ${childGender !== 'Bilinmiyor' ? childGender + ' cinsiyetinde' : ''} ve ilgi alanları "${searchInterest}" olan bir çocuk için bütçesi ${searchBudget} TL civarında olan 10 adet premium hediye önerisi sun. Yanıtını MUTLAK SURETLE şu JSON formatında ver (başka hiçbir açıklama, markdown bloğu veya süsleme olmasın, doğrudan geçerli bir JSON array döndür):
[
  {
    "name": "Hediye Adı",
    "category": "Kategori",
    "description": "Neden harika bir hediye olduğunun açıklaması.",
    "price_estimate": 450,
    "search_link": "https://www.trendyol.com/sr?q=..."
  }
]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const textResponse = responseData.candidates[0].content.parts[0].text;
        
        let parsedSuggestions = JSON.parse(textResponse);
        if (Array.isArray(parsedSuggestions)) {
          // Arama linklerini doğrula veya Trendyol olarak yeniden ata
          parsedSuggestions = parsedSuggestions.map(item => {
            const query = encodeURIComponent(item.name);
            return {
              ...item,
              search_link: item.search_link || `https://www.trendyol.com/sr?q=${query}`
            };
          });

          return res.json({
            success: true,
            source: "Gemini AI Engine 🤖",
            suggestions: parsedSuggestions
          });
        }
      } else {
        console.warn("[AI Assistant] Gemini API hata döndü, yerel önerilere geçiliyor.");
      }
    } catch (apiError) {
      console.error("[AI Assistant] Gemini API bağlantı hatası:", apiError.message);
    }
  }

  // 2. API Anahtarı yoksa veya hata oluştuysa yerel akıllı önerileri döndür (Bulletproof Fallback)
  console.log("[AI Assistant] Yerel akıllı öneriler yükleniyor (Fallback)...");
  const localSuggestions = getLocalAISuggestions(childAge, childGender, searchBudget, searchInterest);
  
  res.json({
    success: true,
    source: "Gözbebeğim Akıllı Öneri Motoru 🧠",
    suggestions: localSuggestions
  });
});

module.exports = router;
