# 🎂 Birthday Website — Setup Guide

Three files, exactly as you asked:

```
birthday-website/
├── index.html      ← structure
├── style.css       ← all visuals (background, balloons, confetti, book, gallery)
├── script.js       ← all behavior (countdown, sounds, animation sequence)
└── assets/
    ├── sounds/      ← put tick.mp3 and reveal.mp3 here
    └── images/      ← put main-photo.jpg + your gallery photos here
```

Open `index.html` in a browser to preview it any time. For best results
(especially so audio and image paths behave correctly), open the folder
in VS Code and use the "Live Server" extension instead of double-clicking
the file directly — right-click `index.html` → "Open with Live Server".

---

## 1. How the falling balloons + confetti work

No external library needed — `script.js` creates a new balloon `<div>`
roughly every 900ms and a confetti `<div>` every 250ms, gives each one a
random horizontal position, color, drift, and fall speed, then lets CSS
animate it from the top of the screen to the bottom (`fall-balloon` and
`fall-confetti` keyframes in `style.css`). Each piece deletes itself once
it's off-screen so the page doesn't slow down over time.

If you'd rather use a dedicated confetti library for a fancier *burst*
effect (e.g. one big confetti explosion at the exact moment the countdown
ends, in addition to the falling background), the most popular free one is
**canvas-confetti**. You'd add one line to `index.html` before `script.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
```

and then call `confetti()` anywhere in `script.js` (for example, inside
`onCountdownFinished()`). This is optional — the site works fully without it.

---

## 2. Adding the two sounds

Browsers don't allow sound to play automatically — it has to start after
the visitor clicks something. The "Start the Celebration" button is that
click, so everything works correctly as long as you don't try to trigger
sound before the visitor has interacted with the page at least once.

**Steps:**

1. Get two short mp3 files:
   - **tick.mp3** — a clock-tick or beep sound (plays once per second during the countdown)
   - **reveal.mp3** — a "ta-da" / magic / page-turn sound (plays once, when the countdown hits zero)

   Free sources: [Mixkit](https://mixkit.co/free-sound-effects/), [Pixabay](https://pixabay.com/sound-effects/), [Zapsplat](https://www.zapsplat.com)

2. Drop them into `assets/sounds/` using **exactly** those filenames.
3. That's it — `index.html` already has:
   ```html
   <audio id="tick-sound" src="assets/sounds/tick.mp3"></audio>
   <audio id="reveal-sound" src="assets/sounds/reveal.mp3"></audio>
   ```
   and `script.js` already calls `playTick()` every second of the countdown
   and `playReveal()` once, right when the countdown reaches zero.

Want a 3rd sound somewhere else (e.g. background party music that loops the
whole time)? Copy the same pattern: add another `<audio>` tag in `index.html`,
grab it with `document.getElementById(...)` in `script.js`, and call
`.play()` on it inside `startCountdown()`.

---

## 3. Setting the countdown target

Open `script.js`, find this near the very top:

```js
const TARGET_DATE = new Date("2026-07-04T00:00:00");
```

Change the date/time to the actual birthday moment. The format is
`"YYYY-MM-DDTHH:MM:SS"` in the visitor's local time.

---

## 4. The book animation, explained

This is plain CSS — no animation library:

- The book cover is a `<div>` with `transform-origin: left center`.
- When the countdown ends, `script.js` adds an `is-open` class to the book,
  which tells the cover to rotate to `rotateY(-150deg)` over 2.2 seconds —
  that's the "swinging open" motion.
- `script.js` listens for that rotation to finish (`transitionend`), and
  *only then* fades the photo in, over 2.5 seconds (the "slowly showing up"
  part you asked for). You can change this timing in two places that need
  to match: `.book-image` in `style.css` (`transition: opacity 2.5s ease`)
  and the `bookImage.style.transitionDuration` line in `script.js`.
- A few seconds after the photo is fully visible, the whole book fades and
  shrinks away (`bookFadeOut` keyframes), and the site switches to the
  final gallery screen.

---

## 5. Adding your main photo + all the random/scattered photos

This is the part you wanted left open — here's exactly where it plugs in.

**Main photo** (shown inside the book, then centered at the end):
```js
const MAIN_IMAGE = "assets/images/main-photo.jpg";
```
Just put a file named `main-photo.jpg` inside `assets/images/`, or change
this line to whatever filename you use.

**Scattered photos** (the "so many random pictures" part):
```js
const GALLERY_IMAGES = [
  "assets/images/photo1.jpg",
  "assets/images/photo2.jpg",
  "assets/images/photo3.jpg",
];
```
Both of these live near the top of `script.js`, in the `CONFIG` section —
look for the comment block that says `1. CONFIG`. Add one line per photo
to `GALLERY_IMAGES`; each line becomes one photo scattered randomly around
the main photo with its own random position and tilt. You can add as many
as you like — 5, 20, 50, no limit. Nothing else in the code needs to change.

---

## 6. Quick checklist before you share the link

- [ ] `TARGET_DATE` set to the real birthday moment
- [ ] `tick.mp3` and `reveal.mp3` added to `assets/sounds/`
- [ ] `main-photo.jpg` added to `assets/images/`
- [ ] `GALLERY_IMAGES` filled in with your scattered photos
- [ ] Tested by opening `index.html` (ideally via Live Server) and clicking "Start the Celebration"
