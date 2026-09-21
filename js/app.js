const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

const intro = document.getElementById("intro");
const reveal = document.getElementById("reveal");
const message = document.querySelector(".message");
const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");
const nameOutput = document.getElementById("nameOutput");
const messageOutput = document.getElementById("messageOutput");

nameOutput.textContent = CONFIG.nombre;
messageOutput.textContent = CONFIG.mensaje;

let width = 0;
let height = 0;
let stars = [];
let petals = [];
let animationFrame = null;
let animationStart = 0;
let state = "intro";

const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createStars();
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createStars() {
  const count = Math.max(
    40,
    Math.min(Number(CONFIG.cantidadEstrellas) || 180, 500)
  );

  stars = Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    size: random(0.4, 1.9),
    alpha: random(0.25, 0.95),
    twinkle: random(0.0015, 0.004),
    phase: random(0, Math.PI * 2),
    speed: random(0.05, 0.22),
    angle: random(0, Math.PI * 2),
    targetX: width / 2,
    targetY: height / 2
  }));
}

function createPetals() {
  const flowerCount = Math.max(
    3,
    Math.min(Number(CONFIG.cantidadFlores) || 8, 14)
  );

  petals = [];

  // Posiciones aproximadas de los centros de las flores del ramo.
  const flowerCenters = [];
  const centerX = width / 2;
  const centerY = height * 0.57;

  for (let i = 0; i < flowerCount; i++) {
    const t = flowerCount === 1 ? 0.5 : i / (flowerCount - 1);
    const x = centerX + (t - 0.5) * Math.min(width * 0.42, 430);
    const y = centerY - Math.abs(t - 0.5) * Math.min(height * 0.13, 90);
    flowerCenters.push({ x, y });
  }

  flowerCenters.forEach((flower, flowerIndex) => {
    const petalCount = 10;

    for (let p = 0; p < petalCount; p++) {
      const angle = (Math.PI * 2 * p) / petalCount;
      const radius = 15 + random(-3, 5);

      petals.push({
        flowerIndex,
        angle,
        radius,
        size: random(7, 12),
        startX: random(0, width),
        startY: random(0, height),
        x: flower.x + Math.cos(angle) * radius,
        y: flower.y + Math.sin(angle) * radius,
        centerX: flower.x,
        centerY: flower.y,
        delay: random(0, 0.42)
      });
    }

    // Centro de la flor.
    petals.push({
      flowerIndex,
      angle: 0,
      radius: 0,
      size: 7,
      startX: random(0, width),
      startY: random(0, height),
      x: flower.x,
      y: flower.y,
      centerX: flower.x,
      centerY: flower.y,
      delay: random(0.15, 0.55),
      center: true
    });
  });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function drawSpace(time) {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72
  );

  gradient.addColorStop(0, "#0a0d1c");
  gradient.addColorStop(0.55, "#030511");
  gradient.addColorStop(1, "#010106");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    const pulse =
      star.alpha +
      Math.sin(time * star.twinkle + star.phase) * 0.22;

    ctx.globalAlpha = Math.max(0.05, Math.min(1, pulse));
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawConvergingStars(progress) {
  const centerX = width / 2;
  const centerY = height * 0.56;

  stars.forEach((star, index) => {
    if (!star.targetSet) {
      const angle = (index / stars.length) * Math.PI * 2;
      const radius = Math.min(width, height) * random(0.15, 0.48);

      star.targetX = centerX + Math.cos(angle) * radius;
      star.targetY = centerY + Math.sin(angle) * radius * 0.58;
      star.targetSet = true;
    }

    const t = easeInOut(Math.min(1, progress));
    const arc = Math.sin(progress * Math.PI) * random(4, 16);

    const dx = star.targetX - star.x;
    const dy = star.targetY - star.y;
    const distance = Math.hypot(dx, dy) || 1;

    const nx = -dy / distance;
    const ny = dx / distance;

    const x = star.x + dx * t + nx * arc;
    const y = star.y + dy * t + ny * arc;

    ctx.globalAlpha = Math.max(0.12, star.alpha * (1 - progress * 0.15));
    ctx.fillStyle = progress > 0.72 ? "#ffd83d" : "#ffffff";

    ctx.beginPath();
    ctx.arc(x, y, star.size * (1 + progress * 0.7), 0, Math.PI * 2);
    ctx.fill();

    if (progress > 0.15) {
      ctx.globalAlpha = 0.08 * (1 - progress);
      ctx.strokeStyle = "#fff1a8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - dx * 0.025, y - dy * 0.025);
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1;
}

function drawPetals(progress) {
  petals.forEach((petal) => {
    const local =
      Math.max(0, Math.min(1, (progress - petal.delay) / (1 - petal.delay)));

    const t = easeOutCubic(local);

    const x = petal.startX + (petal.x - petal.startX) * t;
    const y = petal.startY + (petal.y - petal.startY) * t;

    const opacity = Math.min(1, local * 1.8);

    ctx.save();
    ctx.translate(x, y);

    if (petal.center) {
      ctx.fillStyle = `rgba(91, 55, 8, ${opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, petal.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.rotate(petal.angle + Math.PI / 2);
      ctx.fillStyle = `rgba(255, 216, 61, ${opacity})`;
      ctx.shadowColor = "rgba(255, 216, 61, 0.4)";
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.ellipse(0, -petal.size * 0.72, petal.size * 0.48, petal.size, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawStemAndLeaves(progress) {
  if (progress <= 0) return;

  const t = easeOutCubic(Math.min(1, progress));
  const baseX = width / 2;
  const baseY = height * 0.95;
  const topY = height * 0.59;

  ctx.save();
  ctx.globalAlpha = t;

  ctx.strokeStyle = "#496c37";
  ctx.lineWidth = Math.max(2, width * 0.004);
  ctx.lineCap = "round";

  // Tall stems.
  for (let i = -4; i <= 4; i++) {
    const xTop = baseX + i * Math.min(width * 0.045, 34);

    ctx.beginPath();
    ctx.moveTo(baseX + i * 5, baseY);
    ctx.quadraticCurveTo(
      baseX + i * 8,
      height * 0.75,
      xTop,
      topY + Math.abs(i) * 8
    );
    ctx.stroke();
  }

  // Leaves.
  ctx.fillStyle = "#5e843f";

  for (let i = -3; i <= 3; i++) {
    const y = height * (0.76 + Math.abs(i) * 0.025);
    const x = baseX + i * 28;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i * 0.16);
    ctx.beginPath();
    ctx.ellipse(i < 0 ? -16 : 16, 0, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function finishReveal() {
  state = "complete";
  reveal.classList.add("active");
  message.classList.add("visible");
}

function animate(timestamp) {
  if (!animationStart) animationStart = timestamp;

  const elapsed = timestamp - animationStart;
  const duration = Math.max(2500, Number(CONFIG.duracionFormacion) || 6500);
  const progress = Math.min(1, elapsed / duration);

  drawSpace(timestamp);

  if (state === "forming") {
    drawConvergingStars(Math.min(1, progress * 1.12));

    if (progress > 0.38) {
      const flowerProgress = Math.min(1, (progress - 0.38) / 0.62);
      drawStemAndLeaves(flowerProgress);
      drawPetals(flowerProgress);
    }

    if (progress >= 1) {
      finishReveal();
      return;
    }
  } else if (state === "complete") {
    drawStemAndLeaves(1);
    drawPetals(1);
  }

  animationFrame = requestAnimationFrame(animate);
}

function startExperience() {
  if (animationFrame) cancelAnimationFrame(animationFrame);

  intro.classList.remove("active");
  reveal.classList.remove("active");
  message.classList.remove("visible");

  createStars();
  stars.forEach((star) => {
    star.targetSet = false;
  });

  createPetals();

  state = "forming";
  animationStart = 0;

  if (prefersReducedMotion) {
    drawSpace(0);
    drawStemAndLeaves(1);
    drawPetals(1);
    finishReveal();
    return;
  }

  animationFrame = requestAnimationFrame(animate);
}

function replay() {
  message.classList.remove("visible");
  reveal.classList.remove("active");

  setTimeout(() => {
    startExperience();
  }, 350);
}

startBtn.addEventListener("click", startExperience);
replayBtn.addEventListener("click", replay);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
drawSpace(0);
