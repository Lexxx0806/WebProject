/**
 * Main application entry point
 * Initializes different modules based on current page
 */
document.addEventListener("DOMContentLoaded", () => {
  setupGlobalUI();

  // Page-specific module initialization
  if (document.getElementById("calc-btn")) initCalculator();
  if (document.getElementById("launch-mail-btn")) initInboxHunter();
  if (document.getElementById("check-site-btn")) initInspector();
  if (document.getElementById("start-game-btn")) initGame();
});

/* --- 1. GLOBAL UI (Theme + Menu) --- */
function setupGlobalUI() {
  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    body.setAttribute("data-theme", "light");
    themeToggle.checked = true;
  }

  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      body.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      body.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  });

  // Menu
  const menuToggle = document.getElementById("menu-toggle");
  const menuOverlay = document.getElementById("menu-overlay");

  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      // Toggle menu state
      const isActive = menuOverlay.classList.contains("active");
      if (isActive) {
        menuOverlay.classList.remove("active");
        // Don't hide the button completely, just change its appearance
        menuToggle.classList.remove("menu-open");
      } else {
        menuOverlay.classList.add("active");
        menuToggle.classList.add("menu-open");
      }
    });
    const closeFn = () => {
      menuOverlay.classList.remove("active");
      menuToggle.classList.remove("menu-open");
    };
    document
      .querySelectorAll(".menu-link")
      .forEach((l) => l.addEventListener("click", closeFn));
  }

  // Settings Panel
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener("click", () => {
      // Toggle settings panel
      const isActive = settingsPanel.classList.contains("active");
      if (isActive) {
        settingsPanel.classList.remove("active");
        settingsToggle.classList.remove("settings-open");
      } else {
        settingsPanel.classList.add("active");
        settingsToggle.classList.add("settings-open");
        // Close menu if it's open
        if (menuOverlay.classList.contains("active")) {
          menuOverlay.classList.remove("active");
          menuToggle.classList.remove("menu-open");
        }
      }
    });

    // Close settings when clicking outside
    settingsPanel.addEventListener("click", (e) => {
      if (e.target === settingsPanel) {
        settingsPanel.classList.remove("active");
        settingsToggle.classList.remove("settings-open");
      }
    });
  }

  // Custom cursor disabled - using default browser cursor for better compatibility
  // This prevents conflicts with menu overlays and ensures smooth interaction

  // Scroll Reveal
  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => scrollObserver.observe(el));
}

/* --- 2. INBOX HUNTER --- */
function initInboxHunter() {
  const btn = document.getElementById("launch-mail-btn");

  if (btn) {
    btn.addEventListener("click", () => {
      const provider = window.selectedProvider || "gmail";
      const mission = window.selectedMission || "newsletters";
      let url = "";

      if (provider === "gmail") {
        const base = "https://mail.google.com/mail/u/0/#search/";
        if (mission === "newsletters")
          url = base + "category:promotions+OR+label:^unsub";
        if (mission === "large") url = base + "size:10m";
        if (mission === "old") url = base + "older_than:2y";
      } else if (provider === "outlook") {
        url = "https://outlook.live.com/mail/0/";
        alert(
          "In Outlook search bar type: 'IsFrom:Newsletters' or 'Size:>10MB'"
        );
      } else if (provider === "yahoo") {
        url = "https://mail.yahoo.com/d/search/keyword=unsubscribe";
      }

      if (url) window.open(url, "_blank");
    });
  }
}

// Global variables to store selected values
window.selectedProvider = "gmail";
window.selectedMission = "newsletters";

function selectProvider(value, displayText) {
  window.selectedProvider = value;
  document.getElementById("provider-selected").textContent = displayText;
  document.getElementById("provider-toggle").checked = false;
}

function selectMission(value, displayText) {
  window.selectedMission = value;
  document.getElementById("mission-selected").textContent = displayText;
  document.getElementById("mission-toggle").checked = false;
}

// Chatbot functionality
function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const message = input.value.trim();

  if (!message) return;

  // Add user message
  messages.innerHTML += `<div class="message user"><strong>You:</strong> ${message}</div>`;
  input.value = '';

  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;

  // Add typing indicator
  messages.innerHTML += `<div class="message bot typing"><strong>Lite AI:</strong> <span class="typing-dots">...</span></div>`;

  // Simulate AI response (in a real app, this would call an API)
  setTimeout(() => {
    // Remove typing indicator
    const typingEl = document.querySelector('.typing');
    if (typingEl) typingEl.remove();

    // Generate response based on message content
    const response = generateChatResponse(message);

    // Add bot response
    messages.innerHTML += `<div class="message bot"><strong>Lite AI:</strong> ${response}</div>`;

    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
  }, 1000 + Math.random() * 2000); // Random delay for realism
}

function generateChatResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses (in a real app, this would use AI)
  if (lowerMessage.includes('carbon') || lowerMessage.includes('co2') || lowerMessage.includes('emissions')) {
    return "Digital carbon emissions come from data centers, network infrastructure, and device manufacturing. The internet accounts for about 3.7% of global greenhouse gas emissions - that's comparable to the aviation industry!";
  }

  if (lowerMessage.includes('calculator') || lowerMessage.includes('calculate')) {
    return "Our carbon calculator uses industry-standard formulas from Sustainable Web Design. It estimates your annual digital footprint based on cloud storage, streaming, and email usage. The results show both CO₂ emissions and equivalent tree absorption requirements.";
  }

  if (lowerMessage.includes('dark mode') || lowerMessage.includes('energy')) {
    return "Dark mode can save significant energy on OLED screens! Studies show it can reduce power consumption by up to 60% on certain devices. It's one of the simplest ways to reduce your digital carbon footprint.";
  }

  if (lowerMessage.includes('hosting') || lowerMessage.includes('green')) {
    return "Green hosting providers power their servers with 100% renewable energy. They typically use about 50g CO₂ per kWh compared to 442g for coal-powered hosting. Our web inspector can help you check if a site uses green hosting!";
  }

  if (lowerMessage.includes('game') || lowerMessage.includes('simulation')) {
    return "The Data Stream Defense game teaches about digital waste through gameplay. Each 'data item' represents files that consume server energy. The higher your temperature goes, the more energy is being wasted - just like in real data centers!";
  }

  if (lowerMessage.includes('email') || lowerMessage.includes('gmail')) {
    return "Email storage is a major contributor to digital emissions. Gmail alone stores over 1.5 petabytes of data! Our Inbox Hunter tool helps you find and delete old emails, newsletters, and large attachments to reduce your footprint.";
  }

  if (lowerMessage.includes('video') || lowerMessage.includes('streaming')) {
    return "Video streaming is one of the largest sources of digital emissions. 480p video uses about 60% less data than 4K, and choosing lower quality can significantly reduce your carbon footprint while still enjoying content.";

  }

  if (lowerMessage.includes('cloud') || lowerMessage.includes('storage')) {
    return "Cloud storage might seem 'invisible' but it consumes massive amounts of energy. 90% of created data is never accessed again, yet it still requires power for storage and backup systems. Regular cleanup is essential!";
  }

  if (lowerMessage.includes('website') || lowerMessage.includes('audit')) {
    return "Our web inspector analyzes websites for environmental impact. It checks page size, hosting provider (green vs fossil fuel), and provides an eco-grade. Smaller, efficiently-hosted sites have much lower carbon footprints!";
  }

  // Default responses for general questions
  const generalResponses = [
    "That's a great question about digital sustainability! The internet's environmental impact is often overlooked, but it accounts for about 3.7% of global emissions - more than the entire aviation industry.",
    "Digital emissions come from data centers (servers), network infrastructure (cables, routers), and device manufacturing. Every email, video, or website visit has a carbon cost.",
    "Small actions add up! Using dark mode, deleting old files, choosing green hosting, and reducing video quality are all simple ways to reduce your digital carbon footprint.",
    "Our calculator estimates your annual digital emissions based on your cloud storage, streaming habits, and email usage. It's based on industry research from organizations like the Green Web Foundation.",
    "The Data Stream Defense game illustrates how digital waste accumulates. Each falling item represents data that consumes server energy - the temperature shows how 'hot' your digital footprint is getting!"
  ];

  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

/**
 * Initializes the carbon footprint calculator
 */
function initCalculator() {
  const btn = document.getElementById("calc-btn");
  const resultBox = document.getElementById("result-box");
  const totalEl = document.getElementById("total-co2");
  const treeEl = document.getElementById("tree-count");
  const inputs = ["gb", "stream", "email"];

  // Input validation
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        if (value < 0 || isNaN(value)) {
          e.target.value = Math.max(0, value || 0);
        }
      });
    }
  });

  if (btn) {
    btn.addEventListener("click", () => {
      const gb = Math.max(
        0,
        parseFloat(document.getElementById("gb").value) || 0
      );
      const stream = Math.max(
        0,
        parseFloat(document.getElementById("stream").value) || 0
      );
      const email = Math.max(
        0,
        parseFloat(document.getElementById("email").value) || 0
      );

      // Calculate annual carbon footprint (kg CO₂)
      // Cloud storage: 0.2 kg/GB/year
      // Streaming: 0.055 kg/hour * 52 weeks
      // Emails: 0.004 kg/email * 52 weeks
      const total = (
        gb * 0.2 +
        stream * 52 * 0.055 +
        email * 52 * 0.004
      ).toFixed(1);

      // Trees needed to absorb this CO₂ annually
      const trees = Math.max(1, Math.ceil(total / 21));

      totalEl.textContent = total;
      treeEl.textContent = trees;
      resultBox.style.display = "block";
      resultBox.scrollIntoView({ behavior: "smooth" });
    });
  }
}

/* --- 4. WEB INSPECTOR (WITH FALLBACK) --- */
function initInspector() {
  const checkBtn = document.getElementById("check-site-btn");
  const input = document.getElementById("site-url");
  const results = document.getElementById("inspector-results");
  const statusMsg = document.getElementById("status-msg");
  const weightSlider = document.getElementById("page-weight");
  const weightVal = document.getElementById("weight-val");
  const sliderGroup = document.getElementById("manual-override");

  if (weightSlider)
    weightSlider.addEventListener("input", (e) => {
      weightVal.textContent = e.target.value;
      updateCalculation();
    });

  let currentIsGreen = false;

  function updateCalculation() {
    const sizeInGB = parseFloat(weightSlider.value) / 1024;
    const energy = sizeInGB * 0.81;
    const carbonFactor = currentIsGreen ? 50 : 442;
    const co2 = (energy * carbonFactor).toFixed(3);
    document.getElementById("carbon-per-visit").textContent = co2 + " g";

    const ratingEl = document.getElementById("site-rating");
    ratingEl.className = "res-card";
    if (co2 < 0.095) {
      ratingEl.textContent = "A+";
      ratingEl.classList.add("rating-good");
    } else if (co2 < 0.186) {
      ratingEl.textContent = "A";
      ratingEl.classList.add("rating-good");
    } else if (co2 < 0.341) {
      ratingEl.textContent = "B";
      ratingEl.style.color = "var(--accent)";
    } else if (co2 < 0.493) {
      ratingEl.textContent = "C";
      ratingEl.style.color = "#fbbf24";
    } else {
      ratingEl.textContent = "F";
      ratingEl.classList.add("rating-bad");
    }
  }

  if (checkBtn) {
    checkBtn.addEventListener("click", async () => {
      const rawInput = input.value.trim();
      if (!rawInput) return alert("Please enter a URL");
      const domain = rawInput.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const fullUrl = rawInput.startsWith("http")
        ? rawInput
        : `https://${domain}`;

      checkBtn.textContent = "Scanning...";
      checkBtn.disabled = true;

      // Show cloud loader animation
      statusMsg.innerHTML = `
        <div class="loader">
          <svg viewBox="0 0 100 100">
            <g id="cloud">
              <rect x="20" y="60" width="60" height="25" rx="12.5" ry="12.5"/>
              <g transform="translate(25 35)">
                <ellipse cx="25" cy="12.5" rx="12.5" ry="12.5"/>
                <ellipse cx="50" cy="12.5" rx="12.5" ry="12.5"/>
                <ellipse cx="37.5" cy="6.25" rx="12.5" ry="12.5"/>
              </g>
              <g transform="translate(50 72.5)">
                <rect x="-2.5" y="-2.5" width="5" height="15" rx="2.5"/>
                <rect x="-7.5" y="-2.5" width="5" height="10" rx="2.5"/>
                <rect x="2.5" y="-2.5" width="5" height="10" rx="2.5"/>
                <rect x="-12.5" y="-2.5" width="5" height="5" rx="2.5"/>
                <rect x="7.5" y="-2.5" width="5" height="5" rx="2.5"/>
              </g>
            </g>
            <g id="shapes">
              <g>
                <g>
                  <circle cx="50" cy="50" r="5"/>
                  <circle cx="50" cy="50" r="5"/>
                  <circle cx="50" cy="50" r="5"/>
                </g>
              </g>
            </g>
            <g id="lines">
              <g>
                <line x1="50" y1="40" x2="50" y2="60"/>
                <line x1="35" y1="50" x2="65" y2="50"/>
                <line x1="42" y1="35" x2="58" y2="65"/>
              </g>
            </g>
          </svg>
        </div>
        <p class="tiny-note" style="margin: 0;">Scanning website...</p>
      `;

      results.style.display = "none";
      sliderGroup.style.display = "none";
      currentIsGreen = false;
      let detectedSize = 0;
      let usingRealData = false;

      try {
        // Green Web API Check
        try {
          const greenResponse = await fetch(
            `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
          );
          if (greenResponse.ok) {
            const greenData = await greenResponse.json();
            currentIsGreen = greenData.green;
            const hostStatus = document.getElementById("hosting-status");
            const hostCard = document.getElementById("res-green");
            const details = document.getElementById("hosting-details");
            if (currentIsGreen) {
              hostStatus.textContent = "Green Energy";
              hostStatus.style.color = "var(--success)";
              hostCard.style.borderColor = "var(--success)";
              details.innerHTML = `Hosted by: <strong>${
                greenData.hosted_by || "Green Partner"
              }</strong>`;
            } else {
              hostStatus.textContent = "Standard Grid";
              hostStatus.style.color = "var(--text-muted)";
              hostCard.style.borderColor = "rgba(255,255,255,0.1)";
              details.innerHTML =
                "Host does not provide public green evidence.";
            }
          } else {
            throw new Error("Green API failed");
          }
        } catch (e) {
          console.warn("Green Web API check failed:", e.message);
          currentIsGreen = false;
          const hostStatus = document.getElementById("hosting-status");
          hostStatus.textContent = "Checking...";
        }

        // PageSpeed API Check - keep cloud loader visible
        const encodedUrl = encodeURIComponent(fullUrl);
        const psResponse = await fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&category=PERFORMANCE`
        );
        if (!psResponse.ok) throw new Error("PageSpeed API blocked or failed");

        const psData = await psResponse.json();
        if (
          !psData.lighthouseResult?.audits?.["total-byte-weight"]?.numericValue
        ) {
          throw new Error("Invalid PageSpeed response");
        }

        const totalBytes =
          psData.lighthouseResult.audits["total-byte-weight"].numericValue;
        detectedSize = (totalBytes / (1024 * 1024)).toFixed(2);
        usingRealData = true;
      } catch (err) {
        console.warn("Page size measurement failed:", err.message);
        usingRealData = false;
        detectedSize = parseFloat(weightSlider.value);
      }

      // Backend API Scan
      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: fullUrl }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.bytes) {
          // Use backend data if available and better than PageSpeed
          if (!usingRealData || data.bytes.total > totalBytes) {
            detectedSize = (data.bytes.total / (1024 * 1024)).toFixed(2);
            usingRealData = true;
          }
          // Update green status if backend has it
          if (data.isGreen !== undefined) {
            currentIsGreen = data.isGreen;
            // Update UI with backend data
            const hostStatus = document.getElementById("hosting-status");
            const hostCard = document.getElementById("res-green");
            const details = document.getElementById("hosting-details");

            if (data.isGreen) {
              hostStatus.textContent = "Green Energy";
              hostStatus.style.color = "var(--success)";
              hostCard.style.borderColor = "var(--success)";
              details.innerHTML = `Hosted by: <strong>${
                data.hostName || "Green Partner"
              }</strong>`;
            } else {
              hostStatus.textContent = "Standard Grid";
              hostStatus.style.color = "var(--text-muted)";
              hostCard.style.borderColor = "rgba(255,255,255,0.1)";
              details.innerHTML =
                "Host does not provide public green evidence.";
            }
          }
        }
      } catch (apiErr) {
        console.warn("Backend API scan failed:", apiErr.message);
        // Continue with frontend measurements
      }

      if (usingRealData) {
        weightSlider.value = detectedSize;
        weightVal.textContent = detectedSize;
        statusMsg.innerHTML = `<span style="color:var(--success)">✔ Scan Complete.</span> Real data used.`;
      } else {
        statusMsg.innerHTML = `<span style="color:#fbbf24">⚠ Scan Blocked.</span> Using estimate (${detectedSize}MB).`;
        sliderGroup.style.display = "block";
      }

      updateCalculation();
      results.style.display = "block";
      checkBtn.textContent = "Run Audit";
      checkBtn.disabled = false;
    });
  }
}

/* --- 5. GAME --- */
function initGame() {
  // Initialize audio system and try to resume context
  initAudio();

  // Try to resume audio context immediately
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('Audio context resumed');
    }).catch(err => {
      console.warn('Failed to resume audio context:', err);
    });
  }

  const startBtn = document.getElementById("start-game-btn");
  const gameBoard = document.getElementById("game-board");
  const overlay = document.getElementById("game-overlay");
  const gameMsg = document.getElementById("game-msg");
  const scoreEl = document.getElementById("game-score");
  const tempEl = document.getElementById("game-lives");
  let gameInterval,
    score = 0,
    temperature = 40,
    gameActive = false,
    highScore = parseInt(localStorage.getItem("liteGameHighScore")) || 0;
  const icons = [
    "fa-file-image",
    "fa-film",
    "fa-envelope",
    "fa-triangle-exclamation",
  ];

  // Initialize high score display
  updateHighScoreDisplay();

  function updateHighScoreDisplay() {
    const existingHighScoreEl = document.getElementById("game-high-score");
    if (existingHighScoreEl) {
      existingHighScoreEl.textContent = highScore;
    } else {
      // Add high score to HUD if it doesn't exist
      const hud = document.querySelector(".hud");
      if (hud) {
        const highScoreEl = document.createElement("span");
        highScoreEl.id = "game-high-score";
        highScoreEl.innerHTML = `High Score: <b>${highScore}</b>`;
        highScoreEl.style.color = "var(--accent)";
        hud.appendChild(highScoreEl);
      }
    }
  }

  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      // Ensure audio context is running (required for browsers)
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Play start game sound
      playSound("startgame");

      // Start background music
      startBackgroundMusic();

      score = 0;
      temperature = 40;
      gameActive = true;
      scoreEl.textContent = score;
      tempEl.textContent = "40°C";
      tempEl.style.color = "var(--success)";
      overlay.style.display = "none";
      document.querySelectorAll(".falling-item").forEach((e) => e.remove());
      function gameLoop() {
        if (!gameActive) return;
        spawnItem();
        gameInterval = setTimeout(gameLoop, Math.max(400, 1000 - score * 30));
      }
      function spawnItem() {
        const item = document.createElement("i");
        const icon = icons[Math.floor(Math.random() * icons.length)];
        item.classList.add("fa-solid", icon, "falling-item");
        item.style.left = 5 + Math.random() * 85 + "%";
        item.style.top = "-30px";
        gameBoard.appendChild(item);
        let pos = -30;
        const fallSpeed = 2 + score * 0.1;
        const fallTimer = setInterval(() => {
          if (!gameActive) {
            clearInterval(fallTimer);
            return;
          }
          pos += fallSpeed;
          item.style.top = pos + "px";
          if (pos > 360) {
            clearInterval(fallTimer);
            if (item.parentNode) item.remove();
            temperature += 10;
            window.currentGameTemp = temperature; // Update global for music system
            tempEl.textContent = temperature + "°C";

            // Progressive visual effects based on temperature
            if (temperature >= 60) {
              gameBoard.classList.add("game-heating");
              // Play warning sound for heating
              playSound("warning");
            }
            if (temperature >= 80) {
              tempEl.style.color = "var(--danger)";
              gameBoard.classList.add("game-critical");
            }

            gameBoard.style.borderColor = "var(--danger)";
            setTimeout(
              () => (gameBoard.style.borderColor = "rgba(255,255,255,0.05)"),
              200
            );
            if (temperature >= 90) endGame();
          }
        }, 20);
        item.addEventListener("click", () => {
          if (!gameActive) return;
          clearInterval(fallTimer);
          item.classList.add("popped");

          // Create particle explosion effect
          createParticleExplosion(
            item.offsetLeft + item.offsetWidth / 2,
            item.offsetTop + item.offsetHeight / 2
          );

          // Add screen flash effect for high scores
          if (score > 0 && score % 5 === 0) {
            createScreenFlash();
          }

          score++;
          scoreEl.textContent = score;
          setTimeout(() => {
            if (item.parentNode) item.remove();
          }, 200);
        });
      }

      function endGame() {
        gameActive = false;
        clearTimeout(gameInterval);

        // Stop background music
        stopBackgroundMusic();

        // Check for new high score
        let newHighScore = false;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("liteGameHighScore", highScore.toString());
          updateHighScoreDisplay();
          newHighScore = true;
        }

        // Play game over sound
        playSound("gameover");

        let message = `<span style="color:var(--danger); font-size: 1.5rem;">🔥 System Overheated!</span><br><span style="font-size:1rem;display:block;margin-top:15px;line-height:1.5;">You cleared <b>${score}</b> items.<br>Unchecked data generates massive heat.</span>`;

        if (newHighScore) {
          message += `<br><span style="color:var(--accent); font-weight: bold; margin-top: 10px; display: block;">🎉 New High Score!</span>`;
        }

        gameMsg.innerHTML = message;
        startBtn.innerHTML = '<span class="text">Cooldown & Retry</span>';
        const tryAgainText = document.getElementById("try-again-text");
        if (tryAgainText) {
          tryAgainText.style.display = "block";
        }
        overlay.style.display = "flex";
      }
      gameLoop();
    });
  }
}

function setupEarth() {
  const canvas = document.querySelector("#bg-canvas");
  if (!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  const geometry = new THREE.IcosahedronGeometry(10, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const earth = new THREE.Mesh(geometry, material);
  scene.add(earth);
  camera.position.z = 20;

  let mouseX = 0,
    mouseY = 0,
    spinBoost = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
  });
  document.addEventListener("mousedown", () => {
    spinBoost = 0.5;
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    spinBoost *= 0.95;
    earth.rotation.y += 0.002 + spinBoost;
    earth.rotation.y += 0.05 * (mouseX * 0.001 - earth.rotation.y);
    earth.rotation.x += 0.05 * (mouseY * 0.001 - earth.rotation.x);
    renderer.render(scene, camera);
  }
  animate();
}

// --- GAME VISUAL EFFECTS ---
function createParticleExplosion(x, y) {
  const gameBoard = document.getElementById("game-board");
  const particleCount = 8;

  // Play click sound
  playSound("click");

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = x + "px";
    particle.style.top = y + "px";

    // Random direction and distance
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 30 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.setProperty("--tx", tx + "px");
    particle.style.setProperty("--ty", ty + "px");

    gameBoard.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) particle.remove();
    }, 600);
  }
}

function createScreenFlash() {
  const gameBoard = document.getElementById("game-board");

  // Play milestone sound
  playSound("milestone");

  gameBoard.classList.add("screen-flash");

  setTimeout(() => {
    gameBoard.classList.remove("screen-flash");
  }, 200);
}

// --- GAME AUDIO SYSTEM ---
let audioContext = null;
let backgroundMusic = null;
let isMusicPlaying = false;

// Global game state for music system
window.currentGameTemp = 40;

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (error) {
    console.warn("Web Audio API not supported:", error.message);
  }
}

function playSound(type) {
  if (!audioContext) return;

  try {
    switch (type) {
      case "click":
        playClickSound();
        break;
      case "milestone":
        playMilestoneSound();
        break;
      case "warning":
        playWarningSound();
        break;
      case "gameover":
        playGameOverSound();
        break;
      case "startgame":
        playStartGameSound();
        break;
      case "powerup":
        playPowerUpSound();
        break;
    }
  } catch (error) {
    console.warn("Sound playback failed:", error.message);
  }
}

function playClickSound() {
  // Multi-layered click with harmonics
  const frequencies = [800, 1200, 1600];
  const gains = [0.08, 0.04, 0.02];

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      freq * 0.7,
      audioContext.currentTime + 0.08
    );

    gainNode.gain.setValueAtTime(gains[index], audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.08
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  });

  // Add a subtle low-end thump
  const bassOsc = audioContext.createOscillator();
  const bassGain = audioContext.createGain();

  bassOsc.connect(bassGain);
  bassGain.connect(audioContext.destination);

  bassOsc.frequency.setValueAtTime(120, audioContext.currentTime);
  bassGain.gain.setValueAtTime(0.05, audioContext.currentTime);
  bassGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.1
  );

  bassOsc.start(audioContext.currentTime);
  bassOsc.stop(audioContext.currentTime + 0.1);
}

function playMilestoneSound() {
  // Triumphant arpeggio with multiple voices
  const notes = [
    { freq: 523, time: 0 }, // C5
    { freq: 659, time: 0.08 }, // E5
    { freq: 784, time: 0.16 }, // G5
    { freq: 1047, time: 0.24 }, // C6
    { freq: 1319, time: 0.32 }, // E6
    { freq: 1568, time: 0.4 }, // G6
  ];

  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(
      note.freq,
      audioContext.currentTime + note.time
    );
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime + note.time);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + note.time + 0.15
    );

    oscillator.start(audioContext.currentTime + note.time);
    oscillator.stop(audioContext.currentTime + note.time + 0.15);
  });
}

function playWarningSound() {
  // Tense, pulsing warning tone
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  filterNode.type = "lowpass";
  filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
  filterNode.frequency.exponentialRampToValueAtTime(
    200,
    audioContext.currentTime + 0.5
  );

  oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(280, audioContext.currentTime + 0.15);
  oscillator.frequency.setValueAtTime(320, audioContext.currentTime + 0.3);

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.5
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function playGameOverSound() {
  // Dramatic descending sequence
  const notes = [
    { freq: 440, duration: 0.3 }, // A4
    { freq: 392, duration: 0.3 }, // G4
    { freq: 349, duration: 0.3 }, // F4
    { freq: 294, duration: 0.4 }, // D4
    { freq: 262, duration: 0.6 }, // C4
  ];

  let currentTime = audioContext.currentTime;

  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(note.freq, currentTime);
    gainNode.gain.setValueAtTime(0.2, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      currentTime + note.duration
    );

    oscillator.start(currentTime);
    oscillator.stop(currentTime + note.duration);

    currentTime += note.duration * 0.8; // Slight overlap
  });
}

function playStartGameSound() {
  // Energetic startup sequence
  const sequence = [
    { freq: 523, time: 0, duration: 0.1 }, // C5
    { freq: 659, time: 0.1, duration: 0.1 }, // E5
    { freq: 784, time: 0.2, duration: 0.2 }, // G5
  ];

  sequence.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(
      note.freq,
      audioContext.currentTime + note.time
    );
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + note.time);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + note.time + note.duration
    );

    oscillator.start(audioContext.currentTime + note.time);
    oscillator.stop(audioContext.currentTime + note.time + note.duration);
  });
}

function playPowerUpSound() {
  // Magical ascending sparkle
  const sparkle = [
    { freq: 1000, time: 0 },
    { freq: 1200, time: 0.05 },
    { freq: 1400, time: 0.1 },
    { freq: 1600, time: 0.15 },
    { freq: 1800, time: 0.2 },
  ];

  sparkle.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(
      note.freq,
      audioContext.currentTime + note.time
    );
    gainNode.gain.setValueAtTime(0.06, audioContext.currentTime + note.time);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + note.time + 0.08
    );

    oscillator.start(audioContext.currentTime + note.time);
    oscillator.stop(audioContext.currentTime + note.time + 0.08);
  });
}

function startBackgroundMusic() {
  if (!audioContext || isMusicPlaying) return;

  try {
    // Start the 1-minute looping background music
    backgroundMusic = createSimpleMusicLoop();
    isMusicPlaying = true;
    console.log('Background music started successfully');
  } catch (error) {
    console.warn('Background music failed:', error.message);
    // Fallback to even simpler music
    try {
      backgroundMusic = createBasicMusicLoop();
      isMusicPlaying = true;
      console.log('Fallback music started');
    } catch (fallbackError) {
      console.warn('Fallback music also failed:', fallbackError.message);
    }
  }
}

function stopBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.stop();
    backgroundMusic = null;
    isMusicPlaying = false;
  }
}

function createSimpleMusicLoop() {
  // Create a 1-minute chiptune loop with multiple sections
  const sections = [
    // Intro - 15 seconds
    {
      name: 'intro',
      duration: 15,
      pattern: [
        // Gentle opening
        { note: 'C4', duration: 0.5, velocity: 0.03 },
        { note: 'E4', duration: 0.5, velocity: 0.03 },
        { note: 'G4', duration: 0.5, velocity: 0.025 },
        { note: 'C5', duration: 1.0, velocity: 0.025 },
        { note: 'G4', duration: 0.5, velocity: 0.03 },
        { note: 'E4', duration: 0.5, velocity: 0.03 },
        { note: 'C4', duration: 1.5, velocity: 0.025 },
        // Build up
        { note: 'D4', duration: 0.4, velocity: 0.035 },
        { note: 'F4', duration: 0.4, velocity: 0.035 },
        { note: 'A4', duration: 0.6, velocity: 0.03 },
        { note: 'D5', duration: 0.8, velocity: 0.03 },
        { note: 'A4', duration: 0.4, velocity: 0.035 },
        { note: 'F4', duration: 0.4, velocity: 0.035 },
        { note: 'D4', duration: 1.2, velocity: 0.03 }
      ]
    },
    // Main theme - 20 seconds
    {
      name: 'main',
      duration: 20,
      pattern: [
        // Catchy melody
        { note: 'E4', duration: 0.3, velocity: 0.04 },
        { note: 'G4', duration: 0.3, velocity: 0.04 },
        { note: 'B4', duration: 0.4, velocity: 0.035 },
        { note: 'E5', duration: 0.6, velocity: 0.035 },
        { note: 'B4', duration: 0.3, velocity: 0.04 },
        { note: 'G4', duration: 0.3, velocity: 0.04 },
        { note: 'E4', duration: 0.8, velocity: 0.035 },
        // Variation
        { note: 'F4', duration: 0.25, velocity: 0.045 },
        { note: 'A4', duration: 0.25, velocity: 0.045 },
        { note: 'C5', duration: 0.25, velocity: 0.04 },
        { note: 'F5', duration: 0.5, velocity: 0.04 },
        { note: 'C5', duration: 0.25, velocity: 0.045 },
        { note: 'A4', duration: 0.25, velocity: 0.045 },
        { note: 'F4', duration: 0.65, velocity: 0.04 },
        // Bridge
        { note: 'G4', duration: 0.35, velocity: 0.04 },
        { note: 'B4', duration: 0.35, velocity: 0.04 },
        { note: 'D5', duration: 0.35, velocity: 0.035 },
        { note: 'G5', duration: 0.7, velocity: 0.035 },
        { note: 'D5', duration: 0.35, velocity: 0.04 },
        { note: 'B4', duration: 0.35, velocity: 0.04 },
        { note: 'G4', duration: 0.9, velocity: 0.035 }
      ]
    },
    // Build tension - 15 seconds
    {
      name: 'build',
      duration: 15,
      pattern: [
        // Increasing intensity
        { note: 'A4', duration: 0.2, velocity: 0.045 },
        { note: 'C5', duration: 0.2, velocity: 0.045 },
        { note: 'E5', duration: 0.3, velocity: 0.04 },
        { note: 'A5', duration: 0.5, velocity: 0.04 },
        { note: 'E5', duration: 0.2, velocity: 0.045 },
        { note: 'C5', duration: 0.2, velocity: 0.045 },
        { note: 'A4', duration: 0.6, velocity: 0.04 },
        // Faster rhythm
        { note: 'B4', duration: 0.15, velocity: 0.05 },
        { note: 'D5', duration: 0.15, velocity: 0.05 },
        { note: 'F5', duration: 0.2, velocity: 0.045 },
        { note: 'B5', duration: 0.4, velocity: 0.045 },
        { note: 'F5', duration: 0.15, velocity: 0.05 },
        { note: 'D5', duration: 0.15, velocity: 0.05 },
        { note: 'B4', duration: 0.5, velocity: 0.045 }
      ]
    },
    // Climax & resolution - 10 seconds
    {
      name: 'climax',
      duration: 10,
      pattern: [
        // Powerful climax
        { note: 'C5', duration: 0.1, velocity: 0.06 },
        { note: 'E5', duration: 0.1, velocity: 0.06 },
        { note: 'G5', duration: 0.15, velocity: 0.055 },
        { note: 'C6', duration: 0.25, velocity: 0.055 },
        { note: 'G5', duration: 0.1, velocity: 0.06 },
        { note: 'E5', duration: 0.1, velocity: 0.06 },
        { note: 'C5', duration: 0.29, velocity: 0.055 },
        // Resolution
        { note: 'F4', duration: 0.3, velocity: 0.04 },
        { note: 'A4', duration: 0.3, velocity: 0.04 },
        { note: 'C5', duration: 0.4, velocity: 0.035 },
        { note: 'F5', duration: 0.6, velocity: 0.035 },
        { note: 'C5', duration: 0.3, velocity: 0.04 },
        { note: 'A4', duration: 0.3, velocity: 0.04 },
        { note: 'F4', duration: 0.8, velocity: 0.035 }
      ]
    }
  ];

  const noteFreq = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
    'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
    'A5': 880.00, 'B5': 987.77, 'C6': 1046.50
  };

  let loopCount = 0;

  function playSection(sectionIndex = 0) {
    if (!isMusicPlaying) return;

    const section = sections[sectionIndex];
    let sectionStartTime = audioContext.currentTime;
    let patternIndex = 0;

    function playNextNoteInSection() {
      if (!isMusicPlaying) return;

      if (patternIndex >= section.pattern.length) {
        // Section complete, move to next section or loop
        const nextSectionIndex = (sectionIndex + 1) % sections.length;
        if (nextSectionIndex === 0) loopCount++;

        // Small pause between sections (0.2 seconds)
        setTimeout(() => playSection(nextSectionIndex), 200);
        return;
      }

      const noteData = section.pattern[patternIndex];
      const noteTime = sectionStartTime + section.pattern.slice(0, patternIndex)
        .reduce((sum, note) => sum + note.duration, 0);

      // Create main melody oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(noteFreq[noteData.note], noteTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(noteData.velocity, noteTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + noteData.duration * 0.8);

      oscillator.start(noteTime);
      oscillator.stop(noteTime + noteData.duration);

      // Add subtle harmony for richness
      if (patternIndex % 3 === 0) { // Every third note
        const harmonyOsc = audioContext.createOscillator();
        const harmonyGain = audioContext.createGain();

        harmonyOsc.connect(harmonyGain);
        harmonyGain.connect(audioContext.destination);

        harmonyOsc.frequency.setValueAtTime(noteFreq[noteData.note] * 1.25, noteTime);
        harmonyOsc.type = 'sine';

        harmonyGain.gain.setValueAtTime(noteData.velocity * 0.15, noteTime);
        harmonyGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteData.duration * 0.6);

        harmonyOsc.start(noteTime);
        harmonyOsc.stop(noteTime + noteData.duration);
      }

      patternIndex++;
      // Schedule next note quickly
      setTimeout(playNextNoteInSection, 5);
    }

    playNextNoteInSection();
  }

  // Start with intro section
  playSection(0);

  return {
    stop: () => {
      isMusicPlaying = false;
    }
  };
}

function createBasicMusicLoop() {
  // Simple fallback melody if the complex one fails
  const melody = [
    { note: 'C4', duration: 0.5 },
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 0.5 },
    { note: 'C4', duration: 1.0 }
  ];

  const noteFreq = {
    'C4': 261.63, 'E4': 329.63, 'G4': 392.00, 'C5': 523.25
  };

  function playMelody() {
    if (!isMusicPlaying) return;

    let currentTime = audioContext.currentTime;

    melody.forEach(noteData => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(noteFreq[noteData.note], currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.03, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + noteData.duration * 0.8);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + noteData.duration);

      currentTime += noteData.duration;
    });

    // Loop every 4 seconds
    if (isMusicPlaying) {
      setTimeout(playMelody, 4000);
    }
  }

  playMelody();

  return {
    stop: () => {
      isMusicPlaying = false;
    }
  };
}
