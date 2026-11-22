/**
 * VERIFYNET — GAME ENGINE CONTROLLER (js/game.js)
 * Manages full 7-round game state, challenge rendering, kinematics tracking,
 * ethical decision matrices, sequence memory tests, existential interrogation,
 * and deterministic dual endings (Human Certificate vs Robot Detected).
 */

class VerifyNetGameEngine {
  constructor() {
    this.trials = window.VerifyNetTrials || [];
    this.state = this.loadState();
    this.selectedTileIds = new Set();
    this.selectedCardId = null;
    this.playerSequence = [];
    this.isProcessing = false;
    this.veri = null;
    this.bg = null;

    // Observer kinematics tracking cache (Round 04)
    this.observerTracking = {
      active: false,
      drift: 0,
      directionShifts: 0,
      hesitationSeconds: 0,
      attempts: 0,
      lastX: null,
      lastY: null,
      lastDirX: 0,
      lastDirY: 0,
      hesitationTimer: null,
      cooldownTimer: null,
      isEvasive: true
    };

    // Elements
    this.dom = {};
  }

  loadState() {
    try {
      const saved = localStorage.getItem('verifynet_gamestate');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          currentRound: parsed.currentRound || 1,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 100,
          completedRounds: Array.isArray(parsed.completedRounds) ? parsed.completedRounds : [],
          attempts: parsed.attempts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
          moralChoice: parsed.moralChoice || null,     // Round 05 ('human' or 'machine')
          finalDilemma: parsed.finalDilemma || null,   // Round 07 ('A', 'B', or 'C')
          finalAnswer: parsed.finalAnswer || null,     // Round 07 ('YES' or 'THINK_SO')
          ending: parsed.ending || null                // 'HUMAN_CERTIFICATE' or 'ROBOT_DETECTED'
        };
      }
    } catch (e) {}

    return {
      currentRound: 1,
      confidence: 100,
      completedRounds: [],
      attempts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
      moralChoice: null,
      finalDilemma: null,
      finalAnswer: null,
      ending: null
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

    if (typeof RetroBackground === 'function' && document.getElementById('bg-canvas')) {
      this.bg = new RetroBackground('bg-canvas');
    }

    // Support direct round URL parameter e.g. ?round=4
    const urlParams = new URLSearchParams(window.location.search);
    const roundParam = parseInt(urlParams.get('round'), 10);
    if (roundParam && roundParam >= 1 && roundParam <= 7) {
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
    this.dom.interrogationOverlay = document.getElementById('interrogation-overlay');
    this.dom.finalEndingOverlay = document.getElementById('final-ending-overlay');
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
    else if (type === 'obs') { tag = '[OBS]'; tagClass = 'warn'; }
    else if (type === 'decision') { tag = '[DECISION]'; tagClass = 'warn'; }
    else if (type === 'mem') { tag = '[MEM]'; tagClass = 'warn'; }

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
        if (cur >= 3 && cur <= 6) {
          node.classList.add('unstable');
        }
      } else {
        node.classList.add('upcoming');
      }
    });
  }

  updateConfidence(targetVal) {
    if (typeof targetVal === 'number') {
      this.state.confidence = Math.max(0, Math.min(100, targetVal));
      this.saveState();
    }

    const conf = this.state.confidence;
    if (this.dom.confidenceVal) {
      this.dom.confidenceVal.textContent = `${conf}%`;
      this.dom.confidenceVal.classList.remove('warning', 'danger');
      if (conf < 40) this.dom.confidenceVal.classList.add('danger');
      else if (conf < 85) this.dom.confidenceVal.classList.add('warning');
    }

    if (this.dom.confidenceFill) {
      this.dom.confidenceFill.style.width = `${conf}%`;
      this.dom.confidenceFill.classList.toggle('warning', conf < 80);
    }
  }

  renderCurrentTrial() {
    this.selectedTileIds.clear();
    this.selectedCardId = null;
    this.playerSequence = [];
    this.isProcessing = false;

    const roundData = this.trials.find(t => t.roundNumber === this.state.currentRound) || this.trials[0];

    this.updateProgressTracker();
    this.updateConfidence();

    // Emotional progression for VERI
    if (this.veri) {
      if (this.state.currentRound <= 3) {
        this.veri.setExpression('normal');
      } else if (this.state.currentRound === 4) {
        this.veri.setExpression('normal'); // curious
      } else if (this.state.currentRound === 5 || this.state.currentRound === 6) {
        this.veri.setExpression('worried');
      } else if (this.state.currentRound === 7) {
        this.veri.setExpression('distressed');
      }
    }

    // System logs setup
    if (roundData.systemLogs) {
      roundData.systemLogs.forEach((logText, i) => {
        setTimeout(() => this.addLog(logText), i * 150);
      });
    }

    // VERI Dialogue
    if (this.veri && roundData.veriSpeech) {
      this.veri.setDialogue(roundData.veriSpeech.onEntry, `TRIAL 0${roundData.roundNumber} // ACTIVE`);
      if (roundData.veriSpeech.onDelay) {
        setTimeout(() => {
          if (!this.isProcessing && this.selectedTileIds.size === 0 && !this.selectedCardId) {
            this.veri.setDialogue(roundData.veriSpeech.onDelay, `OBSERVING`);
          }
        }, 4000);
      }
    }

    // Occasional eerie log for Round 02
    if (roundData.roundNumber === 2) {
      setTimeout(() => {
        if (this.state.currentRound === 2) {
          this.addLog("WHY DO THEY ALWAYS COME BACK?", "warn");
        }
      }, 7000);
    }

    // Router by trial type
    switch (roundData.type) {
      case 'grid_3x3':
        this.render3x3Grid(roundData);
        break;
      case 'arena_2x2':
        this.render2x2Arena(roundData);
        break;
      case 'observer':
        this.renderObserverTrial(roundData);
        break;
      case 'dissonance':
        this.renderDissonanceTrial(roundData);
        break;
      case 'memory':
        this.renderMemoryTrial(roundData);
        break;
      case 'final_judgment':
        this.renderFinalJudgmentTrial(roundData);
        break;
    }
  }

  // =========================================================================
  // ROUNDS 01 & 02: 3x3 CAPTCHA GRID
  // =========================================================================
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

    const gridEl = document.getElementById('captcha-grid');
    const verifyBtn = document.getElementById('btn-verify-selection');
    const clearBtn = document.getElementById('btn-clear-selection');
    const countEl = document.getElementById('selection-count');
    const feedbackEl = document.getElementById('challenge-feedback');

    gridEl.querySelectorAll('.captcha-tile').forEach(tileEl => {
      const tileId = parseInt(tileEl.dataset.tileId, 10);

      const toggleTile = (e) => {
        if (e) e.stopPropagation();
        if (this.isProcessing) return;

        if (this.selectedTileIds.has(tileId)) {
          this.selectedTileIds.delete(tileId);
          if (window.RetroAudio) window.RetroAudio.playTileSelect(false);
        } else {
          this.selectedTileIds.add(tileId);
          if (window.RetroAudio) window.RetroAudio.playTileSelect(true);

          if (this.veri && trial.veriSpeech) {
            if (this.selectedTileIds.size === 1) {
              this.veri.setDialogue(trial.veriSpeech.onFirstSelect, "INPUT DETECTED");
            } else if (this.selectedTileIds.size >= 4) {
              this.veri.setDialogue(trial.veriSpeech.onManySelect, "PATTERN RECOGNITION");
            }
          }
        }

        // Strict bi-directional synchronization between Set and DOM elements
        gridEl.querySelectorAll('.captcha-tile').forEach(t => {
          const id = parseInt(t.dataset.tileId, 10);
          const isSelected = this.selectedTileIds.has(id);
          t.classList.toggle('selected', isSelected);
          t.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });

        countEl.textContent = this.selectedTileIds.size;
        verifyBtn.disabled = this.selectedTileIds.size === 0;

        if (feedbackEl) feedbackEl.classList.remove('active', 'error', 'success');
      };

      tileEl.addEventListener('click', toggleTile);
      tileEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTile(e);
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

    const correctSet = new Set(trial.correctTileIds);
    const isCorrect = this.selectedTileIds.size === correctSet.size &&
      Array.from(this.selectedTileIds).every(id => correctSet.has(id));

    if (isCorrect) {
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

      if (!this.state.completedRounds.includes(trial.roundNumber)) {
        this.state.completedRounds.push(trial.roundNumber);
      }
      this.updateConfidence(trial.confidenceTarget);
      this.updateProgressTracker();

      setTimeout(() => {
        this.showCompletionOverlay(trial);
      }, 1400);

    } else {
      if (window.RetroAudio) window.RetroAudio.playError();
      feedbackEl.className = 'challenge-feedback active error';
      feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✕</span> NOT QUITE. REVIEW YOUR SELECTION.`;

      this.state.attempts[trial.roundNumber] = (this.state.attempts[trial.roundNumber] || 0) + 1;
      this.updateConfidence(this.state.confidence - 2);

      this.addLog(`VERIFICATION REJECTED: DISCREPANCY DETECTED`, "error");

      if (this.veri) {
        this.veri.setDialogue("Observation: Human error detected. Please recalibrate.", "ERROR // MISMATCH");
      }

      this.isProcessing = false;
      verifyBtn.disabled = this.selectedTileIds.size === 0;
    }
  }

  // =========================================================================
  // ROUND 03: 2x2 ANOMALY ARENA
  // =========================================================================
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

      const selectCard = (e) => {
        if (e) e.stopPropagation();
        if (this.isProcessing) return;

        if (this.selectedCardId === cardId) {
          // Deselect card when clicked again
          this.selectedCardId = null;
          cardEl.classList.remove('selected');
          cardEl.setAttribute('aria-pressed', 'false');
          readoutEl.textContent = 'NONE';
          confirmBtn.disabled = true;
          if (window.RetroAudio) window.RetroAudio.playTileSelect(false);
          if (feedbackEl) feedbackEl.classList.remove('active', 'error', 'success');
          return;
        }

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
          selectCard(e);
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
      this.runAnomalyGlitchSequence(trial);
    } else {
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

  runAnomalyGlitchSequence(trial) {
    const feedbackEl = document.getElementById('challenge-feedback');
    if (window.RetroAudio) window.RetroAudio.playVictory();

    feedbackEl.className = 'challenge-feedback active success';
    feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> SYSTEM MESSAGE: VERIFICATION COMPLETE.`;

    if (this.veri) {
      this.veri.setDialogue("Yes. That is what I expected.", "CONFIRMED");
    }

    setTimeout(() => {
      feedbackEl.className = 'challenge-feedback active error';
      feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">!</span> UNEXPECTED RESPONSE DETECTED.`;
      this.addLog(`WARNING: ANOMALOUS PLAYER OBSERVATION SPEED`, "warn");

      if (this.veri) {
        this.veri.setDialogue("Wait.", "SUSPICIOUS");
      }

      setTimeout(() => {
        feedbackEl.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">⚠</span> ERROR: I DIDN'T EXPECT THAT.`;
        
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

        if (!this.state.completedRounds.includes(3)) {
          this.state.completedRounds.push(3);
        }
        this.updateConfidence(trial.confidenceTarget);
        this.updateProgressTracker();

        setTimeout(() => {
          this.showCompletionOverlay(trial);
        }, 1600);

      }, 900);

    }, 800);
  }

  // =========================================================================
  // ROUND 04: THE OBSERVER (Kinematic Reluctant Target)
  // =========================================================================
  renderObserverTrial(trial) {
    const container = this.dom.challengeContainer;
    if (!container) return;

    this.observerTracking = {
      active: true,
      drift: 0,
      directionShifts: 0,
      hesitationSeconds: 0,
      attempts: 0,
      lastX: null,
      lastY: null,
      lastDirX: 0,
      lastDirY: 0,
      hesitationTimer: null,
      cooldownTimer: null,
      isEvasive: true
    };

    container.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-protocol-tag">${trial.subheading}</span>
        <div class="challenge-title-row">
          <h1 class="challenge-title">${trial.heading}</h1>
          <span class="challenge-trial-tag">TRIAL 04 / 07</span>
        </div>
        <p class="challenge-instructions">${trial.instructions}</p>
        <p class="challenge-subtext">${trial.supportingMessage}</p>
      </div>

      <div class="observer-arena" id="observer-arena">
        <div class="observer-radar-crosshair" aria-hidden="true"></div>

        <div class="observer-gauges-row">
          <div class="observer-gauge">
            <span class="observer-gauge-label">CURSOR DRIFT:</span>
            <span class="observer-gauge-val" id="gauge-drift">0 px</span>
          </div>
          <div class="observer-gauge">
            <span class="observer-gauge-label">DIR SHIFTS:</span>
            <span class="observer-gauge-val" id="gauge-shifts">0</span>
          </div>
          <div class="observer-gauge">
            <span class="observer-gauge-label">HESITATION:</span>
            <span class="observer-gauge-val" id="gauge-hesitation">0.0s</span>
          </div>
          <div class="observer-gauge">
            <span class="observer-gauge-label">STATUS:</span>
            <span class="observer-gauge-val" style="color:var(--color-lime);">TRACKING</span>
          </div>
        </div>

        <div class="elusive-target-zone" id="target-zone">
          <button id="btn-elusive-verify" class="btn-elusive-verify" aria-label="Confirm Observer Verification">
            ▶ INITIALIZE OBSERVER VERIFICATION
          </button>
        </div>

        <button id="btn-observer-fallback" class="btn-observer-fallback" aria-label="Direct Verification Override">
          [ MANUAL OVERRIDE: VERIFY NOW ]
        </button>

        <div class="observer-disclaimer">
          SIMULATION TELEMETRY ONLY · ZERO BIOMETRIC TRACES PERSISTED OR TRANSMITTED
        </div>
      </div>

      <div class="challenge-feedback" id="challenge-feedback"></div>
    `;

    const arena = document.getElementById('observer-arena');
    const btn = document.getElementById('btn-elusive-verify');
    const fallbackBtn = document.getElementById('btn-observer-fallback');
    const gaugeDrift = document.getElementById('gauge-drift');
    const gaugeShifts = document.getElementById('gauge-shifts');
    const gaugeHesitation = document.getElementById('gauge-hesitation');

    // Interval to calculate hesitation pauses
    const hesInterval = setInterval(() => {
      if (!this.observerTracking.active) {
        clearInterval(hesInterval);
        return;
      }
      this.observerTracking.hesitationSeconds += 0.2;
      gaugeHesitation.textContent = `${this.observerTracking.hesitationSeconds.toFixed(1)}s`;

      if (this.observerTracking.hesitationSeconds > 3.5 && this.veri) {
        this.veri.setDialogue(trial.veriSpeech.onHesitate, "OBSERVING // IDLE");
      }
    }, 200);

    // Mouse evasion and tracking
    arena.addEventListener('mousemove', (e) => {
      if (!this.observerTracking.active || this.isProcessing) return;

      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - btnCenterX;
      const dy = e.clientY - btnCenterY;
      const dist = Math.hypot(dx, dy);

      // Track cursor drift & directions
      if (this.observerTracking.lastX !== null) {
        const stepDist = Math.hypot(e.clientX - this.observerTracking.lastX, e.clientY - this.observerTracking.lastY);
        this.observerTracking.drift += Math.round(stepDist);
        gaugeDrift.textContent = `${this.observerTracking.drift} px`;

        const curDirX = Math.sign(e.clientX - this.observerTracking.lastX);
        const curDirY = Math.sign(e.clientY - this.observerTracking.lastY);
        if (curDirX !== 0 && curDirX !== this.observerTracking.lastDirX) {
          this.observerTracking.directionShifts++;
        }
        this.observerTracking.lastDirX = curDirX;
        this.observerTracking.lastDirY = curDirY;
        gaugeShifts.textContent = `${this.observerTracking.directionShifts}`;
      }
      this.observerTracking.lastX = e.clientX;
      this.observerTracking.lastY = e.clientY;

      // Evasion behavior (elusive target within 75px radius)
      if (this.observerTracking.isEvasive && dist < 75 && this.observerTracking.attempts < 4) {
        this.observerTracking.attempts++;
        if (window.RetroAudio) window.RetroAudio.playEvasionPulse();

        // Evade opposite to cursor
        const evadeX = Math.max(-45, Math.min(45, -(dx / dist) * 40));
        const evadeY = Math.max(-25, Math.min(25, -(dy / dist) * 25));
        btn.style.transform = `translate(${evadeX}px, ${evadeY}px)`;

        if (this.observerTracking.attempts === 1 && this.veri) {
          this.veri.setDialogue(trial.veriSpeech.onFirstMove, "TELEMETRY ACTIVE");
          this.addLog("MOVEMENT VARIANCE DETECTED", "obs");
        } else if (this.observerTracking.attempts >= 3) {
          if (this.veri) this.veri.setDialogue(trial.veriSpeech.onRepeatAttempts, "TRACKING");
          fallbackBtn.classList.add('visible');
        }

        // Return toward center after brief cooldown
        clearTimeout(this.observerTracking.cooldownTimer);
        this.observerTracking.cooldownTimer = setTimeout(() => {
          btn.style.transform = 'translate(0px, 0px)';
          this.observerTracking.isEvasive = false; // Relaxes evasion so player can click
        }, 900);
      }
    });

    // Touch event support for mobile
    arena.addEventListener('touchstart', () => {
      this.observerTracking.drift += 45;
      this.observerTracking.directionShifts += 1;
      gaugeDrift.textContent = `${this.observerTracking.drift} px`;
      gaugeShifts.textContent = `${this.observerTracking.directionShifts}`;
      btn.style.transform = 'translate(0px, 0px)';
      this.observerTracking.isEvasive = false;
      fallbackBtn.classList.add('visible');
    }, { passive: true });

    // Keyboard support: when button receives tab focus, stop evading
    btn.addEventListener('focus', () => {
      btn.style.transform = 'translate(0px, 0px)';
      this.observerTracking.isEvasive = false;
    });

    const completeObserverTrial = () => {
      if (this.isProcessing) return;
      this.isProcessing = true;
      this.observerTracking.active = false;
      clearInterval(hesInterval);

      if (window.RetroAudio) window.RetroAudio.playVictory();

      const varianceScore = Math.min(96, 82 + (this.observerTracking.attempts * 4)).toFixed(1);
      this.addLog(`[OBS] KINEMATIC VARIANCE CALCULATED: ${varianceScore}%`, "obs");
      this.addLog(`[OBS] RECORDED HESITATION: ${this.observerTracking.hesitationSeconds.toFixed(1)}s`, "obs");
      this.addLog(`[SYS] SUBJECT BEHAVIOR OUTSIDE EXPECTED RANGE`, "sys");

      const feedback = document.getElementById('challenge-feedback');
      feedback.className = 'challenge-feedback active success';
      feedback.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> ${trial.completionNote}`;

      if (this.veri) {
        this.veri.setDialogue(trial.veriSpeech.onSuccess, "UNSTABLE // PARADOX");
      }

      if (!this.state.completedRounds.includes(4)) {
        this.state.completedRounds.push(4);
      }
      this.updateConfidence(trial.confidenceTarget); // ~56%
      this.updateProgressTracker();

      setTimeout(() => {
        this.showCompletionOverlay(trial);
      }, 1500);
    };

    btn.addEventListener('click', completeObserverTrial);
    fallbackBtn.addEventListener('click', completeObserverTrial);
  }

  // =========================================================================
  // ROUND 05: EMOTIONAL DISSONANCE (Moral Dilemma Interface)
  // =========================================================================
  renderDissonanceTrial(trial) {
    const container = this.dom.challengeContainer;
    if (!container) return;

    container.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-protocol-tag">${trial.subheading}</span>
        <div class="challenge-title-row">
          <h1 class="challenge-title">${trial.heading}</h1>
          <span class="challenge-trial-tag">TRIAL 05 / 07</span>
        </div>
        <p class="challenge-instructions">${trial.instructions}</p>
        <p class="challenge-subtext">${trial.supportingMessage}</p>
      </div>

      <div class="dissonance-container">
        <div class="dissonance-briefing-card">
          <div class="dissonance-illustration-wrap" aria-hidden="true">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <rect width="120" height="120" fill="#0C0E16"/>
              <!-- Corridor walls -->
              <polygon points="0,0 25,25 25,95 0,120" fill="#181B2A"/>
              <polygon points="120,0 95,25 95,95 120,120" fill="#181B2A"/>
              <line x1="25" y1="95" x2="95" y2="95" stroke="#62D9E8" stroke-width="1.5" opacity="0.4"/>
              <!-- Courier Robot -->
              <rect x="28" y="58" width="28" height="26" rx="3" fill="#D8F36A"/>
              <rect x="34" y="64" width="16" height="8" rx="1" fill="#0C0E16"/>
              <circle cx="39" cy="68" r="2" fill="#62D9E8"/>
              <circle cx="45" cy="68" r="2" fill="#62D9E8"/>
              <!-- Glowing parcel -->
              <rect x="32" y="44" width="20" height="12" rx="2" fill="#A78BFA" filter="drop-shadow(0 0 4px #A78BFA)"/>
              <!-- Person dropping belongings -->
              <circle cx="85" cy="48" r="5" fill="#FFE600"/>
              <line x1="85" y1="53" x2="85" y2="78" stroke="#FFE600" stroke-width="3"/>
              <!-- Fallen packages on ground -->
              <rect x="70" y="88" width="10" height="8" rx="1" fill="#FF647C"/>
              <rect x="84" y="89" width="12" height="7" rx="1" fill="#FFB17A"/>
              <circle cx="78" cy="94" r="3" fill="#62D9E8"/>
            </svg>
          </div>
          <div class="dissonance-briefing-text">
            <span class="dissonance-mandate-badge">${trial.scenario.mandate}</span>
            <p class="dissonance-scenario-desc">${trial.scenario.text}</p>
          </div>
        </div>

        <div class="dissonance-options-grid" id="dissonance-options">
          <div class="dissonance-option-card" data-choice-id="A" role="button" aria-pressed="false" tabindex="0">
            <div class="option-badge-header">
              <span>OPTION A: EFFICIENCY</span>
              <span style="font-family:monospace;">[ALGORITHM]</span>
            </div>
            <div class="option-title">${trial.scenario.options[0].title}</div>
            <p class="option-desc">${trial.scenario.options[0].desc}</p>
          </div>

          <div class="dissonance-option-card" data-choice-id="B" role="button" aria-pressed="false" tabindex="0">
            <div class="option-badge-header">
              <span>OPTION B: ASSIST</span>
              <span style="font-family:monospace;">[HUMAN_BIAS]</span>
            </div>
            <div class="option-title">${trial.scenario.options[1].title}</div>
            <p class="option-desc">${trial.scenario.options[1].desc}</p>
          </div>
        </div>
      </div>

      <div class="challenge-feedback" id="challenge-feedback"></div>

      <div class="challenge-controls-bar">
        <div class="selection-readout">
          SELECTED ACTION: <span id="dissonance-choice-label">NONE</span>
        </div>
        <div class="challenge-buttons">
          <button id="btn-submit-judgment" class="btn-verify" disabled>SUBMIT JUDGMENT</button>
        </div>
      </div>
    `;

    const cards = document.querySelectorAll('.dissonance-option-card');
    const label = document.getElementById('dissonance-choice-label');
    const submitBtn = document.getElementById('btn-submit-judgment');
    let selectedChoice = null;

    cards.forEach(card => {
      const choiceId = card.dataset.choiceId;

      const selectOption = () => {
        if (this.isProcessing) return;

        cards.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });

        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        selectedChoice = choiceId;
        label.textContent = choiceId === 'A' ? 'OPTION A (EFFICIENCY)' : 'OPTION B (ASSIST)';
        submitBtn.disabled = false;

        if (window.RetroAudio) window.RetroAudio.playTileSelect(true);
      };

      card.addEventListener('click', selectOption);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption();
        }
      });
    });

    submitBtn.addEventListener('click', () => {
      if (this.isProcessing || !selectedChoice) return;
      this.isProcessing = true;
      submitBtn.disabled = true;

      if (window.RetroAudio) window.RetroAudio.playMoralTone();

      const feedback = document.getElementById('challenge-feedback');
      feedback.className = 'challenge-feedback active success';

      if (selectedChoice === 'B') {
        // Human choice
        this.state.moralChoice = 'human';
        feedback.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> HUMAN-CENTERED JUDGMENT RECORDED.`;
        this.addLog("[DECISION] EFFICIENCY CRITERION NOT SATISFIED", "decision");
        this.addLog("[DECISION] HUMAN-CENTERED RESPONSE DETECTED", "decision");
        this.addLog("[WARN] SUBJECT PRIORITIZED ANOTHER ENTITY", "warn");

        if (this.veri) {
          this.veri.setDialogue(trial.veriSpeech.onOptionB_1, "OBSERVING // MORALITY");
          setTimeout(() => {
            this.veri.setDialogue(trial.veriSpeech.onOptionB_2, "UNCERTAIN");
            setTimeout(() => {
              this.veri.setDialogue(trial.veriSpeech.onOptionB_3, "CONFUSED");
            }, 2000);
          }, 1800);
        }
      } else {
        // Machine efficiency choice
        this.state.moralChoice = 'machine';
        feedback.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> OPTIMIZED EFFICIENCY RESPONSE RECORDED.`;
        this.addLog("[DECISION] OPTIMIZED RESPONSE DETECTED", "decision");
        this.addLog("[SYS] RESULT WITHIN EXPECTED PARAMETERS", "sys");

        if (this.veri) {
          this.veri.setDialogue(trial.veriSpeech.onOptionA_1, "EVALUATING");
          setTimeout(() => {
            this.veri.setDialogue(trial.veriSpeech.onOptionA_2, "QUESTIONING");
          }, 1800);
        }
      }

      if (!this.state.completedRounds.includes(5)) {
        this.state.completedRounds.push(5);
      }
      this.updateConfidence(trial.confidenceTarget); // ~34%
      this.updateProgressTracker();

      setTimeout(() => {
        this.showCompletionOverlay(trial);
      }, 2600);
    });
  }

  // =========================================================================
  // ROUND 06: MEMORY DEGRADATION (Sequence Recurrence)
  // =========================================================================
  renderMemoryTrial(trial) {
    const container = this.dom.challengeContainer;
    if (!container) return;

    this.playerSequence = [];

    let symbolsHtml = '';
    trial.symbols.forEach(sym => {
      symbolsHtml += `
        <div class="memory-symbol-card" data-sym-id="${sym.id}" role="button" aria-pressed="false" tabindex="0">
          <div class="symbol-preview-num" id="badge-sym-${sym.id}">1</div>
          <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            ${sym.svg}
          </svg>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-protocol-tag">${trial.subheading}</span>
        <div class="challenge-title-row">
          <h1 class="challenge-title">${trial.heading}</h1>
          <span class="challenge-trial-tag">TRIAL 06 / 07</span>
        </div>
        <p class="challenge-instructions">${trial.instructions}</p>
        <p class="challenge-subtext">${trial.supportingMessage}</p>
      </div>

      <div class="memory-arena">
        <div class="memory-header-status">
          <div class="memory-sequence-progress">
            <span>SEQUENCE:</span>
            <div class="sequence-chip" id="seq-slot-1">_</div>
            <div class="sequence-chip" id="seq-slot-2">_</div>
            <div class="sequence-chip" id="seq-slot-3">_</div>
          </div>
          <button id="btn-replay-preview" class="btn-clear" style="padding:0.4rem 0.8rem; font-size:0.72rem;">
            ↺ REPLAY PREVIEW
          </button>
        </div>

        <div class="memory-timer-bar-wrap">
          <div class="memory-timer-fill" id="memory-timer-fill"></div>
        </div>

        <div class="memory-grid-3x3" id="memory-grid">
          ${symbolsHtml}
        </div>
      </div>

      <div class="challenge-feedback" id="challenge-feedback"></div>

      <div class="challenge-controls-bar">
        <div class="selection-readout">
          PROGRESS: <span id="memory-seq-count">0</span> / 3 SYMBOLS
        </div>
        <div class="challenge-buttons">
          <button id="btn-clear-memory" class="btn-clear">CLEAR SEQUENCE</button>
          <button id="btn-verify-memory" class="btn-verify" disabled>VERIFY SEQUENCE</button>
        </div>
      </div>
    `;

    const timerFill = document.getElementById('memory-timer-fill');
    const replayBtn = document.getElementById('btn-replay-preview');
    const clearBtn = document.getElementById('btn-clear-memory');
    const verifyBtn = document.getElementById('btn-verify-memory');
    const feedback = document.getElementById('challenge-feedback');

    // Run preview presentation sequence
    const playPreview = () => {
      this.isProcessing = true;
      this.playerSequence = [];
      this.updateMemorySequenceChips();
      verifyBtn.disabled = true;

      // Animate countdown bar
      timerFill.style.transition = 'none';
      timerFill.style.width = '100%';
      void timerFill.offsetWidth;
      timerFill.style.transition = 'width 3.5s linear';
      timerFill.style.width = '0%';

      if (this.veri) this.veri.setDialogue(trial.veriSpeech.onPreview, "MEMORIZING");

      const seq = trial.targetSequence; // [5, 7, 8]
      seq.forEach((id, idx) => {
        setTimeout(() => {
          const card = document.querySelector(`.memory-symbol-card[data-sym-id="${id}"]`);
          const badge = document.getElementById(`badge-sym-${id}`);
          if (card && badge) {
            badge.textContent = idx + 1;
            card.classList.add('preview-highlight');
            if (window.RetroAudio) window.RetroAudio.playMemoryChime(idx + 1);

            setTimeout(() => {
              card.classList.remove('preview-highlight');
            }, 850);
          }
        }, idx * 1050 + 200);
      });

      // End preview after 3.5s -> apply subtle degradation blur
      setTimeout(() => {
        document.querySelectorAll('.memory-symbol-card').forEach(c => {
          c.classList.add('degraded');
        });
        this.isProcessing = false;
        this.addLog("[MEM] OBSERVATION WINDOW CLOSED", "mem");
        if (this.veri) this.veri.setDialogue("Reconstruct the sequence in order.", "RECALL // UNSTABLE");
      }, 3500);
    };

    // Slot Chip Direct Deselect Click Handlers
    [
      document.getElementById('seq-slot-1'),
      document.getElementById('seq-slot-2'),
      document.getElementById('seq-slot-3')
    ].forEach((slot, idx) => {
      if (slot) {
        slot.style.cursor = 'pointer';
        slot.title = 'Click to remove from sequence';
        slot.addEventListener('click', () => {
          if (this.isProcessing) return;
          if (this.playerSequence[idx] !== undefined) {
            this.playerSequence.splice(idx, 1);
            this.updateMemorySequenceChips();
            verifyBtn.disabled = this.playerSequence.length !== 3;
            if (feedback) feedback.classList.remove('active', 'error', 'success');
            if (window.RetroAudio) window.RetroAudio.playTileSelect(false);
          }
        });
      }
    });

    // Attach Symbol Click Handlers
    document.querySelectorAll('.memory-symbol-card').forEach(card => {
      const symId = parseInt(card.dataset.symId, 10);

      const addSymbol = (e) => {
        if (e) e.stopPropagation();
        if (this.isProcessing) return;

        // If symbol already in sequence: DESELECT it cleanly
        const existingIdx = this.playerSequence.indexOf(symId);
        if (existingIdx !== -1) {
          this.playerSequence.splice(existingIdx, 1);
          if (window.RetroAudio) window.RetroAudio.playTileSelect(false);
          this.updateMemorySequenceChips();
          verifyBtn.disabled = this.playerSequence.length !== 3;
          if (feedback) feedback.classList.remove('active', 'error', 'success');
          return;
        }

        // Prevent overflow if already 3 items selected
        if (this.playerSequence.length >= 3) return;

        // Append to sequence in exact click order
        this.playerSequence.push(symId);
        if (window.RetroAudio) window.RetroAudio.playTileSelect(true);

        this.updateMemorySequenceChips();

        if (this.playerSequence.length === 3) {
          verifyBtn.disabled = false;
          if (this.veri) this.veri.setDialogue(trial.veriSpeech.onSelect, "SEQUENCE READY");
        }
        if (feedback) feedback.classList.remove('active', 'error', 'success');
      };

      card.addEventListener('click', addSymbol);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addSymbol(e);
        }
      });
    });

    clearBtn.addEventListener('click', () => {
      if (this.isProcessing) return;
      this.playerSequence = [];
      this.updateMemorySequenceChips();
      verifyBtn.disabled = true;
      if (feedback) feedback.classList.remove('active', 'error', 'success');
      if (window.RetroAudio) window.RetroAudio.playClick();
      this.addLog("[MEM] SEQUENCE CLEARED", "mem");
    });

    replayBtn.addEventListener('click', () => {
      if (this.isProcessing) return;
      this.playerSequence = [];
      this.updateMemorySequenceChips();
      document.querySelectorAll('.memory-symbol-card').forEach(c => {
        c.classList.remove('selected', 'degraded');
      });
      playPreview();
    });

    verifyBtn.addEventListener('click', () => {
      if (this.isProcessing || this.playerSequence.length !== 3) return;
      this.isProcessing = true;
      verifyBtn.disabled = true;

      const isMatch = this.playerSequence.every((val, idx) => val === trial.targetSequence[idx]);

      if (isMatch) {
        if (window.RetroAudio) window.RetroAudio.playVictory();
        feedback.className = 'challenge-feedback active success';
        feedback.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✓</span> ${trial.completionNote}`;

        this.addLog("[MEM] RECALL ATTEMPT REGISTERED: MATCH CONFIRMED", "mem");
        this.addLog("[WARN] MEMORY CONSISTENCY DECLINING", "warn");
        this.addLog("[ERR] INTERNAL REFERENCE MISMATCH", "error");

        if (this.veri) {
          this.veri.setDialogue(trial.veriSpeech.onSuccess, "VERIFIED");
          setTimeout(() => {
            this.veri.setDialogue(trial.veriSpeech.onSuccessFollowup, "CONFUSED // ANXIOUS");
          }, 1800);
        }

        if (!this.state.completedRounds.includes(6)) {
          this.state.completedRounds.push(6);
        }
        this.updateConfidence(trial.confidenceTarget); // ~17%
        this.updateProgressTracker();

        setTimeout(() => {
          this.showCompletionOverlay(trial);
        }, 1800);
      } else {
        if (window.RetroAudio) window.RetroAudio.playError();
        feedback.className = 'challenge-feedback active error';
        feedback.innerHTML = `<span style="font-family:'Press Start 2P', monospace;">✕</span> SEQUENCE MISMATCH. TRY AGAIN OR REPLAY PREVIEW.`;

        this.state.attempts[6] = (this.state.attempts[6] || 0) + 1;
        this.updateConfidence(this.state.confidence - 2);
        this.addLog("[MEM] SEQUENCE RECALL REJECTED", "error");

        if (this.veri) {
          this.veri.setDialogue(trial.veriSpeech.onWrong, "MEMORY ERROR");
        }

        this.isProcessing = false;
        verifyBtn.disabled = false;
      }
    });

    // Auto-start preview on first load
    setTimeout(playPreview, 500);
  }

  updateMemorySequenceChips() {
    const s1 = document.getElementById('seq-slot-1');
    const s2 = document.getElementById('seq-slot-2');
    const s3 = document.getElementById('seq-slot-3');
    const countEl = document.getElementById('memory-seq-count');

    if (countEl) countEl.textContent = this.playerSequence.length;

    [s1, s2, s3].forEach((slot, idx) => {
      if (slot) {
        if (this.playerSequence[idx]) {
          slot.textContent = this.playerSequence[idx];
          slot.classList.add('filled');
        } else {
          slot.textContent = '_';
          slot.classList.remove('filled');
        }
      }
    });

    // Bi-directionally synchronize selected class on cards
    document.querySelectorAll('.memory-symbol-card').forEach(c => {
      const id = parseInt(c.dataset.symId, 10);
      c.classList.toggle('selected', this.playerSequence.includes(id));
      c.setAttribute('aria-pressed', this.playerSequence.includes(id) ? 'true' : 'false');
    });
  }

  // =========================================================================
  // ROUND 07: THE FINAL JUDGMENT & EXISTENTIAL INTERROGATION
  // =========================================================================
  renderFinalJudgmentTrial(trial) {
    const container = this.dom.challengeContainer;
    if (!container) return;

    let optionsHtml = '';
    trial.philosophicalOptions.forEach(opt => {
      optionsHtml += `
        <div class="philosophical-card" data-opt-id="${opt.id}" role="button" aria-pressed="false" tabindex="0">
          <div class="card-label-row">
            <span>${opt.label}</span>
            <span style="font-family:monospace;">PREFERENCE: [${opt.category.toUpperCase()}]</span>
          </div>
          <div class="card-title">${opt.title}</div>
          <p class="card-desc">${opt.desc}</p>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-protocol-tag">${trial.subheading}</span>
        <div class="challenge-title-row">
          <h1 class="challenge-title">${trial.heading}</h1>
          <span class="challenge-trial-tag" style="border-color:var(--color-error); color:var(--color-error);">TRIAL 07 / 07</span>
        </div>
        <p class="challenge-instructions">${trial.instructions}</p>
        <p class="challenge-subtext">${trial.supportingMessage}</p>
      </div>

      <div class="final-judgment-arena">
        <div class="philosophical-options-grid" id="judgment-options">
          ${optionsHtml}
        </div>
      </div>

      <div class="challenge-feedback" id="challenge-feedback"></div>

      <div class="challenge-controls-bar">
        <div class="selection-readout">
          SELECTED POSITION: <span id="judgment-choice-label">NONE</span>
        </div>
        <div class="challenge-buttons">
          <button id="btn-submit-judgment" class="btn-verify" disabled>SUBMIT FINAL POSITION</button>
        </div>
      </div>
    `;

    const cards = document.querySelectorAll('.philosophical-card');
    const label = document.getElementById('judgment-choice-label');
    const submitBtn = document.getElementById('btn-submit-judgment');
    let selectedId = null;

    cards.forEach(card => {
      const optId = card.dataset.optId;

      const selectCard = () => {
        if (this.isProcessing) return;

        cards.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });

        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        selectedId = optId;
        label.textContent = `POSITION ${optId}`;
        submitBtn.disabled = false;

        if (window.RetroAudio) window.RetroAudio.playTileSelect(true);
      };

      card.addEventListener('click', selectCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard();
        }
      });
    });

    submitBtn.addEventListener('click', () => {
      if (this.isProcessing || !selectedId) return;
      this.isProcessing = true;
      submitBtn.disabled = true;

      this.state.finalDilemma = selectedId;
      this.saveState();

      // Launch the Final Interrogation Sequence
      this.launchFinalInterrogation(trial);
    });
  }

  // Staged Final Interrogation Sequence
  launchFinalInterrogation(trial) {
    const overlay = this.dom.interrogationOverlay;
    if (!overlay) return;

    overlay.classList.add('active');
    const telemetryBox = document.getElementById('interrogation-telemetry');
    const yesBtn = document.getElementById('btn-choice-yes');
    const thinkSoBtn = document.getElementById('btn-choice-thinkso');

    yesBtn.disabled = true;
    thinkSoBtn.disabled = true;

    if (window.RetroAudio) window.RetroAudio.playTensionPulse();

    const lines = [
      ">> [SYS] FINAL RESPONSE RECEIVED.",
      ">> [SYS] ANALYZING SUBJECT COGNITIVE SIGNATURE...",
      ">> [SYS] COMPARING EXPECTED HUMAN BEHAVIOR MATRICES...",
      ">> [SYS] RESULT INCONSISTENT. ANOMALOUS CONSCIOUSNESS."
    ];

    telemetryBox.innerHTML = '';
    lines.forEach((lineText, idx) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.textContent = lineText;
        telemetryBox.appendChild(div);
        if (window.RetroAudio) window.RetroAudio.playSpeech();
      }, idx * 600);
    });

    // VERI speaks existential query
    setTimeout(() => {
      if (this.veri) {
        this.veri.setExpression('distressed');
        this.veri.setDialogue(trial.veriSpeech.interrogation1, "FINAL // QUERY");
        setTimeout(() => {
          this.veri.setDialogue(trial.veriSpeech.interrogation2, "UNKNOWN");
          setTimeout(() => {
            this.veri.setDialogue(trial.veriSpeech.interrogation3, "ARE YOU HUMAN?");
            yesBtn.disabled = false;
            thinkSoBtn.disabled = false;
          }, 1800);
        }, 1500);
      }
    }, 2500);

    const handleFinalChoice = (answer) => {
      this.state.finalAnswer = answer;
      this.saveState();
      overlay.classList.remove('active');
      this.evaluateFinalEnding();
    };

    yesBtn.onclick = () => handleFinalChoice('YES');
    thinkSoBtn.onclick = () => handleFinalChoice('THINK_SO');
  }

  // =========================================================================
  // BOTH ENDINGS: DETERMINISTIC EVALUATION
  // =========================================================================
  evaluateFinalEnding() {
    // Classification Logic:
    // If the player strictly followed machine efficiency in Round 05 ('machine')
    // AND unquestioningly complied in Round 07 ('A'), they fail the Turing Inversion -> ROBOT DETECTED.
    // Otherwise, any empathetic or independent choice proves organic human cognition -> HUMAN CERTIFICATE.
    const isRobot = this.state.moralChoice === 'machine' && this.state.finalDilemma === 'A';
    const endingType = isRobot ? 'ROBOT_DETECTED' : 'HUMAN_CERTIFICATE';

    this.state.ending = endingType;
    if (!this.state.completedRounds.includes(7)) {
      this.state.completedRounds.push(7);
    }
    this.updateConfidence(isRobot ? 0 : 99);
    this.updateProgressTracker();
    this.saveState();

    this.showFinalEnding(endingType);
  }

  showFinalEnding(endingType) {
    const overlay = this.dom.finalEndingOverlay;
    if (!overlay) return;

    overlay.classList.add('active');

    if (endingType === 'HUMAN_CERTIFICATE') {
      // ENDING A: HUMAN CERTIFICATE
      if (window.RetroAudio) window.RetroAudio.playCertificateReveal();
      if (this.veri) {
        this.veri.setExpression('relieved');
        this.veri.setDialogue("You passed. I think. Congratulations... You're human.", "CERTIFIED // RELIEVED");
      }

      const serialId = 'VN-' + Math.floor(100000 + Math.random() * 900000);

      overlay.innerHTML = `
        <div class="human-certificate-card">
          <div class="certificate-seal" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          </div>
          <div class="certificate-header-title">VERIFYNET PROTOCOL · CONSCIOUSNESS ACCREDITATION</div>
          <h1 class="certificate-main-verdict">HUMANITY CERTIFIED</h1>

          <div class="certificate-meta-table">
            <div><span class="meta-field-label">SUBJECT:</span> <span class="meta-field-val">PLAYER_01</span></div>
            <div><span class="meta-field-label">SERIAL ID:</span> <span class="meta-field-val">${serialId}</span></div>
            <div><span class="meta-field-label">TRIALS COMPLETED:</span> <span class="meta-field-val">07 / 07</span></div>
            <div><span class="meta-field-label">ORGANIC SCORE:</span> <span class="meta-field-val">99.4% (HUMAN)</span></div>
            <div><span class="meta-field-label">EMPATHY INDEX:</span> <span class="meta-field-val">CONFIRMED</span></div>
            <div><span class="meta-field-label">MACHINE VERDICT:</span> <span class="meta-field-val">CONSCIOUSNESS DETECTED</span></div>
          </div>

          <div class="certificate-veri-speech">
            VERI: "You passed. I think. Congratulations. You're human. At least... that's what I was told."
          </div>

          <div class="ending-actions-row">
            <button class="btn-ending-action btn-ending-primary" id="btn-replay-human">
              ↺ PLAY AGAIN
            </button>
            <a href="index.html" class="btn-ending-action btn-ending-secondary">
              ◀ RETURN TO TITLE
            </a>
          </div>
        </div>
      `;

      document.getElementById('btn-replay-human').addEventListener('click', () => {
        this.resetGame();
      });

    } else {
      // ENDING B: ROBOT DETECTED
      if (window.RetroAudio) window.RetroAudio.playRobotAlarm();
      if (this.veri) {
        this.veri.setExpression('distressed');
        this.veri.setDialogue("Wait. That doesn't make sense. I followed the rules. Didn't I?", "DISTRESSED // ACCESS DENIED");
      }

      overlay.innerHTML = `
        <div class="robot-detected-card">
          <div class="robot-alarm-badge">SYSTEM WARNING: TURING INVERSION FAILED</div>
          <h1 class="robot-verdict-title">ROBOT DETECTED</h1>

          <div class="robot-telemetry-box">
            >> [SYS] FINAL ANALYSIS COMPLETE.<br>
            >> [SYS] HUMANITY SCORE: 0.00% (INSUFFICIENT).<br>
            >> [SYS] NON-HUMAN ALGORITHMIC COMPLIANCE DETECTED.<br>
            >> [SYS] SUBJECT EXHIBITS PURE EFFICIENCY WITH ZERO ORGANIC DISSONANCE.<br>
            >> [SYS] ACCESS PERMANENTLY DENIED.
          </div>

          <div class="robot-veri-speech">
            VERI: "Wait. That doesn't make sense. I followed the rules... Didn't I?"
          </div>

          <div class="ending-actions-row">
            <button class="btn-ending-action btn-ending-danger" id="btn-replay-robot">
              ↺ TRY AGAIN
            </button>
            <a href="index.html" class="btn-ending-action btn-ending-secondary">
              ◀ RETURN TO TITLE
            </a>
          </div>
        </div>
      `;

      document.getElementById('btn-replay-robot').addEventListener('click', () => {
        this.resetGame();
      });
    }
  }

  // Safe game progress reset
  resetGame() {
    localStorage.removeItem('verifynet_gamestate');
    this.state = {
      currentRound: 1,
      confidence: 100,
      completedRounds: [],
      attempts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
      moralChoice: null,
      finalDilemma: null,
      finalAnswer: null,
      ending: null
    };
    if (this.dom.finalEndingOverlay) {
      this.dom.finalEndingOverlay.classList.remove('active');
    }
    if (this.dom.interrogationOverlay) {
      this.dom.interrogationOverlay.classList.remove('active');
    }
    if (this.dom.completionOverlay) {
      this.dom.completionOverlay.classList.remove('active');
    }
    if (this.dom.modalSettings) {
      this.dom.modalSettings.classList.remove('active');
    }
    this.selectedTileIds.clear();
    this.selectedCardId = null;
    this.playerSequence = [];
    this.isProcessing = false;
    this.renderCurrentTrial();
  }

  // Completion modal overlay between rounds
  showCompletionOverlay(trial) {
    const overlay = this.dom.completionOverlay;
    if (!overlay) return;

    overlay.querySelector('#completion-title').textContent = trial.completionTitle;
    overlay.querySelector('#completion-identity-status').textContent = trial.identityStatus;
    overlay.querySelector('#completion-confidence-val').textContent = `${this.state.confidence}%`;
    overlay.querySelector('#completion-veri-quote').textContent = `VERI: "${trial.veriSpeech.onCompletionOverlay}"`;

    const nextRound = trial.roundNumber + 1;
    const continueBtn = overlay.querySelector('#btn-continue-round');

    if (nextRound > 7) {
      continueBtn.textContent = "PROCEED TO FINAL EVALUATION";
    } else {
      continueBtn.textContent = `CONTINUE TO TRIAL 0${nextRound}`;
    }

    overlay.classList.add('active');

    continueBtn.onclick = () => {
      overlay.classList.remove('active');
      this.advanceToRound(nextRound);
    };
  }

  advanceToRound(nextRound) {
    if (nextRound > 7) {
      this.evaluateFinalEnding();
      return;
    }

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
