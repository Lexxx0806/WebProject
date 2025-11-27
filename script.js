document.addEventListener("DOMContentLoaded", () => {
  /* 1. CUSTOM CURSOR */
  const cursor = document.getElementById("cursor");
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

  /* 2. SCROLL REVEAL */
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

  /* 3. MENU LOGIC + ACCORDION */
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const menuOverlay = document.getElementById("menu-overlay");

  // Open/Close Overlay
  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      menuOverlay.classList.add("active");
      menuToggle.style.opacity = "0";
      menuToggle.style.pointerEvents = "none";
    });
    const closeMenu = () => {
      menuOverlay.classList.remove("active");
      menuToggle.style.opacity = "1";
      menuToggle.style.pointerEvents = "auto";
    };
    if (menuClose) menuClose.addEventListener("click", closeMenu);

    // Close on specific link clicks
    document.querySelectorAll(".close-menu-on-click").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  // Accordion Logic
  document.querySelectorAll(".accordion-trigger").forEach((acc) => {
    acc.addEventListener("click", (e) => {
      e.stopPropagation();
      acc.parentElement.classList.toggle("active");
    });
  });

  /* 4. CALCULATOR */
  const calcBtn = document.getElementById("calc");
  const resetBtn = document.getElementById("reset-btn");
  const shareBtn = document.getElementById("share-btn");
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
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resultContainer.style.display = "none";
      inputs.gb.value = 50;
      inputs.stream.value = 10;
      inputs.email.value = 20;
    });
  }

  /* 5. GAME */
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
      updateTempUI();
      overlay.style.display = "none";
      document.querySelectorAll(".falling-item").forEach((e) => e.remove());
      gameLoop();
    });
  }

  function updateTempUI() {
    tempEl.textContent = temperature + "°C";
    if (temperature < 60) tempEl.style.color = "var(--success)";
    else if (temperature < 80) tempEl.style.color = "var(--accent)";
    else tempEl.style.color = "var(--danger)";
  }

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
        updateTempUI();
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

  /* 6. CHECKLIST */
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

  /* 7. 3D EARTH (WARP SPEED) */
  init3DEarth();
  function init3DEarth() {
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
      mouseY = 0;
    let spinBoost = 0;

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
});
