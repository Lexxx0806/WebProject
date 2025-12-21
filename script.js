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
  const themeBtn = document.getElementById("theme-toggle");
  const body = document.body;
  const icon = themeBtn.querySelector("i");

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    body.setAttribute("data-theme", "light");
    icon.classList.replace("fa-sun", "fa-moon");
  }

  themeBtn.addEventListener("click", () => {
    if (body.getAttribute("data-theme") === "light") {
      body.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
      icon.classList.replace("fa-moon", "fa-sun");
    } else {
      body.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      icon.classList.replace("fa-sun", "fa-moon");
    }
  });

  // Menu
  const menuToggle = document.getElementById("menu-toggle");
  const menuOverlay = document.getElementById("menu-overlay");
  const menuClose = document.getElementById("menu-close");

  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      menuOverlay.classList.add("active");
      menuToggle.style.opacity = 0;
    });
    const closeFn = () => {
      menuOverlay.classList.remove("active");
      menuToggle.style.opacity = 1;
    };
    menuClose.addEventListener("click", closeFn);
    document
      .querySelectorAll(".menu-link")
      .forEach((l) => l.addEventListener("click", closeFn));
  }



  // Cursor
  const cursor = document.getElementById("cursor");
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () =>
      document.body.classList.add("hovering")
    );
    el.addEventListener("mouseleave", () =>
      document.body.classList.remove("hovering")
    );
  });

  // Scroll Reveal
  const observer = new IntersectionObserver(
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
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* --- 2. INBOX HUNTER --- */
function initInboxHunter() {
  const providerSel = document.getElementById("mail-provider");
  const missionSel = document.getElementById("mail-mission");
  const btn = document.getElementById("launch-mail-btn");

  if (btn) {
    btn.addEventListener("click", () => {
      const provider = providerSel.value;
      const mission = missionSel.value;
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
  inputs.forEach(id => {
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
      const gb = Math.max(0, parseFloat(document.getElementById("gb").value) || 0);
      const stream = Math.max(0, parseFloat(document.getElementById("stream").value) || 0);
      const email = Math.max(0, parseFloat(document.getElementById("email").value) || 0);

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
      statusMsg.innerHTML = "Connecting...";
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

        // PageSpeed API Check
        statusMsg.innerHTML = "Measuring Page Size...";
        const encodedUrl = encodeURIComponent(fullUrl);
        const psResponse = await fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&category=PERFORMANCE`
        );
        if (!psResponse.ok) throw new Error("PageSpeed API blocked or failed");

        const psData = await psResponse.json();
        if (!psData.lighthouseResult?.audits?.["total-byte-weight"]?.numericValue) {
          throw new Error("Invalid PageSpeed response");
        }

        const totalBytes = psData.lighthouseResult.audits["total-byte-weight"].numericValue;
        detectedSize = (totalBytes / (1024 * 1024)).toFixed(2);
        usingRealData = true;
      } catch (err) {
        console.warn("Page size measurement failed:", err.message);
        usingRealData = false;
        detectedSize = parseFloat(weightSlider.value);
      }

      // Backend API Scan
      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
              details.innerHTML = `Hosted by: <strong>${data.hostName || "Green Partner"}</strong>`;
            } else {
              hostStatus.textContent = "Standard Grid";
              hostStatus.style.color = "var(--text-muted)";
              hostCard.style.borderColor = "rgba(255,255,255,0.1)";
              details.innerHTML = "Host does not provide public green evidence.";
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
  const startBtn = document.getElementById("start-game-btn");
  const gameBoard = document.getElementById("game-board");
  const overlay = document.getElementById("game-overlay");
  const gameMsg = document.getElementById("game-msg");
  const scoreEl = document.getElementById("game-score");
  const tempEl = document.getElementById("game-lives");
  let gameInterval,
    score = 0,
    temperature = 40,
    gameActive = false;
  const icons = [
    "fa-file-image",
    "fa-film",
    "fa-envelope",
    "fa-triangle-exclamation",
  ];

  if (startBtn) {
    startBtn.addEventListener("click", () => {
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
            tempEl.textContent = temperature + "°C";

            // Progressive visual effects based on temperature
            if (temperature >= 60) {
              gameBoard.classList.add("game-heating");
              // Play warning sound for heating
              playSound('warning');
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
          createParticleExplosion(item.offsetLeft + item.offsetWidth/2, item.offsetTop + item.offsetHeight/2);

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

        // Play game over sound
        playSound('gameover');

        gameMsg.innerHTML = `<span style="color:var(--danger); font-size: 1.5rem;">🔥 System Overheated!</span><br><span style="font-size:1rem;display:block;margin-top:15px;line-height:1.5;">You cleared <b>${score}</b> items.<br>Unchecked data generates massive heat.</span>`;
        startBtn.textContent = "Cooldown & Retry";
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
  playSound('click');

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
  playSound('milestone');

  gameBoard.classList.add("screen-flash");

  setTimeout(() => {
    gameBoard.classList.remove("screen-flash");
  }, 200);
}

// --- GAME AUDIO EFFECTS ---
function playSound(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
      case 'click':
        // Short, pleasant beep for successful clicks
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;

      case 'milestone':
        // Celebration sound for score milestones
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'warning':
        // Warning sound for temperature increases
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;

      case 'gameover':
        // Descending tone for game over
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.8);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
    }
  } catch (error) {
    // Silently fail if Web Audio API is not supported
    console.warn('Audio not supported:', error.message);
  }
}
