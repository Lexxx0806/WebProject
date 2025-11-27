document.addEventListener("DOMContentLoaded", () => {
  setupGlobalUI();
  if (document.getElementById("check-site-btn")) initInspector();
  if (document.getElementById("calc")) initCalculator();
  if (document.getElementById("start-game-btn")) initGame();
  if (document.querySelectorAll(".track-btn").length > 0) initChecklist();
});

// --- 1. GLOBAL UI ---
function setupGlobalUI() {
  // Custom Cursor
  const cursor = document.getElementById("cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document
      .querySelectorAll("a, button, .menu-orb, summary, input")
      .forEach((el) => {
        el.addEventListener("mouseenter", () =>
          document.body.classList.add("hovering")
        );
        el.addEventListener("mouseleave", () =>
          document.body.classList.remove("hovering")
        );
      });
  }

  // Menu
  const toggle = document.getElementById("menu-toggle");
  const close = document.getElementById("menu-close");
  const overlay = document.getElementById("menu-overlay");
  if (toggle && overlay) {
    toggle.addEventListener("click", () => {
      overlay.classList.add("active");
      toggle.style.opacity = 0;
    });
    const closeFn = () => {
      overlay.classList.remove("active");
      toggle.style.opacity = 1;
    };
    if (close) close.addEventListener("click", closeFn);
    document
      .querySelectorAll(".close-menu-on-click")
      .forEach((l) => l.addEventListener("click", closeFn));
  }

  document.querySelectorAll(".accordion-trigger").forEach((acc) => {
    acc.addEventListener("click", (e) => {
      e.stopPropagation();
      acc.parentElement.classList.toggle("active");
    });
  });

  setupEarth();

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
    spin = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
  });
  document.addEventListener("mousedown", () => (spin = 0.5));
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  function animate() {
    requestAnimationFrame(animate);
    spin *= 0.95;
    earth.rotation.y += 0.002 + spin;
    earth.rotation.y += 0.05 * (mouseX * 0.001 - earth.rotation.y);
    earth.rotation.x += 0.05 * (mouseY * 0.001 - earth.rotation.x);
    renderer.render(scene, camera);
  }
  animate();
}

// --- 2. WEB INSPECTOR (FIXED: Updates UI on Fallback) ---
function initInspector() {
  const checkBtn = document.getElementById("check-site-btn");
  const input = document.getElementById("site-url");
  const results = document.getElementById("inspector-results");
  const statusMsg = document.getElementById("status-msg");
  const weightSlider = document.getElementById("page-weight");
  const weightVal = document.getElementById("weight-val");
  const sliderGroup = document.getElementById("manual-override");

  // State
  let currentIsGreen = false;
  let currentHostName = "Standard Grid";

  // Live Math Calculation
  function updateCalculation() {
    const sizeInMB = parseFloat(weightSlider.value);
    const sizeInGB = sizeInMB / 1024;
    const energy = sizeInGB * 0.81;
    const carbonFactor = currentIsGreen ? 50 : 442;
    const co2 = (energy * carbonFactor).toFixed(3);

    // Update Emissions
    document.getElementById("carbon-per-visit").textContent = co2 + " g";

    // Update Grading
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
    } else if (co2 < 0.656) {
      ratingEl.textContent = "D";
      ratingEl.style.color = "#f87171";
    } else {
      ratingEl.textContent = "F";
      ratingEl.classList.add("rating-bad");
    }

    // Update Breakdown Table (Estimate based on averages)
    // Images ~50%, JS ~25%, Fonts ~5%, Other ~20%
    const totalKB = sizeInMB * 1024;
    document.getElementById("total-bytes").textContent =
      totalKB.toFixed(0) + " KB";
    document.getElementById("img-bytes").textContent =
      (totalKB * 0.5).toFixed(0) + " KB";
    document.getElementById("js-bytes").textContent =
      (totalKB * 0.25).toFixed(0) + " KB";
    document.getElementById("font-bytes").textContent =
      (totalKB * 0.05).toFixed(0) + " KB";
  }

  // Slider Listener
  if (weightSlider) {
    weightSlider.addEventListener("input", (e) => {
      weightVal.textContent = e.target.value;
      updateCalculation(); // Live update
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener("click", async () => {
      const rawInput = input.value.trim();
      if (!rawInput) return alert("Please enter a URL");

      const fullUrl = rawInput.startsWith("http")
        ? rawInput
        : `https://${rawInput}`;

      checkBtn.textContent = "Scanning...";
      checkBtn.disabled = true;
      statusMsg.innerHTML = "Contacting Mission Control Server...";
      results.style.display = "none";
      sliderGroup.style.display = "none";

      // Reset State
      currentIsGreen = false;
      currentHostName = "Standard Grid";
      let usingRealData = false;

      try {
        // Call Local Server
        const response = await fetch(
          `http://localhost:3000/api/scan?url=${encodeURIComponent(fullUrl)}`
        );
        const data = await response.json();

        // Parse Data
        usingRealData = !data.isEstimate;
        currentIsGreen = data.isGreen;
        currentHostName = data.hostName || "Standard Grid";

        // Set Size (Real or Estimate)
        const mbSize = (data.bytes.total / (1024 * 1024)).toFixed(2);
        weightSlider.value = mbSize;
        weightVal.textContent = mbSize;

        // --- UPDATE HOSTING UI ---
        const hostStatus = document.getElementById("hosting-status");
        const hostCard = document.getElementById("res-green");
        const details = document.getElementById("hosting-details");

        if (currentIsGreen) {
          hostStatus.textContent = "Green Energy";
          hostStatus.style.color = "var(--success)";
          hostCard.style.borderColor = "var(--success)";
          details.innerHTML = `Hosted by: <strong>${currentHostName}</strong>`;
        } else {
          hostStatus.textContent = "Standard Grid";
          hostStatus.style.color = "var(--text-muted)";
          hostCard.style.borderColor = "rgba(255,255,255,0.1)";
          details.innerHTML = "Host does not provide public green evidence.";
        }
      } catch (err) {
        console.warn("Server Error:", err);
        usingRealData = false;
        // If server dies, default to 2.2MB Grey Hosting
        weightSlider.value = 2.2;
      }

      // Finalize
      if (usingRealData) {
        statusMsg.innerHTML = `<span style="color:var(--success)">✔ Audit Complete.</span> Real data verified.`;
      } else {
        statusMsg.innerHTML = `<span style="color:#fbbf24">⚠ Scan Blocked.</span> Using estimate (${weightSlider.value}MB).`;
        sliderGroup.style.display = "block"; // Show slider
      }

      // Force update calculation & table
      updateCalculation();
      results.style.display = "block";
      checkBtn.textContent = "Run Audit";
      checkBtn.disabled = false;
    });
  }
}

// --- 3. CALCULATOR ---
function initCalculator() {
  const calcBtn = document.getElementById("calc");
  const resetBtn = document.getElementById("reset-btn");
  const resultContainer = document.getElementById("visualizer");
  const pointsDisplay = document.getElementById("points");
  const inputs = {
    gb: document.getElementById("gb"),
    stream: document.getElementById("stream"),
    email: document.getElementById("email"),
  };

  if (calcBtn) {
    calcBtn.addEventListener("click", () => {
      const gb = parseFloat(inputs.gb.value) || 0;
      const stream = parseFloat(inputs.stream.value) || 0;
      const email = parseFloat(inputs.email.value) || 0;
      const totalCO2 = (
        gb * 0.2 +
        stream * 52 * 0.055 +
        email * 52 * 0.004
      ).toFixed(1);
      const treesNeeded = Math.ceil(totalCO2 / 21);
      pointsDisplay.textContent = totalCO2;
      resultContainer.style.display = "flex";
      const circle = document.querySelector(".score-circle");
      const msg = document.getElementById("feedback-msg");
      if (totalCO2 < 50) {
        msg.textContent = "Eco-Friendly 🌿";
        circle.style.borderColor = "var(--success)";
      } else if (totalCO2 < 150) {
        msg.textContent = "Average Footprint ☁️";
        circle.style.borderColor = "var(--accent)";
      } else {
        msg.textContent = "Heavy Emitter 🏭";
        circle.style.borderColor = "var(--danger)";
      }
      document.getElementById(
        "comparison-text"
      ).innerHTML = `Your digital habits produce <strong>${totalCO2} kg</strong> of CO₂ per year.<br>You would need <strong>${treesNeeded} trees</strong> 🌳 to absorb this pollution.`;
      resultContainer.scrollIntoView({ behavior: "smooth" });
    });
    resetBtn.addEventListener("click", () => {
      resultContainer.style.display = "none";
      inputs.gb.value = 50;
      inputs.stream.value = 10;
      inputs.email.value = 20;
    });
  }
}

// --- 4. CHECKLIST ---
function initChecklist() {
  const trackBtns = document.querySelectorAll(".track-btn");
  const progressBar = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  let completedTasks = new Set();
  trackBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const card = document.getElementById(targetId);
      if (!completedTasks.has(targetId)) {
        completedTasks.add(targetId);
        card.classList.add("completed");
        const percentage = (completedTasks.size / 3) * 100;
        progressBar.style.width = percentage + "%";
        progressText.textContent = Math.round(percentage) + "% Complete";
        if (completedTasks.size === 3) {
          progressText.textContent = "100% - Clean! 🚀";
          progressText.style.color = "var(--success)";
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.3 } });
        }
      }
    });
  });
}

// --- 5. GAME ---
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
            if (temperature >= 80) tempEl.style.color = "var(--danger)";
            gameBoard.style.borderColor = "var(--danger)";
            setTimeout(
              () => (gameBoard.style.borderColor = "rgba(255,255,255,0.05)"),
              200
            );
            if (temperature >= 90) endGame();
          }
        }, 20);
        item.addEventListener("mousedown", () => {
          if (!gameActive) return;
          clearInterval(fallTimer);
          item.classList.add("popped");
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
        gameMsg.innerHTML = `<span style="color:var(--danger); font-size: 1.5rem;">🔥 System Overheated!</span><br><span style="font-size:1rem;color:#fff;display:block;margin-top:15px;line-height:1.5;">You cleared <b>${score}</b> items.<br>Unchecked data generates massive heat.</span>`;
        startBtn.textContent = "Cooldown & Retry";
        overlay.style.display = "flex";
      }
      gameLoop();
    });
  }
}
