const express = require("express");
const cors = require("cors");
const axios = require("axios");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Prevent large payloads
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.get("/api/scan", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  // Basic URL validation
  let url;
  try {
    url = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    if (!url.protocol.startsWith('http')) {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Rate limiting (simple in-memory check)
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!global.rateLimit) global.rateLimit = new Map();
  const lastRequest = global.rateLimit.get(clientIP);
  if (lastRequest && now - lastRequest < 1000) { // 1 request per second
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }
  global.rateLimit.set(clientIP, now);

  console.log(`[Server] 🟢 Starting Scan: ${url.href}`);

  // Default Fallback (Only used if everything crashes)
  let resultData = {
    success: true,
    url: url.href,
    isGreen: false,
    hostName: "Standard Grid",
    bytes: { total: 0, image: 0, script: 0, font: 0 },
    isEstimate: false,
  };

  let browser = null;

  try {
    // --- 1. GREEN WEB CHECK (API) ---
    try {
      const domain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const greenRes = await axios.get(
        `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
      );
      resultData.isGreen = greenRes.data.green;
      resultData.hostName = greenRes.data.hosted_by || "Green Partner";
      console.log(`   ↳ Energy: ${resultData.isGreen ? "Green" : "Grey"}`);
    } catch (err) {
      console.log("   ↳ Green API Skipped");
    }

    // --- 2. REAL PAGE WEIGHT (PUPPETEER) ---
    console.log("   ↳ Launching Headless Browser...");

    // Launch hidden browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Track data size
    let totalBytes = 0;
    let imageBytes = 0;
    let scriptBytes = 0;
    let fontBytes = 0;

    // Listen to every file the page requests
    page.on("response", async (response) => {
      try {
        // Try to get content-length header first (fastest)
        const len = Number(response.headers()["content-length"]);
        let size = 0;

        if (len) {
          size = len;
        } else {
          // If header missing, try buffer (slower but accurate)
          // Only for important types to save memory
          const type = response.request().resourceType();
          if (["image", "script", "font"].includes(type)) {
            const buffer = await response.buffer().catch(() => null);
            if (buffer) size = buffer.length;
          }
        }

        if (size > 0) {
          totalBytes += size;
          const type = response.request().resourceType();
          if (type === "image") imageBytes += size;
          else if (type === "script") scriptBytes += size;
          else if (type === "font") fontBytes += size;
        }
      } catch (e) {
        // Ignore failed resources (ads blockers etc)
      }
    });

    // Visit the page (Timeout after 15s to be safe)
    await page
      .goto(url.href, { waitUntil: "domcontentloaded", timeout: 15000 })
      .catch(() => {});

    // Give it a second for extra lazy-loaded images
    await new Promise((r) => setTimeout(r, 1000));

    console.log(
      `   ↳ Scan Complete. Total Size: ${(totalBytes / 1024 / 1024).toFixed(
        2
      )} MB`
    );

    resultData.bytes = {
      total: totalBytes,
      image: imageBytes,
      script: scriptBytes,
      font: fontBytes,
    };

    // If the site blocked us or returned 0 bytes, mark as estimate
    if (totalBytes === 0) {
      console.log("   ↳ Blocked/Empty. Switching to Estimate.");
      resultData.isEstimate = true;
      resultData.bytes.total = 2200000; // Fallback 2.2MB
    }

    res.json(resultData);
  } catch (error) {
    console.error("[Server Error]", error.message);
    res.status(500).json({ error: "Scan Failed", details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ REAL-DATA Server running at http://localhost:${PORT}`);
});
