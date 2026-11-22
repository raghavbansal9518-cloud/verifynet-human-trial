# VERiFYNET — THE HUMAN TRIAL
### An Indie Psychological-Horror CAPTCHA Game Simulation

> *"Seven trials stand between you and verification. The machine has one job. You have one answer."*

**VERiFYNET** completely rejects the conventional cybersecurity biometric dashboard. Instead, it places the player inside an unusual, retro-futuristic indie computer game simulation. What initially begins as an ordinary CAPTCHA test steadily deteriorates into an eerie psychological trial overseen by an unpredictable AI companion: **VERI**.

---

## 🎮 The Seven-Trial Gameplay Concept

The game is designed around a seven-stage emotional progression testing subconscious human quirks:

1. **Round 01: Select the Traffic Lights (Comfort)** — A familiar 3×3 CAPTCHA grid where everything feels standard, polite, and responsive. Target Confidence: 98%.
2. **Round 02: Find the Bicycles (Curiosity)** — A 3×3 CAPTCHA grid introducing environmental depth and subtle system telemetry questions (*"Why do they always come back?"*). Target Confidence: 91%.
3. **Round 03: Find the Anomaly (Suspicion)** — A 2×2 digital clock puzzle chamber. Correct identification triggers the first major simulation glitch and an emotional shift in VERI (*"Wait... why did I expect that?"*). Target Confidence: 78%.
4. **Round 04: The Observer Protocol (Quarantine / Staging)** — Active quarantine monitoring hesitation pauses, mouse cursor tremor, and biometric acceleration variance. *(Staged in Phase 02)*.
5. **Round 05: Emotional Dissonance** — Ethical and psychological dilemmas testing whether the subject displays empathy or algorithmic compliance. *(Phase 03)*.
6. **Round 06: Memory Degradation** — Rapid flash-memory challenges where visual artifacts degrade when unobserved. *(Phase 03)*.
7. **Round 07: The Final Judgment (Turing Inversion)** — The definitive trial where the machine determines whether the subject is genuine human consciousness or synthetic simulation. *(Phase 03)*.

---

## 🛠️ Key Implemented Features

### Page 01: Retro Indie Game Title Screen
- **Visual Design Identity:** CRT scanlines, vignette curvature, Space Grotesk headline, blinking terminal cursor, and arcade telemetry.
- **Original AI Companion (VERI Unit 01):**
  - Full vector SVG isometric robot companion.
  - Floating idle hover animation with dynamic shadow scaling and backlight pulse.
  - Real-time mathematical eye tracking (pupils translate toward cursor coordinates).
  - Procedural typewriter speech bubble with dynamic dialogue states.
- **Procedural 8-Bit Web Audio Synthesizer:**
  - Zero external `.mp3` or `.wav` dependencies.
  - Procedural square, triangle, and sine wave oscillators for hover blips, button clicks, robot speech bleeps, and level clear fanfares.
- **Interactive Modals:** How to Play protocol briefing and local storage-backed Configuration settings (Audio, Visual Motion, CRT Scanlines).

### Phase 02: Active Gameplay Arena (Rounds 01 – 03)
- **Compact Game HUD:** Real-time round telemetry, seven-segment progress tracker (`[01]` through `[07]`), audio toggle, and system configuration.
- **Dynamic Confidence Display:** Horizontal gradient meter reflecting real-time trust scoring and penalties for erroneous selections.
- **Round 01 (Traffic Lights):** 3×3 grid featuring 9 individually illustrated vector SVG urban scenes.
- **Round 02 (Bicycles):** 3×3 grid with 9 new vector SVG scenes clearly differentiating bicycles from motorcycles, scooters, pedestrians, and cars.
- **Round 03 (Find the Anomaly):** 2×2 puzzle arena with four digital clock cards (`10:10` vs anomaly `10:11`), culminating in a controlled horror glitch malfunction sequence (chromatic aberration, horizontal screen displacement, audio static burst, and narrative breakdown).
- **Live System Log Terminal:** Fixed-height scrollable terminal streaming real-time simulation events and eerie system musings.
- **Trial 04 Handoff (`trial-04.html`):** Staging environment preserving player confidence metrics with state reset and replay support.

---

## 💻 Technologies Used

- **HTML5:** Semantic game markup, accessible dialogs, and SVG vectors.
- **CSS3:** Custom game palettes, flexbox/grid layouts, CRT overlays, scanlines, and keyframe animations.
- **Vanilla JavaScript (ES6+):** Zero external libraries or frameworks (no React, no jQuery, no backend).
- **Web Audio API:** Procedural real-time sound synthesis directly in the browser.
- **HTML5 Canvas:** Lightweight procedural matrix particle grid and ambient luminescence.

---

## 🕹️ Controls & Gameplay Instructions

- **Mouse / Pointer:**
  - Move cursor to look around; VERI's eyes follow the cursor on desktop.
  - Left-Click on CAPTCHA tiles or clock cards to select/toggle.
  - Left-Click on VERI to trigger interactive companion responses.
  - Click `VERIFY SELECTION` or `CONFIRM ANOMALY` to validate answers.
  - Click `CLEAR SELECTION` or `CHANGE SELECTION` to reset choices.
- **Keyboard Navigation:**
  - `Enter` / `Space`: Toggle focused tile or trigger action button.
  - `Escape`: Instantly dismiss open modal overlays.

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
