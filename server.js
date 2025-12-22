const express = require("express");
const puppeteer = require("puppeteer");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Allow browser requests
app.use(express.json()); // Parse JSON bodies
app.use(express.static(__dirname)); // Serve your HTML/CSS files from this folder

// --- Rate Limiting (Simple In-Memory Map) ---
// PRD Requirement: 1 req/sec per IP
const requestLog = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (requestLog.has(ip)) {
    const lastRequest = requestLog.get(ip);
    if (now - lastRequest < 1000) {
      // 1000ms = 1 second
      return res.status(429).json({ error: "Too many requests. Please wait." });
    }
  }

  requestLog.set(ip, now);
  next();
};

// --- Helper: Extract Domain ---
function getHostname(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname;
  } catch (e) {
    return null;
  }
}

// --- API Endpoint: SCAN ---
app.post("/api/scan", rateLimiter, async (req, res) => {
  const { url } = req.body;

  // 1. Validation
  if (!url) {
    return res.status(400).json({ success: false, error: "URL is required" });
  }

  const hostname = getHostname(url);
  if (!hostname) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid URL format" });
  }

  console.log(`[Server] Starting scan for: ${url}`);

  let browser;
  try {
    // 2. Check Green Web Foundation API (Is it eco-hosted?)
    // We do this first because it's faster than Puppeteer
    let isGreen = false;
    let hostName = "Unknown Host";

    try {
      const greenResponse = await axios.get(
        `https://api.thegreenwebfoundation.org/api/v3/greencheck/${hostname}`
      );
      if (greenResponse.data && typeof greenResponse.data.green === "boolean") {
        isGreen = greenResponse.data.green;
        hostName = greenResponse.data.hosted_by || "Green Partner";
      }
    } catch (err) {
      console.warn("[Server] Green API check failed, defaulting to false.");
    }

    // 3. Launch Puppeteer (The Heavy Lifting)
    browser = await puppeteer.launch({
      headless: "new", // Runs in background without UI
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-ipc-flooding-protection",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ], // Anti-detection and compatibility
      ignoreDefaultArgs: ["--enable-automation"],
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    // Anti-detection measures
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set additional headers to appear more human
    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0",
    });

    // Override navigator.webdriver to hide automation
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    // Add some delay to appear more human-like
    await page.waitForTimeout(1000);

    // Enable request interception to categorize traffic
    await page.setRequestInterception(true);

    let totalBytes = 0;
    let imageBytes = 0;
    let scriptBytes = 0;
    let fontBytes = 0;

    page.on("request", (req) => req.continue());

    page.on("response", async (response) => {
      try {
        // Skip non-HTTP responses
        if (!response.url().startsWith("http")) return;

        // Get the size of the response buffer
        const buffer = await response.buffer().catch(() => null);
        if (!buffer) return;

        const size = buffer.length;
        const type = response.request().resourceType();

        totalBytes += size;
        if (type === "image") imageBytes += size;
        else if (type === "script") scriptBytes += size;
        else if (type === "font") fontBytes += size;
      } catch (e) {
        // Sometimes responses don't have buffers, ignore them
      }
    });

    // Navigate to URL and wait for network to be idle (page fully loaded)
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 4. Send Success Response
    res.json({
      success: true,
      url: url,
      isGreen: isGreen,
      hostName: hostName,
      bytes: {
        total: totalBytes,
        image: imageBytes,
        script: scriptBytes,
        font: fontBytes,
      },
      isEstimate: false,
    });
  } catch (error) {
    console.error(`[Server] Error scanning ${url}:`, error.message);

    // Fallback Logic (as per PRD)
    // If Puppeteer fails (timeout or blocker), return an estimate or error
    res.json({
      success: false,
      isEstimate: true,
      error: "Scan failed, could not calculate accurate emissions.",
    });
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.warn("[Server] Error closing browser:", closeErr.message);
      }
    }
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n🌱 Lite Server running at http://localhost:${PORT}`);
  console.log(`   - Frontend served from root directory`);
  console.log(`   - API endpoint: POST /api/scan`);
});
