const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Yerel yüklemeler için klasör kontrolü
const localUploadsDir = path.join(__dirname, "..", "frontend", "uploads");
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Multer Bellek Depolaması
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 Megabayt Sınırı
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|quicktime|webm|mp3|wav|mpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Yalnızca görsel (JPEG, PNG, GIF), video (MP4, MOV, WEBM) veya ses yükleyebilirsiniz!"));
  }
});

// S3 İstemcisi
let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

// POST /api/upload - Medya Dosyası Yükleme (S3 ve Yerel Fallback Destekli)
router.post("/", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "Lütfen bir dosya seçin." });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
    const fileMime = req.file.mimetype;
    
    let mediaType = "Text";
    if (fileMime.startsWith("video")) mediaType = "Video";
    else if (fileMime.startsWith("image")) mediaType = "Image";
    else if (fileMime.startsWith("audio")) mediaType = "Audio";

    // 1. AWS S3'e Yüklemeyi Dene (Eğer Tanımlıysa)
    if (s3) {
      const bucketName = process.env.AWS_S3_BUCKET || "gozbebegim-media";
      try {
        console.log(`[Upload] S3'e dosya yükleniyor: ${fileName} (${req.file.size} bytes)`);
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: fileMime
        });

        await s3.send(command);

        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
        return res.json({
          success: true,
          message: "Dosya AWS S3'e başarıyla yüklendi. 🎉",
          url: fileUrl,
          media_type: mediaType
        });
      } catch (s3Error) {
        console.error("[Upload] AWS S3 yükleme hatası, yerel depolamaya yönlendiriliyor:", s3Error);
      }
    }

    // 2. S3 Yoksa Veya Hata Aldıysa Yerel Klasöre Kaydet (Fallback)
    try {
      const localFilePath = path.join(localUploadsDir, fileName);
      console.log(`[Upload] Yerel depolamaya dosya kaydediliyor: ${localFilePath}`);
      
      fs.writeFileSync(localFilePath, req.file.buffer);

      const localUrl = `/uploads/${fileName}`;
      return res.json({
        success: true,
        message: "Dosya yerel sunucuya kaydedildi (S3 Fallback).",
        url: localUrl,
        media_type: mediaType
      });
    } catch (localError) {
      console.error("[Upload] Yerel depolama hatası:", localError);
      return res.status(500).json({ success: false, error: "Dosya kaydedilirken sunucu hatası oluştu." });
    }
  });
});

module.exports = router;
