/**
 * VERIFYNET — VERI AI COMPANION CONTROLLER (js/veri.js)
 * Manages VERI's eye tracking math, dialogue states, typewriter effect,
 * expressions, and personality interactions.
 */

class VeriCompanion {
  constructor() {
    this.container = document.getElementById('veri-companion');
    this.speechTextEl = document.getElementById('veri-dialogue-text');
    this.speechStateEl = document.getElementById('veri-state-tag');
    this.pupilsGroup = document.getElementById('veri-pupils');
    this.mouthGroup = document.getElementById('veri-mouth');
    this.avatarWrapper = document.getElementById('veri-avatar');

    this.currentText = '';
    this.targetText = '';
    this.typewriterTimer = null;
    this.idleTimer1 = null;
    this.idleTimer2 = null;

    this.isHovered = false;
    this.isLocked = false; // When starting game
    this.clickCount = 0;

    this.eyeBounds = null;
    this.eyeTargetX = 0;
    this.eyeTargetY = 0;
    this.eyeCurrentX = 0;
    this.eyeCurrentY = 0;
    this.rafId = null;

    this.clickQuotes = [
      "Hey! That tickles my neural net.",
      "I asked nicely: please don't click me.",
      "Observation: User displays aggressive tactile behavior.",
      "01001111 01110111! (That means Ouch).",
      "Focus on the trial, not my chassis."
    ];

    this.init();
  }

  init() {
    if (!this.container) return;

    this.updateEyeBounds();
    window.addEventListener('resize', () => this.updateEyeBounds(), { passive: true });
    window.addEventListener('scroll', () => this.updateEyeBounds(), { passive: true });

    // Eye Tracking Mouse Movement
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
    window.addEventListener('mouseleave', () => this.resetEyes());

    // Character Interactivity
    if (this.avatarWrapper) {
      this.avatarWrapper.addEventListener('mouseenter', () => this.onHover());
      this.avatarWrapper.addEventListener('mouseleave', () => this.onLeave());
      this.avatarWrapper.addEventListener('click', () => this.onClick());
    }

    // Initial Dialogue State
    this.setDialogue("Oh. A player.", "IDLE // OBSERVING");

    // Timed Dialogue Escalation
    this.startIdleTimers();

    // Start Smooth Eye Animation Loop
    this.animateEyes();
  }

  updateEyeBounds() {
    if (this.avatarWrapper) {
      const rect = this.avatarWrapper.getBoundingClientRect();
      this.eyeCenter = {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.45
      };
    }
  }

  handleMouseMove(e) {
    if (!this.eyeCenter || this.isLocked) return;

    const dx = e.clientX - this.eyeCenter.x;
    const dy = e.clientY - this.eyeCenter.y;
    const dist = Math.hypot(dx, dy);

    // Maximum pixel shift within screen border
    const maxShiftX = 8;
    const maxShiftY = 6;

    if (dist > 0) {
      const factor = Math.min(dist / 250, 1);
      this.eyeTargetX = (dx / dist) * maxShiftX * factor;
      this.eyeTargetY = (dy / dist) * maxShiftY * factor;
    }
  }

  resetEyes() {
    this.eyeTargetX = 0;
    this.eyeTargetY = 0;
  }

  animateEyes() {
    // Smooth lerp toward target
    this.eyeCurrentX += (this.eyeTargetX - this.eyeCurrentX) * 0.2;
    this.eyeCurrentY += (this.eyeTargetY - this.eyeCurrentY) * 0.2;

    if (this.pupilsGroup) {
      this.pupilsGroup.setAttribute(
        'transform',
        `translate(${this.eyeCurrentX.toFixed(2)}, ${this.eyeCurrentY.toFixed(2)})`
      );
    }

    this.rafId = requestAnimationFrame(() => this.animateEyes());
  }

  startIdleTimers() {
    this.clearIdleTimers();

    // 1st delay state (approx 7.5s)
    this.idleTimer1 = setTimeout(() => {
      if (!this.isHovered && !this.isLocked) {
        this.setDialogue("I've been waiting for someone to verify.", "IDLE // WAITING");
      }
    }, 7500);

    // 2nd delay state (approx 15s)
    this.idleTimer2 = setTimeout(() => {
      if (!this.isHovered && !this.isLocked) {
        this.setDialogue("I hope you are.", "QUERY // SUSPICIOUS");
      }
    }, 15000);
  }

  clearIdleTimers() {
    if (this.idleTimer1) clearTimeout(this.idleTimer1);
    if (this.idleTimer2) clearTimeout(this.idleTimer2);
  }

  onHover() {
    if (this.isLocked) return;
    this.isHovered = true;
    this.setDialogue("Please don't click my eyes.", "ALERT // CAUTIOUS");
    if (window.RetroAudio) window.RetroAudio.playHover();
  }

  onLeave() {
    if (this.isLocked) return;
    this.isHovered = false;
    this.startIdleTimers();
  }

  onClick() {
    if (this.isLocked) return;
    if (this.avatarWrapper) {
      this.avatarWrapper.classList.remove('clicked');
      // Trigger reflow for animation restart
      void this.avatarWrapper.offsetWidth;
      this.avatarWrapper.classList.add('clicked');
    }

    if (window.RetroAudio) {
      window.RetroAudio.playClick();
    }

    const quote = this.clickQuotes[this.clickCount % this.clickQuotes.length];
    this.clickCount++;
    this.setDialogue(quote, "INPUT // REACTIVE");
  }

  // Called when hovering the Start button
  onHoverStartButton() {
    if (this.isLocked) return;
    this.setDialogue("Ready? I think I am.", "STATUS // ENGAGED");
  }

  // Called when clicking the Start button
  onStartGame() {
    this.isLocked = true;
    this.clearIdleTimers();
    this.setDialogue("Here we go...", "INIT // TRIAL_01");
  }

  // Typewriter text generator
  setDialogue(text, stateLabel) {
    if (this.targetText === text) return;
    this.targetText = text;

    if (this.speechStateEl && stateLabel) {
      this.speechStateEl.textContent = stateLabel;
    }

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    if (!this.speechTextEl) return;

    this.speechTextEl.textContent = '';
    let charIndex = 0;

    this.typewriterTimer = setInterval(() => {
      if (charIndex < text.length) {
        this.speechTextEl.textContent += text.charAt(charIndex);
        charIndex++;

        // Play subtle synthesizer blip every few characters
        if (charIndex % 3 === 0 && window.RetroAudio) {
          window.RetroAudio.playSpeech();
        }
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
    }, 28);
  }

  // Set facial expression for emotional progression
  setExpression(mood = 'normal') {
    if (!this.mouthGroup) return;

    if (mood === 'worried') {
      this.mouthGroup.innerHTML = `
        <rect x="94" y="123" width="12" height="6" rx="2" fill="#D8F36A" />
      `;
    } else if (mood === 'distressed') {
      this.mouthGroup.innerHTML = `
        <rect x="86" y="126" width="6" height="4" fill="#FF647C" />
        <rect x="92" y="123" width="16" height="4" fill="#FF647C" />
        <rect x="108" y="126" width="6" height="4" fill="#FF647C" />
      `;
    } else if (mood === 'relieved') {
      this.mouthGroup.innerHTML = `
        <rect x="86" y="122" width="6" height="4" fill="#D8F36A" />
        <rect x="92" y="125" width="16" height="5" fill="#D8F36A" />
        <rect x="108" y="122" width="6" height="4" fill="#D8F36A" />
      `;
    } else {
      // Normal smirk
      this.mouthGroup.innerHTML = `
        <rect x="86" y="123" width="6" height="4" fill="#D8F36A" />
        <rect x="92" y="125" width="16" height="4" fill="#D8F36A" />
        <rect x="108" y="121" width="6" height="4" fill="#D8F36A" />
      `;
    }
  }
}

window.VeriCompanion = VeriCompanion;
