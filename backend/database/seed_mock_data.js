/**
 * Gözbebeğim.com - Premium Database Seeder
 * Generates 100+ users, children, organizations, highly connected nested comments,
 * time capsules, family circles, gold/cash gifts, and realistic platform states.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('./db');

// Helper to generate random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random sub-slice
const pickSome = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper for random number in range
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to slugify strings
const slugify = (text) => {
  const trMap = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', 'â': 'a'
  };
  let slug = text.toString().toLowerCase().trim();
  for (const key in trMap) {
    slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Turkish Dictionaries
const firstNamesFemale = [
  "Ayşe", "Fatma", "Hayriye", "Zeynep", "Elif", "Merve", "Selin", "Pelin", "Derya", "Canan",
  "Büşra", "Yasemin", "Esra", "Kübra", "Hande", "Damla", "İrem", "Berna", "Gamze", "Seda",
  "Melis", "Burcu", "Özge", "Ceyda", "Didem", "Eda", "Gizem", "Tuğba", "Hilal", "Şeyma",
  "Nihan", "Pınar", "Aslı", "Gözde", "Duygu", "Sibel", "Bahar", "Şirin", "Tülay", "Nalan"
];

const firstNamesMale = [
  "Ahmet", "Mehmet", "Mustafa", "Ali", "Veli", "Hasan", "Hüseyin", "Can", "Cem", "Murat",
  "Hakan", "Gökhan", "Serkan", "Erkan", "Burak", "Onur", "Emre", "Eren", "Umut", "Alper",
  "Volkan", "Tolga", "Kaan", "Mert", "Yiğit", "Sinan", "Ozan", "Kerem", "Tuna", "Barış",
  "Semih", "Cihan", "Fatih", "Yavuz", "Selim", "Turgut", "Kadir", "Tamer", "Uğur", "Deniz"
];

const lastNames = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şener",
  "Yavuz", "Karataş", "Tekin", "Yalçın", "Avcı", "Sarı", "Aksoy", "Ateş", "Polat", "Bulut",
  "Aktaş", "Güler", "Yavuz", "Kösem", "Güneş", "Erdoğan", "Şen", "Acar", "Özcan", "Kartal"
];

const babyNamesFemale = [
  "Zeynep", "Defne", "Asel", "Eylül", "Elif", "Duru", "Masal", "Azra", "Yaprak", "Derin",
  "Ada", "Mira", "Melis", "Ela", "Nehir", "Gece", "Güneş", "Arya", "Ayla", "Bade",
  "İpek", "Lina", "Beren", "Ceren", "Öykü", "Damla", "Rüya", "Esila", "Mina", "Dizdar"
];

const babyNamesMale = [
  "Eymen", "Yusuf", "Ömer", "Alperen", "Miraç", "Kerem", "Rüzgar", "Poyraz", "Aras", "Ayaz",
  "Atlas", "Yiğit", "Mert", "Doruk", "Kaan", "Umut", "Baran", "Barlas", "Can", "Selim",
  "Kuzey", "Mete", "Efe", "Yağız", "Göktuğ", "Burak", "Emir", "Bulut", "Kadir", "Batu"
];

const cities = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli",
  "Mersin", "Eskişehir", "Samsun", "Trabzon", "Çanakkale", "Muğla", "Denizli", "Sakarya", "Tekirdağ"
];

const hospitals = [
  "Acıbadem Maslak Hastanesi", "Memorial Şişli Hastanesi", "Liv Hospital Ulus", "Florence Nightingale",
  "Amerikan Hastanesi", "Medipol Mega Üniversite Hastanesi", "Medical Park Göztepe", "Bahçelievler Devlet Hastanesi",
  "Ankara Şehir Hastanesi", "İzmir Kent Hastanesi", "Antalya Anadolu Hastanesi"
];

const giftCommentsDict = [
  "Harika bir hediye seçeneği! Çok beğendim.",
  "Bebeğimize çok yakışacak, sabırsızlıkla bekliyoruz.",
  "Bu hediyeyi almayı çok istiyorduk, kesene bereket!",
  "Biz de aynısını kullanıyoruz, gerçekten çok kullanışlı.",
  "Kalitesi mükemmel bir üründür, harika tercih.",
  "Yavrumuz güle güle kullansın inşallah.",
  "Canım ailemize küçük bir destek, güle güle eskitin.",
  "Zeynep teyzesinden minik kuşa tatlı bir anı.",
  "Dört gözle gelmesini bekliyoruz, sevgiler!",
  "Fotoğraftaki rengi çok tatlıymış."
];

const generalMessagesDict = [
  "Minik yavrumuza sağlıklı, mutlu ve huzurlu bir ömür dileriz. Hoş geldin!",
  "Anne ve babayı tebrik eder, ömür boyu mutluluklar dilerim. Sevgiyle büyüsün.",
  "Yüzündeki gülücükler hiç eksik olmasın güzel yavrum. Doğum günün kutlu olsun!",
  "Vatana, millete ve ailesine hayırlı bir evlat olması dileğiyle. Tebrikler!",
  "Kocaman adam olmuşsun be delikanlı! Sünnetin hayırlı uğurlu olsun.",
  "Mezuniyetini canıgönülden tebrik eder, başarılarının devamını dilerim teyzem.",
  "Güzel ailenizin bu en mutlu gününü paylaşıyor, sevgi ve selamlarımı gönderiyorum.",
  "Aramıza hoş geldin minik bebek. Hayat sana hep güzellikler getirsin.",
  "Gözlerinizdeki ışık hiç sönmesin. Harika bir liste hazırlamışsınız, ellerinize sağlık.",
  "Ablacım tebrik ederim, her şey çok ama çok güzel görünüyor!"
];

const capsuleMessagesDict = [
  "Sevgili yavrum, sen bu mesajı okurken tam 18 yaşında koca bir genç olacaksın. Bu mektubu senin doğum gününde, sen daha mışıl mışıl uyurken yazıyorum. Seni çok seviyoruz.",
  "Güzel yeğenim, 18. yaş günün kutlu olsun! Umarım hayat sana hayal ettiğin tüm güzellikleri getirmiştir. Teyzen her zaman senin yanında, bunu hiç unutma.",
  "Aslan torunum, sünnet olduğun o günü dün gibi hatırlıyorum. Şimdi bu kapsül açıldığında muhtemelen üniversiteye hazırlanıyorsun ya da başladın bile. Dedenden sana ufak bir hatıra.",
  "Büyüdüğünde geriye dönüp bu günleri gülümseyerek hatırlaman için sana bu videolu selamı bırakıyorum. Hayatın boyunca hep mutlu ol canım kızım.",
  "İlk yaş gününde sana bu mektubu bırakıyoruz anneciğim ve babacığım olarak. Adımların hep sağlam, geleceğin hep aydınlık olsun gözbebeğimiz."
];

// Seeding function
async function seed() {
  console.log("🚀 Starting database seeding...");
  const conn = await pool.getConnection();

  try {
    // Disable foreign key checks momentarily to clean up nicely
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE `gold_and_cash_gifts`");
    await conn.query("TRUNCATE TABLE `circle_members`");
    await conn.query("TRUNCATE TABLE `family_circles`");
    await conn.query("TRUNCATE TABLE `general_messages`");
    await conn.query("TRUNCATE TABLE `gift_comments`");
    await conn.query("TRUNCATE TABLE `gifts`");
    await conn.query("TRUNCATE TABLE `organizations`");
    await conn.query("TRUNCATE TABLE `children`");
    await conn.query("TRUNCATE TABLE `users`");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🧹 Existing data cleared completely.");

    // 1. Generate 120 Users
    console.log("👤 Generating 120 realistic users...");
    const users = [];
    const passwordHash = "password123";

    for (let i = 0; i < 120; i++) {
      const isFemale = Math.random() > 0.4;
      const firstName = isFemale ? pick(firstNamesFemale) : pick(firstNamesMale);
      const lastName = pick(lastNames);
      const email = `${slugify(firstName)}.${slugify(lastName)}.${randomRange(10, 999)}@example.com`;
      const phoneNumber = `05${randomRange(30, 59)}${randomRange(100, 999)}${randomRange(10, 99)}${randomRange(10, 99)}`;

      const [res] = await conn.query(
        "INSERT INTO users (first_name, last_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, phoneNumber, passwordHash]
      );
      users.push({
        id: res.insertId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber
      });
    }
    console.log(`✓ 120 Users inserted successfully. Example user: ${users[0].first_name} ${users[0].last_name}`);

    // 2. Generate 60 Children (Assign to first 60 users)
    console.log("👶 Generating 60 children...");
    const children = [];
    for (let i = 0; i < 60; i++) {
      const parent = users[i];
      const gender = Math.random() > 0.5 ? "Kız" : "Erkek";
      const name = gender === "Kız" ? pick(babyNamesFemale) : pick(babyNamesMale);
      const age = randomRange(0, 10);

      const [res] = await conn.query(
        "INSERT INTO children (parent_id, name, gender, age) VALUES (?, ?, ?, ?)",
        [parent.id, name, gender, age]
      );
      children.push({
        id: res.insertId,
        parent_id: parent.id,
        name,
        gender,
        age
      });
    }
    console.log(`✓ 60 Children inserted.`);

    // 3. Generate 60 Organizations (One for each child)
    console.log("🎉 Generating 60 organizations...");
    const organizations = [];
    const eventTypes = ["Doğum", "Yaş Günü", "Sünnet", "Mezuniyet"];

    for (let i = 0; i < 60; i++) {
      const child = children[i];
      const parent = users.find(u => u.id === child.parent_id);
      
      // Select appropriate event type based on gender and age
      let type = pick(eventTypes);
      if (child.gender === "Kız" && type === "Sünnet") {
        type = pick(["Doğum", "Yaş Günü", "Mezuniyet"]);
      }
      if (child.age === 0 && type === "Mezuniyet") {
        type = "Doğum";
      }

      const parentSlug = `${slugify(parent.first_name)}-${slugify(parent.last_name)}`;
      const titleStr = `${child.name}'in ${type === "Doğum" ? "Hoş Geldin Partisi" : type === "Sünnet" ? "Sünnet Şöleni" : type === "Mezuniyet" ? "Mezuniyet Kutlaması" : child.age + ". Yaş Günü"}`;
      const slug = `${slugify(child.name)}-${slugify(type)}-${randomRange(2026, 2027)}`;
      const date = new Date(Date.now() + randomRange(10, 150) * 24 * 60 * 60 * 1000); // 10 to 150 days in the future
      const city = pick(cities);
      
      const surpriseMode = Math.random() > 0.4 ? 1 : 0;
      const hospitalName = type === "Doğum" ? pick(hospitals) : null;
      const hospitalRoom = type === "Doğum" ? `${randomRange(1, 5)}0${randomRange(1, 9)}` : null;
      const visitHours = type === "Doğum" ? "13:00 - 19:00" : null;
      const mapsLink = type === "Doğum" ? "https://maps.google.com/?q=" + encodeURIComponent(hospitalName) : null;
      const flowerLink = type === "Doğum" ? "https://www.ciceksepeti.com" : null;
      const notes = `${child.name} için düzenlediğimiz bu tatlı günde yanımızda olmanız en büyük hediyedir. İhtiyaç listemizi aşağıda bulabilirsiniz.`;

      const [res] = await conn.query(
        `INSERT INTO organizations 
         (parent_id, child_id, type, slug, parent_slug, title, date, city, notes, age_milestone, surprise_mode, hospital_name, hospital_room, visit_hours, maps_link, flower_link) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [parent.id, child.id, type, slug, parentSlug, titleStr, date, city, notes, child.age, surpriseMode, hospitalName, hospitalRoom, visitHours, mapsLink, flowerLink]
      );

      organizations.push({
        id: res.insertId,
        parent_id: parent.id,
        child_id: child.id,
        type,
        slug,
        parent_slug: parentSlug,
        title: titleStr,
        date,
        city,
        surprise_mode: surpriseMode
      });
    }
    console.log(`✓ 60 Organizations inserted.`);

    // 4. Generate 7-12 Gifts per Organization (~550 Gifts in total)
    console.log("🎁 Generating 550+ gifts with dynamic reservation states...");
    const gifts = [];
    
    // Gift list dictionaries based on type
    const dogumGifts = [
      { name: "Bebek Arabası (Kraft Travel)", cat: "Ulaşım" },
      { name: "Mama Sandalyesi (Chicco Polly)", cat: "Beslenme" },
      { name: "Bebek Kamerası & Telsizi (Philips)", cat: "Teknoloji" },
      { name: "Bebek Küveti ve Yıkama Seti", cat: "Banyo" },
      { name: "Park Yatak (Ahşap Oyuncaklı)", cat: "Uyku" },
      { name: "Organik Pamuk Tulum Seti (10 Parça)", cat: "Kıyafet" },
      { name: "Piyanolu Oyun Halısı (Fisher Price)", cat: "Oyuncak" },
      { name: "Bebek Bakım Sırt Çantası", cat: "Aksesuar" },
      { name: "Müslin Ağız Bezi Seti (5'li)", cat: "Kıyafet" },
      { name: "Bebek Kanguru (Ergobaby)", cat: "Ulaşım" },
      { name: "Bebek Güvenlik Bariyer Seti", cat: "Güvenlik" },
      { name: "Göğüs Pompası (Lansinoh Dual)", cat: "Anne İhtiyaç" }
    ];

    const yasGunuGifts = [
      { name: "Akülü Jeep (Pilsan 12V)", cat: "Oyuncak" },
      { name: "3 Tekerlekli Işıklı Scooter", cat: "Aktivite" },
      { name: "Lego Duplo Büyük Hayvanat Bahçesi Seti", cat: "Oyuncak" },
      { name: "Eğitici Aktivite Masası", cat: "Eğitim" },
      { name: "Dev Peluş Ayı (100 cm)", cat: "Oyuncak" },
      { name: "Dünya Çocuk Masalları Serisi (15 Kitap)", cat: "Eğitim" },
      { name: "Ahşap Montessori Denge Blokları", cat: "Oyuncak" },
      { name: "Sanat Çantası ve Akrilik Boya Seti", cat: "Eğitim" },
      { name: "Çocuk Bisikleti (16 Jant)", cat: "Aktivite" },
      { name: "Trambolin (Emniyet Fileli)", cat: "Aktivite" },
      { name: "Kar Küresi ve Işıklı Gece Lambası", cat: "Aksesuar" }
    ];

    const sunnetGifts = [
      { name: "Sünnet Kıyafeti Pelerini ve Aksesuarları", cat: "Kıyafet" },
      { name: "Çocuk Akıllı Saat (Kaan Gps)", cat: "Teknoloji" },
      { name: "Lego Ninjago Ejderha Tapınağı Seti", cat: "Oyuncak" },
      { name: "Eğitici Arduino Robotik Kodlama Kiti", cat: "Eğitim" },
      { name: "Masaüstü Mercekli Mikroskop Seti", cat: "Eğitim" },
      { name: "Uzaktan Kumandalı Yarış Arabası (Dune Buggy)", cat: "Oyuncak" },
      { name: "Sünnet Yatağı Süsleme Seti", cat: "Tören" },
      { name: "Çocuk Pateni (Ayarlanabilir)", cat: "Aktivite" }
    ];

    const mezuniyetGifts = [
      { name: "Android Tablet Bilgisayar (Lenovo)", cat: "Teknoloji" },
      { name: "Ergonomik Okul Sırt Çantası", cat: "Eğitim" },
      { name: "TÜBİTAK Bilim Klasikleri Serisi (10 Kitap)", cat: "Eğitim" },
      { name: "Teleskop Gökyüzü Gözlem Kiti", cat: "Eğitim" },
      { name: "Profesyonel Satranç Takımı (Ahşap Kutulu)", cat: "Oyuncak" },
      { name: "Kulak Üstü Bluetooth Kulaklık (JBL)", cat: "Teknoloji" },
      { name: "Küresel Dünya Atlası ve Işıklı Küre", cat: "Eğitim" },
      { name: "Çizim ve Kara Kalem Sanat Seti", cat: "Eğitim" }
    ];

    for (const org of organizations) {
      const giftPool = org.type === "Doğum" ? dogumGifts : org.type === "Yaş Günü" ? yasGunuGifts : org.type === "Sünnet" ? sunnetGifts : mezuniyetGifts;
      const giftCount = randomRange(7, 12);
      const selectedGifts = pickSome(giftPool, Math.min(giftCount, giftPool.length));

      for (const sg of selectedGifts) {
        const isBoughtState = pick([0, 0, 1, 2]); // 0: Open, 1: Reserved, 2: Bought
        let buyerName = null;
        let buyerPhone = null;
        let buyerUserId = null;
        let isAnonymous = 0;
        let isGroup = Math.random() > 0.85 ? 1 : 0;
        let groupTarget = isGroup ? randomRange(2, 5) : 1;
        let groupCurrent = isGroup && isBoughtState > 0 ? randomRange(1, groupTarget) : 0;
        
        // If current contribution equals target, mark as bought
        let finalBoughtState = isBoughtState;
        if (isGroup && groupCurrent === groupTarget) {
          finalBoughtState = 2;
        }

        if (finalBoughtState > 0) {
          isAnonymous = Math.random() > 0.8 ? 1 : 0;
          
          // Random buyer either from registered users or external name
          if (Math.random() > 0.5) {
            const bUser = pick(users.filter(u => u.id !== org.parent_id));
            buyerUserId = bUser.id;
            buyerName = `${bUser.first_name} ${bUser.last_name}`;
            buyerPhone = bUser.phone_number;
          } else {
            const isFem = Math.random() > 0.5;
            buyerName = `${isFem ? pick(firstNamesFemale) : pick(firstNamesMale)} ${pick(lastNames)}`;
            buyerPhone = `05${randomRange(30, 59)}${randomRange(100, 999)}${randomRange(10, 99)}${randomRange(10, 99)}`;
          }
        }

        const giftLink = `https://www.trendyol.com/sr?q=${encodeURIComponent(sg.name)}`;

        const [res] = await conn.query(
          `INSERT INTO gifts 
           (org_id, name, category, buyer_name, buyer_phone, buyer_user_id, is_bought, is_anonymous, is_group, group_target, group_current, gift_link) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [org.id, sg.name, sg.cat, buyerName, buyerPhone, buyerUserId, finalBoughtState, isAnonymous, isGroup, groupTarget, groupCurrent, giftLink]
        );

        gifts.push({
          id: res.insertId,
          org_id: org.id,
          name: sg.name,
          category: sg.cat,
          is_bought: finalBoughtState,
          buyer_name: buyerName,
          is_anonymous: isAnonymous
        });
      }
    }
    console.log(`✓ ${gifts.length} Gifts inserted successfully.`);

    // 5. Generate 120 Gift Comments (Relative chats under specific gifts)
    console.log("💬 Generating 120 gift-level comments...");
    let commentsCount = 0;
    for (let i = 0; i < 120; i++) {
      const gift = pick(gifts);
      const isFem = Math.random() > 0.5;
      const commenterName = `${isFem ? pick(firstNamesFemale) : pick(firstNamesMale)} ${pick(lastNames)}`;
      const commentText = pick(giftCommentsDict);

      await conn.query(
        "INSERT INTO gift_comments (gift_id, user_name, comment) VALUES (?, ?, ?)",
        [gift.id, commenterName, commentText]
      );
      commentsCount++;
    }
    console.log(`✓ ${commentsCount} Gift comments inserted.`);

    // 6. Generate 200 Board Messages (general_messages) - Congratulation cards, replies, and likes
    console.log("📋 Generating 200 board messages (nested replies & likes included)...");
    const boardMessages = [];
    
    // First pass: parent level messages
    for (let i = 0; i < 150; i++) {
      const org = pick(organizations);
      const isFem = Math.random() > 0.5;
      const authorName = `${isFem ? pick(firstNamesFemale) : pick(firstNamesMale)} ${pick(lastNames)}`;
      const messageText = pick(generalMessagesDict);
      const likes = randomRange(0, 24);

      const [res] = await conn.query(
        "INSERT INTO general_messages (org_id, user_name, message, likes, is_time_capsule) VALUES (?, ?, ?, ?, 0)",
        [org.id, authorName, messageText, likes]
      );

      boardMessages.push({
        id: res.insertId,
        org_id: org.id,
        user_name: authorName
      });
    }

    // Second pass: 50 nested replies (Replies from parents or other family members to existing board messages)
    let repliesCount = 0;
    for (let i = 0; i < 50; i++) {
      const parentMsg = pick(boardMessages);
      const org = organizations.find(o => o.id === parentMsg.org_id);
      const parentUser = users.find(u => u.id === org.parent_id);
      
      // Either parent replies ("Çok teşekkür ederiz teyzecim!") or another relative replies
      let replyAuthor = `${parentUser.first_name} (Anne)`;
      if (Math.random() > 0.5) {
        const isFem = Math.random() > 0.5;
        replyAuthor = `${isFem ? pick(firstNamesFemale) : pick(firstNamesMale)} ${pick(lastNames)}`;
      }

      const replyTexts = [
        "Güzel dileklerin için çok teşekkür ederiz, eksik olma!",
        "Amin inşallah, en kısa zamanda görüşmek üzere.",
        "Çok teşekkürler canım benim, kocaman sevgiler!",
        "Harika duaların bizi çok mutlu etti, öpüyoruz çok.",
        "Sağ olasın teyzesi, hep birlikte güzel günlere!"
      ];
      const messageText = pick(replyTexts);
      const likes = randomRange(0, 10);

      await conn.query(
        "INSERT INTO general_messages (org_id, user_name, message, parent_id, likes, is_time_capsule) VALUES (?, ?, ?, ?, ?, 0)",
        [org.id, replyAuthor, messageText, parentMsg.id, likes]
      );
      repliesCount++;
    }
    console.log(`✓ 200 Board messages inserted (150 main, ${repliesCount} threaded replies).`);

    // 7. Generate 30 Time Capsules (Kilidi 18 yıl sonra açılacak tebrik mektupları ve videoları)
    console.log("⏳ Generating 30 digital time capsules with video/audio attachments...");
    for (let i = 0; i < 30; i++) {
      const org = pick(organizations);
      const isFem = Math.random() > 0.5;
      const authorName = `${isFem ? pick(firstNamesFemale) : pick(firstNamesMale)} ${pick(lastNames)}`;
      const messageText = pick(capsuleMessagesDict);
      const likes = randomRange(0, 12);
      
      // Unlock date is child's 18th birthday
      const unlockDate = new Date();
      unlockDate.setFullYear(unlockDate.getFullYear() + 18);

      // Randomly assign audio/video/image attachments representing AWS S3 media fallbacks
      const mediaType = pick(["Text", "Video", "Audio", "Image"]);
      let mediaUrl = null;
      if (mediaType === "Video") {
        mediaUrl = `/uploads/mock-video-${randomRange(1, 5)}.mp4`;
      } else if (mediaType === "Audio") {
        mediaUrl = `/uploads/mock-audio-${randomRange(1, 5)}.mp3`;
      } else if (mediaType === "Image") {
        mediaUrl = `/uploads/mock-photo-${randomRange(1, 5)}.jpg`;
      }

      await conn.query(
        `INSERT INTO general_messages 
         (org_id, user_name, message, likes, is_time_capsule, unlock_date, media_url, media_type) 
         VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
        [org.id, authorName, messageText, likes, unlockDate, mediaUrl, mediaType]
      );
    }
    console.log("✓ 30 Time capsules seeded successfully.");

    // 8. Generate 60 Gold & Cash Gifts (Altın sandığı - Gram, Çeyrek, Nakit EFT)
    console.log("🪙 Seeding 60 traditional gold, gram and cash IBAN EFT transfers...");
    const giftTypes = ["Ceyrek Altin", "Gram Altin", "Nakit Para"];
    for (let i = 0; i < 60; i++) {
      const org = pick(organizations);
      const isFem = Math.random() > 0.5;
      const buyerName = `${isFem ? pick(firstNamesFemale) : pick(firstNamesMale)} ${pick(lastNames)}`;
      const buyerPhone = `05${randomRange(30, 59)}${randomRange(100, 999)}${randomRange(10, 99)}${randomRange(10, 99)}`;
      const giftType = pick(giftTypes);
      
      let amount = null;
      if (giftType === "Nakit Para") {
        amount = pick([100, 200, 250, 500, 1000, 1500, 2000]);
      }
      
      const status = pick(["Pending", "Confirmed", "Confirmed"]); // Most are confirmed
      const isAnonymous = Math.random() > 0.85 ? 1 : 0;

      await conn.query(
        `INSERT INTO gold_and_cash_gifts 
         (org_id, buyer_name, buyer_phone, gift_type, amount, status, is_anonymous) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [org.id, buyerName, buyerPhone, giftType, amount, status, isAnonymous]
      );
    }
    console.log("✓ 60 Gold and cash gifts successfully generated.");

    // 9. Generate 15 Family Circles (Davet kodları ve üyelikler)
    console.log("👥 Generating 15 family circles with relative bonds...");
    const circleNames = [
      "Yılmaz Ailesi Çemberi", "Demirler Özel Çemberi", "Küçük Mucizeler",
      "Kaya & Şahin Akrabaları", "Çelikler Sülalesi", "Torun Severler",
      "Canım Kuzenler", "Doğum Mutluluğu", "Sevgi Bağı Çemberi", "Bizim Aile"
    ];

    for (let i = 0; i < 15; i++) {
      const creator = users[i]; // Assign first 15 users as creators
      const name = pick(circleNames) + ` (#${randomRange(100, 999)})`;
      const inviteCode = `CIRC-${randomRange(10, 99)}${creator.first_name.substring(0, 3).toUpperCase()}${randomRange(100, 999)}`;

      const [res] = await conn.query(
        "INSERT INTO family_circles (name, creator_id, invite_code) VALUES (?, ?, ?)",
        [name, creator.id, inviteCode]
      );
      const circleId = res.insertId;

      // Add creator as Admin
      await conn.query(
        "INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, 'Admin')",
        [circleId, creator.id]
      );

      // Add 4-8 other random users as Members of this circle
      const memberUsers = pickSome(users.filter(u => u.id !== creator.id), randomRange(4, 8));
      for (const mu of memberUsers) {
        await conn.query(
          "INSERT IGNORE INTO circle_members (circle_id, user_id, role) VALUES (?, ?, 'Member')",
          [circleId, mu.id]
        );
      }
    }
    console.log("✓ 15 Family circles with dynamic memberships established.");

    console.log("\n✨ Database fully seeded with rich, premium, interconnected data!");
    console.log("📊 SEEDING STATISTICS SUMMARY:");
    console.log("- Users Generated: 120");
    console.log("- Children Generated: 60");
    console.log("- Active Organizations (Doğum, Sünnet, Mezuniyet, Yaş Günü): 60");
    console.log("- Registry Gifts with diverse reservation/group states: ~550");
    console.log("- Gift chats & Comments: 120");
    console.log("- Board congratulation posts (with nested replies): 200");
    console.log("- Sealed future Time Capsules (Video, Audio & Photo): 30");
    console.log("- EFT Gold, Gram and Cash transfers (Pending/Confirmed): 60");
    console.log("- Active Akrabalık Family Circles: 15");
    console.log("🎉 Seeding Completed successfully!");

  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
  } finally {
    conn.release();
    pool.end();
  }
}

// Execute seeder
seed();
