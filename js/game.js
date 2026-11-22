/**
 * VERIFYNET — GAME ENGINE CONTROLLER (js/game.js)
 * Manages game state, challenge rendering, tile selection, validation,
 * confidence calculations, live terminal telemetry, and Round 03 glitch sequence.
 */

class VerifyNetGameEngine {
  constructor() {
    this.trials = window.VerifyNetTrials || [];
    this.state = this.loadState();
    this.selectedTileIds = new Set();
    this.selectedCardId = null;
    this.isProcessing = false;
    this.veri = null;
    this.bg = null;

    // Elements
    this.dom = {};
  }

  loadState() {
    try {
      const saved = localStorage.getItem('verifynet_gamestate');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure values exist
        return {
          currentRound: parsed.currentRound || 1,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 100,
          completedRounds: Array.isArray(parsed.completedRounds) ? parsed.completedRounds : [],
          attempts: parsed.attempts || { 1: 0, 2: 0, 3: 0 }
        };
      }
    } catch (e) {}

    return {
      currentRound: 1,
      confidence: 100,
      completedRounds: [],
      attempts: { 1: 0, 2: 0, 3: 0 }
    };
  }

  saveState() {
    try {
      localStorage.setItem('verifynet_gamestate', JSON.stringify(this.state));
    } catch (e) {}
  }

  init() {
    this.cacheDom();
    this.initAudioSync();
    this.initModals();
    this.initVeri();

    // Init subtle background canvas if available
    if (typeof RetroBackground === 'function' && document.getElementById('bg-canvas')) {
      this.bg = new RetroBackground('bg-canvas');
    }

    // Check URL hash or query if direct round navigation requested
    const urlParams = new URLSearchParams(window.location.search);
    const roundParam = parseInt(urlParams.get('round'), 10);
    if (roundParam && roundParam >= 1 && roundParam <= 3) {
      // Only allow if previous rounds completed or debug
      this.state.currentRound = roundParam;
    }

    this.renderCurrentTrial();
  }

  cacheDom() {
    this.dom.hudRoundTitle = document.getElementById('hud-round-title');
    this.dom.progressNodes = document.querySelectorAll('.step-node');
    this.dom.confidenceVal = document.getElementById('confidence-val');
    this.dom.confidenceFill = document.getElementById('confidence-meter-fill');
    this.dom.challengeContainer = document.getElementById('challenge-container');
    this.dom.logBody = document.getElementById('log-terminal-body');

    // Controls
    this.dom.soundBtn = document.getElementById('toggle-sound-hud');
    this.dom.soundLabel = document.getElementById('sound-status-hud-label');
    this.dom.settingsBtn = document.getElementById('btn-hud-settings');

    // Modals & Overlays
    this.dom.modalSettings = document.getElementById('modal-settings');
    this.dom.modalHowToPlay = document.getElementById('modal-how-to-play');
    this.dom.completionOverlay = document.getElementById('round-completion-overlay');
    this.dom.transitionCurtain = document.getElementById('transition-curtain');
    this.dom.glitchFlash = document.getElementById('glitch-flash');
  }

  initAudioSync() {
    const isEnabled = window.RetroAudio ? window.RetroAudio.enabled : true;
    this.updateSoundUI(isEnabled);

    if (this.dom.soundBtn) {
      this.dom.soundBtn.addEventListener('click', () => {
        if (window.RetroAudio) {
          const state = window.RetroAudio.toggle();
          this.updateSoundUI(state);
        }
      });
    }
  }

  updateSoundUI(enabled) {
    if (this.dom.soundLabel) {
      this.dom.soundLabel.textContent = enabled ? 'SND: ON' : 'SND: OFF';
    }
  }

  initVeri() {
    if (typeof VeriCompanion === 'function') {
      this.veri = new VeriCompanion();
    }
  }

  initModals() {
    const modalSettings = this.dom.modalSettings;
    const modalHtp = this.dom.modalHowToPlay;

    if (this.dom.settingsBtn && modalSettings) {
      this.dom.settingsBtn.addEventListener('click', () => {
        modalSettings.classList.add('active');
        if (window.RetroAudio) window.RetroAudio.playModalOpen();
      });
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
        if (window.RetroAudio) window.RetroAudio.playModalClose();
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalSettings) modalSettings.classList.remove('active');
        if (modalHtp) modalHtp.classList.remove('active');
      }
    });

    // Settings switches
    const toggleSoundSetting = document.getElementById('toggle-sound-setting');
    const toggleAnimSetting = document.getElementById('toggle-anim-setting');
    const toggleCrtSetting = document.getElementById('toggle-crt-setting');

    if (toggleSoundSetting) {
      toggleSoundSetting.checked = window.RetroAudio ? window.RetroAudio.enabled : true;
      toggleSoundSetting.addEventListener('change', (e) => {
        if (window.RetroAudio) window.RetroAudio.setEnabled(e.target.checked);
        this.updateSoundUI(e.target.checked);
      });
    }

    if (toggleAnimSetting) {
      toggleAnimSetting.checked = localStorage.getItem('verifynet_anim') !== 'disabled';
      toggleAnimSetting.addEventListener('change', (e) => {
        if (e.target.checked) {
          localStorage.setItem('verifynet_anim', 'enabled');
          document.body.classList.remove('no-animations');
          if (this.bg) this.bg.start();
        } else {
          localStorage.setItem('verifynet_anim', 'disabled');
          document.body.classList.add('no-animations');
          if (this.bg) this.bg.stop();
        }
      });
    }

    if (toggleCrtSetting) {
      toggleCrtSetting.checked = localStorage.getItem('verifynet_crt') !== 'disabled';
      toggleCrtSetting.addEventListener('change', (e) => {
        if (e.target.checked) {
          localStorage.setItem('verifynet_crt', 'enabled');
          document.body.classList.remove('no-crt');
        } else {
          localStorage.setItem('verifynet_crt', 'disabled');
          document.body.classList.add('no-crt');
        }
      });
    }
  }

  addLog(msg, type = 'sys') {
    if (!this.dom.logBody) return;
    const line = document.createElement('div');
    line.className = 'log-entry';

    let tag = '[SYS]';
    let tagClass = '';
    if (type === 'warn') { tag = '[WARN]'; tagClass = 'warn'; }
    else if (type === 'error') { tag = '[ERR]'; tagClass = 'error'; }
    else if (type === 'veri') { tag = '[VERI]'; tagClass = 'veri'; }
    else if (type === 'input') { tag = '[INPUT]'; }

    line.innerHTML = `<span class="log-tag ${tagClass}">${tag}</span> ${msg}`;
    this.dom.logBody.appendChild(line);
    this.dom.logBody.scrollTop = this.dom.logBody.scrollHeight;
  }

  updateProgressTracker() {
    const cur = this.state.currentRound;
    if (this.dom.hudRoundTitle) {
      this.dom.hudRoundTitle.textContent = `ROUND 0${cur} / 07`;
    }

    this.dom.progressNodes.forEach((node, idx) => {
      const stepNum = idx + 1;
      node.classList.remove('completed', 'active', 'upcoming', 'unstable');

      if (this.state.completedRounds.includes(stepNum)) {
        node.classList.add('completed');
      } else if (stepNum === cur) {
        node.classList.add('active');
        if (cur === 3) {
          node.classList.add('unstable');
        }
      } else {
        node.classList.add('upcoming');
      }
    });
  }

  updateConfidence(targetVal) {
    if (typeof targetVal === 'number') {
      this.state.confidence = Math.max(35, Math.min(100, targetVal));
      this.saveState();
    }

    const conf = this.state.confidence;
    if (this.dom.confidenceVal) {
      this.dom.confidenceVal.textContent = `${conf}%`;
      this.dom.confidenceVal.classList.remove('warning', 'danger');
      if (conf < 80) this.dom.confidenceVal.classList.add('danger');
      else if (conf < 95) this.dom.confidenceVal.classList.add('warning');
    }

    if (this.dom.confidenceFill) {
      this.dom.confidenceFill.style.width = `${conf}%`;
      this.dom.confidenceFill.classList.toggle('warning', conf < 85);
    }
  }

  renderCurrentTrial() {
    this.selectedTileIds.clear();
    this.selectedCardId = null;
    this.isProcessing = false;

    const roundData = this.trials.find(t => t.roundNumber === this.state.currentRound) || this.trials[0];

    this.updateProgressTracker();
    this.updateConfidence();

    // Log initialization lines
    if (roundData.systemLogs) {
      roundData.systemLogs.forEach((logText, i) => {
        setTimeout(() => this.addLog(logText), i * 150);
      });
    }

    // Set VERI dialogue
    if (this.veri && roundData.veriSpeech) {
      this.veri.setDialogue(roundData.veriSpeech.onEntry, `TRIAL 0${roundData.roundNumber} // ACTIVE`);
      if (roundData.veriSpeech.onDelay) {
        setTimeout(() => {
          if (this.selectedTileIds.size === 0 && !this.selectedCardId && !this.isProcessing) {
            this.veri.setDialogue(roundData.veriSpeech.onDelay, `OBSERVING`);
          }
        }, 4000);
      }
    }

    // Occasional strange system log in Round 02
    if (roundData.roundNumber === 2) {
      setTimeout(() => {
        if (this.state.currentRound === 2) {
          this.addLog("WHY DO THEY ALWAYS COME BACK?", "warn");
        }
      }, 7000);
    }

    // Build Challenge HTML
    if (roundData.type === 'grid_3x3') {
      this.render3x3Grid(roundData);
    } else if (roundData.type === 'arena_2x2') {
      this.render2x2Arena(roundData);
    }
  }

  render3x3Grid(trial) {
    const container = this.dom.challengeContainer;
    if (!container) return;

    let tilesHtml = '';
    trial.tiles.forEach(tile => {
      tilesHtml += `
        <div class="captcha-tile" data-tile-id="${tile.id}" title="${tile.title}" role="button" aria-pressed="false" tabindex="0">
          <div class="tile-check-badge">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          ${tile.svg}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-protocol-tag">${trial.subheading}</span>
        <div class="challenge-title-row">
          <h1 class="challenge-title">${trial.heading}</h1>
          <span class="challenge-trial-tag">TRIAL 0${trial.roundNumber} / 07</span>
        </div>
        <p class="challenge-instructions">${trial.instructions}</p>
        <p class="challenge-subtext">${trial.supportingMessage}</p>
      </div>

      <div class="captcha-grid-3x3" id="captcha-grid">
        ${tilesHtml}
      </div>

      <div class="challenge-feedback" id="challenge-feedback"></div>

      <div class="challenge-controls-bar">
        <div class="selection-readout">
          ${trial.counterLabel}: <span id="selection-count">0</span> / 9
        </div>
        <div class="challenge-buttons">
          <button id="btn-clear-selection" class="btn-clear">CLEAR SELECTION</button>
          <button id="btn-verify-selection" class="btn-verify" disabled>VERIFY SELECTION</button>
        </div>
      </div>
    `;

    // Attach Grid Event Listeners
    const gridEl = document.getElementById('captcha-grid');
    const verifyBtn = document.getElementById('btn-verify-selection');
    const clearBtn = document.getElementById('btn-clear-selection');
    const countEl = document.getElementById('selection-count');
    const feedbackEl = document.getElementById('challenge-feedback');

    gridEl.querySelectorAll('.captcha-tile').forEach(tileEl => {
      const tileId = parseInt(tileEl.dataset.tileId, 10);

      const toggleTile = () => {
        if (this.isProcessing) return;

        if (this.selectedTileIds.has(tileId)) {
          this.selectedTileIds.delete(tileId);
          tileEl.classList.remove('selected');
          tileEl.setAttribute('aria-pressed', 'false');
          if (window.RetroAudio) window.RetroAudio.playTileSelect(false);
        } else {
          this.selectedTileIds.add(tileId);
          tileEl.classList.add('selected');
          tileEl.setAttribute('aria-pressed', 'true');
          if (window.RetroAudio) window.RetroAudio.playTileSelect(true);

          // VERI Speech triggers
          if (this.veri && trial.veriSpeech) {
            if (this.selectedTileIds.size === 1) {
              this.veri.setDialogue(trial.veriSpeech.onFirstSelect, "INPUT DETECTED");
            } else if (this.selectedTileIds.size >= 4) {
              this.veri.setDialogue(trial.veriSpeech.onManySelect, "PATTERN RECOGNITION");
            }
          }
        }

        // Update count & button disabled state
        countEl.textContent = this.selectedTileIds.size;
        verifyBtn.disabled = this.selectedTileIds.size === 0;

        if (feedbackEl) feedbackEl.classList.remove('active', 'error', 'success');
      };

      tileEl.addEventListener('click', toggleTile);
      tileEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTile();
        }
      });
    });

    clearBtn.addEventListener('click', () => {
      if (this.isProcessing) return;
      this.selectedTileIds.clear();
      gridEl.querySelectorAll('.captcha-tile').forEach(t => {
        t.classList.remove('selected');
        t.setAttribute('aria-pressed', 'false');
      });
      countEl.textContent = '0';
      verifyBtn.disabled = true;
      if (feedbackEl) feedbackEl.classList.remove('active', 'error', 'success');
      if (window.RetroAudio) window.RetroAudio.playClick();
      this.addLog("SELECTION CLEARED", "input");
    });

    verifyBtn.addEventListener('click', () => {
      this.validate3x3Selection(trial);
    });
  }

  validate3x3Selection(trial) {
    if (this.isProcessing || this.selectedTileIds.size === 0) return;
    this.isProcessing = true;

    const feedbackEl = document.getElementById('challenge-feedback');
    const verifyBtn = document.getElementById('btn-verify-selection');
    verifyBtn.disabled = true;

    this.addLog(`ANALYZING SELECTION: [${Array.from(this.selectedTileIds).join(', ')}]`, "input");

    // Compare selected with correctTileIds
    const correctSet = new Set(trial.correctTileIds);
    const isCorrect = this.selectedTileIds.size === correctSet.size &&
      Array.from(this.selectedTileIds).every(id => correctSet.has(id));

    if (isCorrect) {
      // SUCCESS
      if (window.RetroAudio) window.RetroAudio.playVictory();
      feedbackEl.className = 'challenge-feedback active success';
      feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> ${trial.completionNote}`;

      this.addLog(`VERIFICATION ACCEPTED · 100% CORRESPONDENCE`, "sys");

      if (this.veri && trial.veriSpeech) {
        this.veri.setDialogue(trial.veriSpeech.onSuccess, "VERIFIED");
        if (trial.veriSpeech.onSuccessFollowup) {
          setTimeout(() => {
            this.veri.setDialogue(trial.veriSpeech.onSuccessFollowup, "UNCERTAIN");
          }, 1800);
        }
      }

      // Mark complete
      if (!this.state.completedRounds.includes(trial.roundNumber)) {
        this.state.completedRounds.push(trial.roundNumber);
      }
      this.updateConfidence(trial.confidenceTarget);
      this.updateProgressTracker();

      // Show completion overlay after short delay
      setTimeout(() => {
        this.showCompletionOverlay(trial);
      }, 1400);

    } else {
      // INCORRECT
      if (window.RetroAudio) window.RetroAudio.playError();
      feedbackEl.className = 'challenge-feedback active error';
      feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✕</span> NOT QUITE. REVIEW YOUR SELECTION.`;

      this.state.attempts[trial.roundNumber] = (this.state.attempts[trial.roundNumber] || 0) + 1;
      // Subtract -2% confidence penalty
      this.updateConfidence(this.state.confidence - 2);

      this.addLog(`VERIFICATION REJECTED: DISCREPANCY DETECTED`, "error");

      if (this.veri) {
        this.veri.setDialogue("Observation: Human error detected. Please recalibrate.", "ERROR // MISMATCH");
      }

      this.isProcessing = false;
      verifyBtn.disabled = false;
    }
  }

  render2x2Arena(trial) {
    const container = this.dom.challengeContainer;
    if (!container) return;

    let cardsHtml = '';
    trial.cards.forEach(card => {
      cardsHtml += `
        <div class="anomaly-card" data-card-id="${card.id}" role="button" aria-pressed="false" tabindex="0">
          <div class="anomaly-card-header">
            <span>${card.label}</span>
            <span style="font-family:monospace;">ID: 0x0${card.id}</span>
          </div>
          <div class="anomaly-card-svg-wrap">
            ${card.svg}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-protocol-tag">${trial.subheading}</span>
        <div class="challenge-title-row">
          <h1 class="challenge-title">${trial.heading}</h1>
          <span class="challenge-trial-tag">TRIAL 0${trial.roundNumber} / 07</span>
        </div>
        <p class="challenge-instructions">${trial.instructions}</p>
        <p class="challenge-subtext">${trial.supportingMessage}</p>
      </div>

      <div class="anomaly-arena-2x2" id="anomaly-arena">
        ${cardsHtml}
      </div>

      <div class="challenge-feedback" id="challenge-feedback"></div>

      <div class="challenge-controls-bar">
        <div class="selection-readout">
          ${trial.counterLabel}: <span id="anomaly-selection-card">NONE</span>
        </div>
        <div class="challenge-buttons">
          <button id="btn-clear-anomaly" class="btn-clear">CHANGE SELECTION</button>
          <button id="btn-confirm-anomaly" class="btn-verify" disabled>CONFIRM ANOMALY</button>
        </div>
      </div>
    `;

    const arenaEl = document.getElementById('anomaly-arena');
    const confirmBtn = document.getElementById('btn-confirm-anomaly');
    const clearBtn = document.getElementById('btn-clear-anomaly');
    const readoutEl = document.getElementById('anomaly-selection-card');
    const feedbackEl = document.getElementById('challenge-feedback');

    arenaEl.querySelectorAll('.anomaly-card').forEach(cardEl => {
      const cardId = cardEl.dataset.cardId;

      const selectCard = () => {
        if (this.isProcessing) return;

        arenaEl.querySelectorAll('.anomaly-card').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });

        this.selectedCardId = cardId;
        cardEl.classList.add('selected');
        cardEl.setAttribute('aria-pressed', 'true');

        readoutEl.textContent = `CARD ${cardId}`;
        confirmBtn.disabled = false;

        if (window.RetroAudio) window.RetroAudio.playTileSelect(true);
        if (feedbackEl) feedbackEl.classList.remove('active', 'error', 'success');

        if (this.veri && trial.veriSpeech) {
          this.veri.setDialogue(trial.veriSpeech.onSelect, "QUERY // TARGETED");
        }
      };

      cardEl.addEventListener('click', selectCard);
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard();
        }
      });
    });

    clearBtn.addEventListener('click', () => {
      if (this.isProcessing) return;
      this.selectedCardId = null;
      arenaEl.querySelectorAll('.anomaly-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
      readoutEl.textContent = 'NONE';
      confirmBtn.disabled = true;
      if (feedbackEl) feedbackEl.classList.remove('active', 'error', 'success');
      if (window.RetroAudio) window.RetroAudio.playClick();
    });

    confirmBtn.addEventListener('click', () => {
      this.validateAnomalySelection(trial);
    });
  }

  validateAnomalySelection(trial) {
    if (this.isProcessing || !this.selectedCardId) return;
    this.isProcessing = true;

    const feedbackEl = document.getElementById('challenge-feedback');
    const confirmBtn = document.getElementById('btn-confirm-anomaly');
    confirmBtn.disabled = true;

    this.addLog(`CONFIRMING ANOMALY: CARD ${this.selectedCardId}`, "input");

    if (this.selectedCardId === trial.correctCardId) {
      // SUCCESS WITH GLITCH SEQUENCE (PART 6.E)
      this.runAnomalyGlitchSequence(trial);
    } else {
      // INCORRECT
      if (window.RetroAudio) window.RetroAudio.playError();
      feedbackEl.className = 'challenge-feedback active error';
      feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✕</span> THAT IS IDENTICAL. PATTERN NOT MATCHED.`;

      this.state.attempts[trial.roundNumber] = (this.state.attempts[trial.roundNumber] || 0) + 1;
      this.updateConfidence(this.state.confidence - 3);

      this.addLog(`INCORRECT CARD SELECTED. TRIAL RE-EVALUATION REQUIRED.`, "error");

      if (this.veri && trial.veriSpeech) {
        this.veri.setDialogue(trial.veriSpeech.onWrong, "QUERY // WRONG");
      }

      this.isProcessing = false;
      confirmBtn.disabled = false;
    }
  }

  // Dramatic Horror / Glitch Malfunction Sequence for Round 03
  runAnomalyGlitchSequence(trial) {
    const feedbackEl = document.getElementById('challenge-feedback');
    if (window.RetroAudio) window.RetroAudio.playVictory();

    feedbackEl.className = 'challenge-feedback active success';
    feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> SYSTEM MESSAGE: VERIFICATION COMPLETE.`;

    if (this.veri) {
      this.veri.setDialogue("Yes. That is what I expected.", "CONFIRMED");
    }

    // Step 2: 800ms wait -> UNEXPECTED RESPONSE DETECTED
    setTimeout(() => {
      feedbackEl.className = 'challenge-feedback active error';
      feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">!</span> UNEXPECTED RESPONSE DETECTED.`;
      this.addLog(`WARNING: ANOMALOUS PLAYER OBSERVATION SPEED`, "warn");

      if (this.veri) {
        this.veri.setDialogue("Wait.", "SUSPICIOUS");
      }

      // Step 3: 900ms wait -> ERROR: I DIDN'T EXPECT THAT + Controlled Glitch
      setTimeout(() => {
        feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">⚠</span> ERROR: I DIDN'T EXPECT THAT.`;
        
        // Audio & Visual Glitch
        if (window.RetroAudio) window.RetroAudio.playGlitch();

        document.body.classList.add('glitch-active');
        if (this.dom.glitchFlash) {
          this.dom.glitchFlash.classList.add('active');
          setTimeout(() => this.dom.glitchFlash.classList.remove('active'), 250);
        }

        setTimeout(() => document.body.classList.remove('glitch-active'), 600);

        this.addLog(`[WARNING] UNEXPECTED RESPONSE`, "error");
        this.addLog(`[SYS] INVESTIGATING OUTPUT`, "warn");
        this.addLog(`[SYS] CONTINUING SIMULATION`, "sys");

        if (this.veri) {
          this.veri.setDialogue("Why did I expect that?", "CONFUSED // UNSETTLED");
        }

        // Complete Round 03
        if (!this.state.completedRounds.includes(3)) {
          this.state.completedRounds.push(3);
        }
        this.updateConfidence(trial.confidenceTarget); // Drops to ~78%
        this.updateProgressTracker();

        // Step 4: Show Completion Overlay
        setTimeout(() => {
          this.showCompletionOverlay(trial);
        }, 1600);

      }, 900);

    }, 800);
  }

  showCompletionOverlay(trial) {
    const overlay = this.dom.completionOverlay;
    if (!overlay) return;

    overlay.querySelector('#completion-title').textContent = trial.completionTitle;
    overlay.querySelector('#completion-identity-status').textContent = trial.identityStatus;
    overlay.querySelector('#completion-confidence-val').textContent = `${this.state.confidence}%`;
    overlay.querySelector('#completion-veri-quote').textContent = `VERI: "${trial.veriSpeech.onCompletionOverlay}"`;

    const nextRound = trial.roundNumber + 1;
    const continueBtn = overlay.querySelector('#btn-continue-round');
    continueBtn.textContent = `CONTINUE TO TRIAL 0${nextRound}`;

    overlay.classList.add('active');

    continueBtn.onclick = () => {
      overlay.classList.remove('active');
      this.advanceToRound(nextRound);
    };
  }

  advanceToRound(nextRound) {
    if (nextRound > 3) {
      // Navigate to Trial 04 Staging Handoff
      window.location.href = 'trial-04.html';
      return;
    }

    // Level Transition CRT sequence
    if (window.RetroAudio) window.RetroAudio.playLevelUp();

    if (this.dom.transitionCurtain) {
      this.dom.transitionCurtain.classList.add('active');
    }

    setTimeout(() => {
      this.state.currentRound = nextRound;
      this.saveState();
      this.renderCurrentTrial();

      setTimeout(() => {
        if (this.dom.transitionCurtain) {
          this.dom.transitionCurtain.classList.remove('active');
        }
      }, 400);
    }, 900);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.GameEngine = new VerifyNetGameEngine();
  window.GameEngine.init();
});
