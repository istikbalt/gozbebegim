const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { simpleParser } = require("mailparser");
const pool = require("../database/db");

// Configure clients using environment variables
let s3Client = null;
let sesClient = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
  const region = process.env.AWS_REGION || "us-east-1";

  s3Client = new S3Client({ region, credentials });
  sesClient = new SESClient({ region, credentials });
}

// Stream helper to read S3 object body
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

async function checkAndForwardEmails() {
  if (!s3Client || !sesClient) {
    console.log("[Email Forwarder] AWS credentials not configured in env. Skipping email routing.");
    return;
  }

  const s3Bucket = "diwanet-media"; // Hardcoded matching the SES S3 target bucket
  const targetGmail = "istikbalturut@gmail.com";

  try {
    // 1. Fetch already processed message keys from RDS
    const [rows] = await pool.query("SELECT message_key FROM processed_emails");
    const processedKeys = new Set(rows.map(r => r.message_key));

    // 2. List S3 Objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: s3Bucket,
      MaxKeys: 100
    });

    const s3Response = await s3Client.send(listCommand);
    if (!s3Response.Contents || s3Response.Contents.length === 0) {
      return; // No files in S3
    }

    // 3. Filter for e-mail files at the root level (no uploads/ prefix, and not the test notification)
    const emailObjects = s3Response.Contents.filter(item => {
      const key = item.Key;
      return (
        !key.includes("/") && 
        key !== "AMAZON_SES_SETUP_NOTIFICATION" && 
        !processedKeys.has(key)
      );
    });

    if (emailObjects.length === 0) {
      return; // No new emails to forward
    }

    console.log(`[Email Forwarder] Found ${emailObjects.length} new incoming emails to route.`);

    for (const obj of emailObjects) {
      const key = obj.Key;
      console.log(`[Email Forwarder] Processing email file: ${key}`);

      try {
        // A. Download raw email from S3
        const getCommand = new GetObjectCommand({
          Bucket: s3Bucket,
          Key: key
        });
        const getResponse = await s3Client.send(getCommand);
        const rawEmailContent = await streamToString(getResponse.Body);

        // B. Parse raw email content
        const parsed = await simpleParser(rawEmailContent);
        
        const originalSender = parsed.from && parsed.from.value && parsed.from.value[0] 
          ? parsed.from.value[0].address 
          : "unknown@sender.com";
        const senderName = parsed.from && parsed.from.value && parsed.from.value[0]
          ? parsed.from.value[0].name || originalSender
          : originalSender;
        
        const subject = parsed.subject || "(Konu Yok)";
        const dateStr = parsed.date ? new Date(parsed.date).toLocaleString("tr-TR") : new Date().toLocaleString("tr-TR");
        const bodyText = parsed.text || "(Metin içeriği bulunamadı)";

        console.log(`[Email Forwarder] Parsed email: Subject="${subject}", Sender="${originalSender}"`);

        // C. Formulate rich HTML body for forwarding
        const htmlBody = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #f4c0d1; border-radius: 16px; padding: 25px; color: #333; background: #fff;">
            <div style="background: linear-gradient(135deg, #D4537E 0%, #B83A64 100%); color: white; padding: 16px 20px; border-radius: 12px; font-weight: bold; font-size: 16px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(212, 83, 126, 0.15);">
              📬 Yeni Gözbebeğim E-postası (info@gozbebegim.com)
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #fcf2f5;">
                <td style="padding: 8px 0; font-weight: bold; color: #888; width: 100px;">Gönderen:</td>
                <td style="padding: 8px 0; color: #1a1a1a;"><strong>${senderName}</strong> &lt;${originalSender}&gt;</td>
              </tr>
              <tr style="border-bottom: 1px solid #fcf2f5;">
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Tarih:</td>
                <td style="padding: 8px 0; color: #1a1a1a;">${dateStr}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fcf2f5;">
                <td style="padding: 8px 0; font-weight: bold; color: #888;">Konu:</td>
                <td style="padding: 8px 0; color: #D4537E; font-weight: bold;">${subject}</td>
              </tr>
            </table>

            <div style="background: #fafafa; border-radius: 10px; padding: 18px; line-height: 1.6; font-size: 14.5px; border: 0.5px solid #e8e0e4; white-space: pre-wrap;">
${bodyText}
            </div>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed #f4c0d1; text-align: center; font-size: 12px; color: #888;">
              💡 <i>Bu e-posta <strong>gozbebegim.com</strong> platformu tarafından otomatik olarak yönlendirilmiştir.<br>
              Gönderene doğrudan cevap yazmak için bu maili <strong>Yanıtla (Reply)</strong> demeniz yeterlidir.</i>
            </div>
          </div>
        `;

        // D. Forward the email via AWS SES
        // Sender MUST be from the verified domain: info@gozbebegim.com
        const sendCommand = new SendEmailCommand({
          Source: "info@gozbebegim.com",
          Destination: {
            ToAddresses: [targetGmail]
          },
          ReplyToAddresses: [originalSender], // Let Gmail user reply directly to original sender!
          Message: {
            Subject: {
              Data: `[Yönlendirildi] ${subject}`,
              Charset: "UTF-8"
            },
            Body: {
              Html: {
                Data: htmlBody,
                Charset: "UTF-8"
              }
            }
          }
        });

        await sesClient.send(sendCommand);
        console.log(`[Email Forwarder] Successfully forwarded email ${key} to ${targetGmail}`);

        // E. Save to processed_emails table to ensure we do not process this again
        await pool.query("INSERT INTO processed_emails (message_key) VALUES (?)", [key]);

      } catch (err) {
        console.error(`[Email Forwarder] Error processing message ${key}:`, err.message);
        
        // Specific user warning logging for SES credentials
        if (err.message.includes("is not authorized") || err.message.includes("AccessDenied")) {
          console.error(
            "[Email Forwarder] CRITICAL: AWS IAM credentials do not have permission to send email via SES. " +
            "Please add 'AmazonSESFullAccess' or similar send policies to the IAM user."
          );
        }
      }
    }

  } catch (error) {
    console.error("[Email Forwarder] Error checking emails in background:", error);
  }
}

// Run the task periodically
function startEmailForwarder() {
  console.log("[Email Forwarder] Starting S3 e-mail background routing worker (every 60 seconds)...");
  // Run 5 seconds after startup, then every 60 seconds
  setTimeout(checkAndForwardEmails, 5000);
  setInterval(checkAndForwardEmails, 60000);
}

module.exports = { startEmailForwarder };
