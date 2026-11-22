# VERiFYNET — THE HUMAN TRIAL
### An Indie Psychological-Horror CAPTCHA Game Simulation

> *"Seven trials stand between you and verification. The machine has one job. You have one answer."*

**VERiFYNET** completely rejects the conventional cybersecurity biometric dashboard. Instead, it places the player inside an unusual, retro-futuristic indie computer game simulation. What initially begins as an ordinary CAPTCHA test steadily deteriorates into an eerie psychological trial overseen by an unpredictable AI companion: **VERI**.

---

## 🎮 The Complete Seven-Trial Experience & Endings

The game features seven distinct, fully implemented trials exploring subconscious human quirks, cognitive unpredictability, moral dissonance, and existential choice:

1. **Round 01: Select the Traffic Lights (Comfort)** — A familiar 3×3 CAPTCHA grid featuring 9 original vector scenes. Target Confidence: 98%.
2. **Round 02: Find the Bicycles (Curiosity)** — A 3×3 CAPTCHA grid introducing environmental depth and subtle system telemetry questions (*"Why do they always come back?"*). Target Confidence: 91%.
3. **Round 03: Find the Anomaly (Suspicion)** — A 2×2 digital clock puzzle chamber. Correct identification triggers the first major simulation glitch and an emotional shift in VERI (*"Wait... why did I expect that?"*). Target Confidence: 78%.
4. **Round 04: The Observer (Unease)** — The system tracks cursor kinematics, movement drift, direction shifts, and hesitation pauses. Features an interactive reluctant verification button that gently evades approaching cursors, supported by touch & keyboard accessibility. Target Confidence: 56%.
5. **Round 05: Emotional Dissonance (Discomfort)** — A moral dilemma where the player must choose between strict machine efficiency (*Option A: Continue delivery*) or human-centered empathy (*Option B: Stop and assist a person who dropped belongings*). Target Confidence: 34%.
6. **Round 06: Memory Degradation (Confusion)** — A 3×3 grid of nine unique geometric symbols. A 3.5s sequence preview is presented, followed by visual degradation and sequential recall under cognitive stress. Target Confidence: 17%.
7. **Round 07: The Final Judgment (Psychological Confrontation)** — Minimalist, broken telemetry interface presenting three philosophical positions (Comply, Question, Reject). Concludes with a staged interrogation where VERI questions the player: *"How do you know you're human?"*

### 🏆 Dual Deterministic Endings

- **Ending A — Humanity Certified (Human Certificate):**
  - *Trigger:* The player prioritized human empathy in Round 05 OR questioned/rejected blind machine compliance in Round 07, asserting organic consciousness.
  - *Experience:* CRT monitor stabilizes with neon lime and cyan lighting, triumph fanfare, and an interactive official Humanity Verification Certificate complete with seal, serial ID, and full gameplay telemetry.
- **Ending B — Robot Detected (Access Denied):**
  - *Trigger:* The player chose pure algorithmic efficiency in Round 05 AND unquestioning compliance in Round 07.
  - *Experience:* Sudden audio cutoff, flashing crimson emergency alarms, screen glitching, and VERI's distressed breakdown (*"Wait. That doesn't make sense. I followed the rules... Didn't I?"*).

---

## 🛠️ Complete Technical Implementation

- **Visual Design Identity:** CRT phosphor scanlines, vignette curvature, Space Grotesk display typography, Press Start 2P pixel labels, and JetBrains Mono terminal readouts.
- **Original Vector AI Companion (VERI Unit 01):**
  - 100% SVG and CSS; no stock assets or emojis.
  - Floating idle hover animation with dynamic shadow scaling and backlight illumination.
  - Smooth mathematical cursor eye tracking and natural blinking.
  - Procedural typewriter speech bubble with dynamic facial expressions (`normal`, `worried`, `distressed`, `relieved`).
- **Procedural 8-Bit Web Audio Synthesizer (`js/audio.js`):**
  - Pure Web Audio API synthesis (zero external `.mp3` or `.wav` dependencies).
  - Procedural square, triangle, and sine wave oscillators for hover blips, button clicks, robot speech bleeps, evasion pulses, moral dissonance tones, memory chimes, tension heartbeats, victory fanfare, and robot cutoff alarms.
- **State Management & Persistence (`js/game.js`):**
  - Unified `VerifyNetGameEngine` maintaining round progression, attempts, confidence, moral choices, and ending classifications in `localStorage`.
  - Zero dead buttons, full keyboard accessibility (`Enter`, `Space`, `Escape`), and responsive layout adaptation.

---

## 💻 Technologies Used

- **HTML5:** Semantic markup, accessible dialogs, and SVG vector art.
- **CSS3:** Custom color variables, flexbox/grid layout, CRT scanline overlays, and keyframe animations.
- **Vanilla JavaScript (ES6+):** Zero external libraries or frameworks (no React, no jQuery, no backend).
- **Web Audio API:** Procedural real-time sound synthesis directly in the browser.
- **HTML5 Canvas:** Lightweight procedural matrix particle grid and ambient luminescence.

---

## 🕹️ Controls & Gameplay Instructions

- **Mouse / Pointer:**
  - Move cursor to look around; VERI's eyes follow the cursor on desktop.
  - Left-Click on CAPTCHA tiles, anomaly cards, or symbol chips to select/toggle.
  - Left-Click on VERI to trigger interactive companion responses.
  - Click verification or confirmation buttons to submit answers.
- **Keyboard Navigation:**
  - `Tab`: Cycle through interactive controls and lock onto the elusive button.
  - `Enter` / `Space`: Toggle selected tile, card, or trigger action button.
  - `Escape`: Instantly dismiss open modal dialogs.

---

## 👥 Contributors

- **Lead Developer & Creator:** Raghav Bansal ([bansalraghav9518@gmail.com](mailto:bansalraghav9518@gmail.com))
- **GitHub Repository:** [raghavbansal9518-cloud/verifynet-human-trial](https://github.com/raghavbansal9518-cloud/verifynet-human-trial)

---

## 🚀 Installation & Local Execution

No build step, compilers, or package installations are required.

```powershell
# Clone the repository:
git clone https://github.com/raghavbansal9518-cloud/verifynet-human-trial.git
cd verifynet-human-trial

# Start a local static server:
python -m http.server 8080

# Or with Node:
npx serve .
```

Open your browser to:
[http://localhost:8080/index.html](http://localhost:8080/index.html)
