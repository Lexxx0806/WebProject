/* =========================================
   1. CALCULATOR LOGIC
   ========================================= */
function calcPoints() {
  // Get Values (Prevent negative numbers)
  const gb = Math.max(0, Number(document.getElementById("gb").value) || 0);
  const stream = Math.max(
    0,
    Number(document.getElementById("stream").value) || 0
  );
  const email = Math.max(
    0,
    Number(document.getElementById("email").value) || 0
  );
  const dup = Math.max(
    0,
    Math.min(100, Number(document.getElementById("dup").value) || 0)
  );

  // Calculate Formula
  const dupGb = gb * (dup / 100);
  const points = Math.round(gb * 2 + stream * 3 + email * 1 + dupGb * 1.5);

  // Update Text
  const pointsEl = document.getElementById("points");
  const msgEl = document.getElementById("feedback-msg");
  const resultBox = document.getElementById("result-box");

  pointsEl.textContent = points.toString();

  // Color & Message Logic
  resultBox.classList.remove("score-low", "score-med", "score-high");
  msgEl.classList.remove("score-low", "score-med", "score-high");

  if (points < 100) {
    resultBox.classList.add("score-low");
    msgEl.textContent = "Eco Warrior! 🌿";
    msgEl.style.color = "#34d399";
  } else if (points < 300) {
    resultBox.classList.add("score-med");
    msgEl.textContent = "Average User 😐";
    msgEl.style.color = "#fbbf24";
  } else {
    resultBox.classList.add("score-high");
    msgEl.textContent = "Data Hoarder! 🚨";
    msgEl.style.color = "#f87171";
  }

  // Save to Local Storage
  localStorage.setItem("savedScore", points);

  // Reveal Real World Visualizer
  const visualizer = document.getElementById("visualizer");
  if (visualizer) visualizer.style.display = "block";

  // Math Conversions (Illustrative)
  const carKm = (points * 0.15).toFixed(1);
  const phones = Math.round(points * 60);

  document.getElementById("car-miles").textContent = carKm;
  document.getElementById("phone-charges").textContent =
    phones.toLocaleString();
}

function loadSaved() {
  const saved = localStorage.getItem("savedScore");
  if (saved) {
    document.getElementById("points").textContent = saved;
    document.getElementById("feedback-msg").textContent = "Welcome Back";
  }
}

/* =========================================
   2. SOCIAL & RESET LOGIC
   ========================================= */
function shareScore() {
  const score = document.getElementById("points").textContent;
  if (score === "—") return alert("Please calculate your score first!");

  const text = `I just checked my Digital Waste footprint! My score is ${score}. Check yours here:`;
  const url = window.location.href;

  if (navigator.share) {
    navigator
      .share({
        title: "Digital Waste Calculator",
        text: text,
        url: url,
      })
      .catch(console.error);
  } else {
    navigator.clipboard.writeText(`${text} ${url}`);
    const btn = document.getElementById("share-btn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => (btn.innerHTML = originalHTML), 2000);
  }
}

function resetCalculator() {
  localStorage.removeItem("savedScore");

  // Reset UI
  document.getElementById("points").textContent = "—";
  const msgEl = document.getElementById("feedback-msg");
  msgEl.textContent = "Click Calculate";
  msgEl.className = "badge";
  msgEl.style.color = "";
  document.getElementById("result-box").className = "kpi";

  // Hide Visualizer
  const visualizer = document.getElementById("visualizer");
  if (visualizer) visualizer.style.display = "none";

  // Reset Inputs
  document.getElementById("gb").value = 50;
  document.getElementById("stream").value = 10;
  document.getElementById("email").value = 20;
  document.getElementById("dup").value = 15;
}

/* =========================================
   3. MINI-GAME LOGIC (SERVER SAVER)
   ========================================= */
const gameBoard = document.getElementById("game-board");
const overlay = document.getElementById("game-overlay");
const msgEl = document.getElementById("game-msg");
const startBtn = document.getElementById("start-game-btn");
const scoreEl = document.getElementById("game-score");
const livesEl = document.getElementById("game-lives");

let gameInterval;
let score = 0;
let lives = 5;
let gameActive = false;
const icons = [
  "fa-file-image",
  "fa-file-zipper",
  "fa-envelope",
  "fa-film",
  "fa-trash-can",
];

function startGame() {
  score = 0;
  lives = 5;
  gameActive = true;

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  overlay.style.display = "none";

  // Clear old items
  document.querySelectorAll(".falling-item").forEach((el) => el.remove());

  gameLoop();
}

function gameLoop() {
  if (!gameActive) return;
  spawnItem();

  // Spawn rate gets faster as score increases
  let nextSpawn = Math.max(300, 1000 - score * 20);
  gameInterval = setTimeout(gameLoop, nextSpawn);
}

function spawnItem() {
  const item = document.createElement("i");
  const iconClass = icons[Math.floor(Math.random() * icons.length)];
  item.classList.add("fa-solid", iconClass, "falling-item");

  // Random Position
  item.style.left = Math.floor(Math.random() * 90) + "%";
  item.style.top = "-30px";

  // Click to delete
  item.addEventListener("mousedown", () => {
    if (!gameActive) return;
    score++;
    scoreEl.textContent = score;
    item.classList.add("popped");
    setTimeout(() => item.remove(), 200);
  });

  gameBoard.appendChild(item);

  // Animation Logic
  let pos = -30;
  const speed = 2 + score / 15; // Speed increases with score

  const fallInterval = setInterval(() => {
    if (!gameActive) {
      clearInterval(fallInterval);
      return;
    }

    pos += speed;
    item.style.top = pos + "px";

    // Check collision (bottom of board)
    if (pos > 360) {
      clearInterval(fallInterval);
      if (item.parentNode) {
        item.remove();
        loseLife();
      }
    }
  }, 20);
}

function loseLife() {
  lives--;
  livesEl.textContent = lives;

  // Red flash effect
  gameBoard.style.borderColor = "#f87171";
  setTimeout(
    () => (gameBoard.style.borderColor = "rgba(255,255,255,0.1)"),
    200
  );

  if (lives <= 0) endGame();
}

function endGame() {
  gameActive = false;
  clearTimeout(gameInterval);
  msgEl.textContent = `Game Over! Score: ${score}`;
  startBtn.textContent = "Play Again";
  overlay.style.display = "flex";
}

/* =========================================
   4. EVENT LISTENERS
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Calculator Events
  const calcBtn = document.getElementById("calc");
  if (calcBtn) calcBtn.addEventListener("click", calcPoints);

  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) shareBtn.addEventListener("click", shareScore);

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", resetCalculator);

  // Game Events
  if (startBtn) startBtn.addEventListener("click", startGame);

  // Load Memory
  loadSaved();
});

// Smooth Scroll for Nav Links
document
  .querySelectorAll('nav[aria-label="Main"] a[href^="#"]')
  .forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", link.getAttribute("href"));
      }
    });
  });
  