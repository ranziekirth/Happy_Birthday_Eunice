/* ============================================================================
   BIRTHDAY WEBSITE — SCRIPT.JS
   Read top to bottom — it runs in this order:
   1. CONFIG          — the few things you actually need to edit
   2. BACKGROUND       — falling balloons + pink confetti (decorative, runs always)
   3. SOUND            — how the two audio files get played
   4. COUNTDOWN        — the timer logic
   5. PHOTO BOOTH      — the 4-photo strip reveal
   6. FINAL GALLERY    — main photo + balloon banner + your scattered photos
   7. WIRING           — connects the button + kicks things off
   ============================================================================ */


/* ============================================================================
   1. CONFIG — edit these values, you shouldn't need to touch anything below
   ============================================================================ */

// The main photo shown centered on the final gallery screen.
const MAIN_IMAGE = "assets/images/main photo.png";

// 👉 YOUR 4 PHOTO-BOOTH STRIP PHOTOS, left to right.
const BOOTH_IMAGES = [
  "assets/images/Image1.jpeg",
  "assets/images/Image2.jpg",
  "assets/images/Image3.jpeg",
  "assets/images/Image4.jpg",
];

// 👉 Your "Happy Birthday" balloon graphic, shown above the main photo.
const BALLOON_BANNER_IMAGE = "assets/images/balloon.png";

// 👉 YOUR RANDOM / SCATTERED PHOTOS.
// Add as many file paths as you want here — every entry becomes one
// photo scattered around the main image on the final screen.
// Put the actual image files inside assets/images/ and reference them here.
const GALLERY_IMAGES = [
  // "assets/images/photo1.jpg",
  // "assets/images/photo2.jpg",
  // "assets/images/photo3.jpg",
];

const BALLOON_COLORS  = ["#FF2D87", "#FF6FA5", "#B388EB", "#FFD166", "#FF8FC7"];
const CONFETTI_COLORS = ["#FF2D87", "#FFD166", "#B388EB", "#5CE1E6", "#FFFFFF"];


/* ============================================================================
   2. BACKGROUND — falling balloons, confetti (3 shapes), and twinkling sparkles
   This runs continuously in the background on every screen.
   ============================================================================ */

const balloonLayer  = document.getElementById("balloon-layer");
const confettiLayer = document.getElementById("confetti-layer");

function spawnBalloon() {
  const el = document.createElement("div");
  el.className = "balloon";
  const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  el.style.left = Math.random() * 100 + "vw";
  // radial-gradient adds the glossy shine highlight on top of the flat color
  el.style.background = `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), transparent 45%), ${color}`;
  el.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
  el.style.setProperty("--spin", (Math.random() * 40 - 20) + "deg");
  const duration = 8 + Math.random() * 5; // seconds
  el.style.animationDuration = duration + "s";
  balloonLayer.appendChild(el);
  // clean up once it's off-screen so the DOM doesn't pile up
  setTimeout(() => el.remove(), duration * 1000);
}

const CONFETTI_SHAPES = ["shape-rect", "shape-circle", "shape-triangle"];

function spawnConfetti() {
  const el = document.createElement("div");
  const shape = CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)];
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.className = "confetti-piece " + (shape === "shape-rect" ? "" : shape);
  el.style.left = Math.random() * 100 + "vw";
  if (shape === "shape-triangle") {
    el.style.setProperty("--tri-color", color); // triangles are drawn with borders, not background
  } else {
    el.style.background = color;
  }
  el.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
  el.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
  const duration = 4 + Math.random() * 4;
  el.style.animationDuration = duration + "s";
  confettiLayer.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000);
}

function spawnSparkle() {
  const el = document.createElement("div");
  el.className = "sparkle";
  const size = 8 + Math.random() * 10;
  el.style.width = size + "px";
  el.style.height = size + "px";
  el.style.left = Math.random() * 100 + "vw";
  el.style.top = Math.random() * 100 + "vh";
  el.style.background = Math.random() > 0.5 ? "var(--gold)" : "var(--pink)";
  const duration = 1.4 + Math.random() * 1.4;
  el.style.animationDuration = duration + "s";
  confettiLayer.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000);
}

// Spawn new pieces often and in good numbers — this is the "so many
// animations happening" background. Tune these numbers up/down to taste:
// lower ms = more frequent = busier background.
setInterval(spawnBalloon, 420);
setInterval(() => { spawnConfetti(); spawnConfetti(); }, 110); // two pieces per tick = denser fall
setInterval(spawnSparkle, 240);

// A starter burst so the page is already lively in the first second.
for (let i = 0; i < 26; i++) {
  setTimeout(spawnConfetti, i * 45);
}
for (let i = 0; i < 6; i++) {
  setTimeout(spawnBalloon, i * 180);
}


/* ============================================================================
   3. SOUND
   Browsers block audio from autoplaying until the visitor interacts with
   the page (e.g. a click). That's exactly what the "Ready" button gives us,
   so both sounds are only ever triggered from user actions or from code
   that runs after that first click.

   tick-sound.mp3 narrates the ENTIRE 5→0 count by itself (it's one clip,
   not a single "tick" sound effect) — so it's only ever started ONCE, right
   when the countdown begins, never re-triggered per digit. It also gets
   explicitly stopped the instant the visual countdown reaches 0, so it can
   never keep playing in the background after the count is over.
   ============================================================================ */

const tickSound   = document.getElementById("tick-sound");
const revealSound = document.getElementById("reveal-sound");

function playCountdownAudio() {
  tickSound.currentTime = 0;
  tickSound.volume = 0.7;
  tickSound.play().catch(() => {
    // Autoplay was blocked, or the mp3 file isn't there yet — fail quietly.
  });
}

function stopCountdownAudio() {
  tickSound.pause();
  tickSound.currentTime = 0;
}

function playReveal() {
  revealSound.volume = 0.8;
  revealSound.currentTime = 0;
  revealSound.play().catch(() => {});
}


/* ============================================================================
   4. COUNTDOWN — a simple 5, 4, 3, 2, 1, 0 count triggered by the button.
   ============================================================================ */

const startBtn         = document.getElementById("start-btn");
const countdownNumber  = document.getElementById("countdown-number");

// Change this to start the count from a different number, e.g. 10.
const COUNTDOWN_START = 5;

let current = COUNTDOWN_START;
let countdownTimer = null;

// Updates the number on screen and replays its little "pop" animation.
function showNumber(n) {
  countdownNumber.textContent = n;
  countdownNumber.classList.remove("pop");
  void countdownNumber.offsetWidth; // forces the browser to notice the class was removed, so re-adding it restarts the animation
  countdownNumber.classList.add("pop");
}

function tickCountdown() {
  showNumber(current);

  if (current <= 0) {
    clearInterval(countdownTimer);
    stopCountdownAudio(); // cut the narration off right as the visual count ends
    onCountdownFinished();
    return;
  }
  current--;
}

function startCountdown() {
  startBtn.classList.add("is-hidden");
  countdownNumber.classList.remove("is-hidden");
  current = COUNTDOWN_START;
  playCountdownAudio(); // starts once here, not per tick
  tickCountdown(); // show the first number immediately, no 1s blank delay
  countdownTimer = setInterval(tickCountdown, 1000);
}


/* ============================================================================
   5. PHOTO BOOTH — horizontal 4-photo strip reveal.
   Sequence: switch to the booth screen -> each of the 4 frames pops in one
   after another with a little flash (timing lives in style.css, see the
   .booth-frame / .booth-flash animation-delay values) -> pause so people
   can look at it -> strip fades out -> switch to the final gallery.
   ============================================================================ */

const boothScreen   = document.getElementById("booth-screen");
const boothStage    = document.querySelector(".photobooth-stage");
const galleryScreen = document.getElementById("gallery-screen");

function showScreen(screenEl) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
  screenEl.classList.add("is-active");
}

function onCountdownFinished() {
  playReveal();
  showScreen(boothScreen);

  // Drop the 4 photos into the strip now that it's visible. Each frame's
  // own CSS animation (see .booth-frame in style.css) handles the staggered
  // pop-in + flash — nothing else to wire up here.
  BOOTH_IMAGES.forEach((src, i) => {
    const imgEl = document.getElementById(`booth-img-${i + 1}`);
    if (imgEl) imgEl.src = src;
  });

  // Give the strip time to finish popping in, plus a moment to sit there,
  // before moving on to the final gallery.
  setTimeout(goToGallery, 6000);
}

function goToGallery() {
  boothStage.classList.add("is-closing");
  setTimeout(() => {
    showScreen(galleryScreen);

    // Set the main photo
    const mainImg = document.getElementById("main-image");
    mainImg.src = MAIN_IMAGE;

    // Attach heart burst on click
    mainImg.addEventListener("click", burstHearts);

    // Build the balloon-style text banner instead of using an image.
    // The <img id="balloon-banner"> is hidden via CSS; we insert a sibling <div> instead.
    const bannerText = ["Happy 21st Birthday"];
    const bannerEl = document.createElement("div");
    bannerEl.className = "balloon-text-banner";

    bannerText.forEach((line, li) => {
      if (li > 0) bannerEl.appendChild(document.createElement("br"));
      [...line].forEach((ch, ci) => {
        if (ch === " ") {
          const sp = document.createElement("span");
          sp.innerHTML = "&nbsp;";
          bannerEl.appendChild(sp);
        } else {
          const span = document.createElement("span");
          span.className = "bl bl-" + ((ci % 5) + 1);
          span.textContent = ch;
          bannerEl.appendChild(span);
        }
      });
    });

    // Insert right before the existing (hidden) balloon-banner img
    const bannerImg = document.getElementById("balloon-banner");
    bannerImg.parentNode.insertBefore(bannerEl, bannerImg);

    populateGallery();
  }, 700); // matches the boothFadeOut animation duration in style.css
}


/* ============================================================================
   HEART BURST — fires when the main photo is tapped / clicked.
   Spawns 14 hearts flying outward from the click point.
   ============================================================================ */

const HEART_EMOJIS = ["❤️", "🩷", "💕", "💖", "💗", "💓", "💝"];

function burstHearts(e) {
  // Get click position (works for both mouse and touch)
  const x = e.clientX ?? (e.touches && e.touches[0].clientX) ?? window.innerWidth / 2;
  const y = e.clientY ?? (e.touches && e.touches[0].clientY) ?? window.innerHeight / 2;

  const count = 14;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "heart-burst";
    heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

    // Random outward direction + distance
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.6;
    const dist  = 80 + Math.random() * 100;
    heart.style.left = x + "px";
    heart.style.top  = y + "px";
    heart.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    heart.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    heart.style.fontSize = (1.2 + Math.random() * 1.2) + "rem";
    heart.style.animationDelay = (Math.random() * 0.12) + "s";

    document.body.appendChild(heart);
    // Remove after animation finishes
    setTimeout(() => heart.remove(), 1200);
  }
}


/* ============================================================================
   6. FINAL GALLERY — main photo + balloon banner + your scattered photos
   This reads GALLERY_IMAGES from the CONFIG section up top and scatters
   them randomly around the main photo. Just add file paths to that array;
   nothing here needs to change.
   ============================================================================ */

function populateGallery() {
  const container = document.getElementById("scattered-gallery");
  container.innerHTML = "";

  GALLERY_IMAGES.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.className = "scatter-photo";

    // Random position, keeping clear of the very center where main-photo sits.
    const top  = 5 + Math.random() * 75;   // 5% - 80% of viewport height
    const left = 5 + Math.random() * 80;   // 5% - 85% of viewport width
    const rotate = Math.random() * 30 - 15; // -15deg to 15deg

    img.style.top = top + "vh";
    img.style.left = left + "vw";
    img.style.transform = `rotate(${rotate}deg)`;
    img.style.animationDelay = (i * 0.12) + "s";

    container.appendChild(img);
  });
}


/* ============================================================================
   7. WIRING
   ============================================================================ */

startBtn.addEventListener("click", startCountdown);