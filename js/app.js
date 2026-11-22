/**
 * VERIFYNET — MAIN APPLICATION CONTROLLER (js/app.js)
 * Manages game state, modals, settings synchronization, CRT launch sequence,
 * and seamless navigation to Trial 01.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Components
  const bg = new RetroBackground('bg-canvas');
  const veri = new window.VeriCompanion();

  // 2. Modals Elements
  const modalHowToPlay = document.getElementById('modal-how-to-play');
  const modalSettings = document.getElementById('modal-settings');
  const btnHowToPlay = document.getElementById('btn-how-to-play');
  const btnSettings = document.getElementById('btn-settings');
  const closeButtons = document.querySelectorAll('[data-close-modal]');

  // 3. Settings Inputs
  const toggleSoundMain = document.getElementById('toggle-sound-main');
  const toggleSoundModal = document.getElementById('toggle-sound-setting');
  const toggleAnimSetting = document.getElementById('toggle-anim-setting');
  const toggleCrtSetting = document.getElementById('toggle-crt-setting');
  const soundStatusLabel = document.getElementById('sound-status-label');

  // 4. Start Trial Button & CRT Transition
  const btnStartTrial = document.getElementById('btn-start-trial');
  const transitionCurtain = document.getElementById('transition-curtain');
  const crtFlash = document.getElementById('crt-flash');
  const bootLinesContainer = document.getElementById('boot-lines');
  const bootProgressFill = document.getElementById('boot-progress-fill');

  let isGameStarting = false;

  // -------------------------------------------------------------------------
  // AUDIO SETTINGS SYNCHRONIZATION
  // -------------------------------------------------------------------------
  function syncSoundUI(enabled) {
    if (toggleSoundModal) toggleSoundModal.checked = enabled;
    if (soundStatusLabel) soundStatusLabel.textContent = enabled ? 'SND: ON' : 'SND: OFF';
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) {
      soundIcon.innerHTML = enabled
        ? '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'
        : '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    }
  }

  // Initial Sound Setup
  syncSoundUI(window.RetroAudio.enabled);

  if (toggleSoundMain) {
    toggleSoundMain.addEventListener('click', () => {
      const state = window.RetroAudio.toggle();
      syncSoundUI(state);
    });
  }

  if (toggleSoundModal) {
    toggleSoundModal.addEventListener('change', (e) => {
      window.RetroAudio.setEnabled(e.target.checked);
      syncSoundUI(e.target.checked);
      if (e.target.checked) window.RetroAudio.playClick();
    });
  }

  // -------------------------------------------------------------------------
  // ANIMATION & CRT PREFERENCES
  // -------------------------------------------------------------------------
  const animPref = localStorage.getItem('verifynet_anim');
  const crtPref = localStorage.getItem('verifynet_crt');

  if (toggleAnimSetting) {
    toggleAnimSetting.checked = animPref !== 'disabled';
    toggleAnimSetting.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('verifynet_anim', 'enabled');
        document.body.classList.remove('no-animations');
        bg.start();
      } else {
        localStorage.setItem('verifynet_anim', 'disabled');
        document.body.classList.add('no-animations');
        bg.stop();
      }
      if (window.RetroAudio) window.RetroAudio.playClick();
    });
    if (animPref === 'disabled') {
      document.body.classList.add('no-animations');
    }
  }

  if (toggleCrtSetting) {
    toggleCrtSetting.checked = crtPref !== 'disabled';
    toggleCrtSetting.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('verifynet_crt', 'enabled');
        document.body.classList.remove('no-crt');
      } else {
        localStorage.setItem('verifynet_crt', 'disabled');
        document.body.classList.add('no-crt');
      }
      if (window.RetroAudio) window.RetroAudio.playClick();
    });
    if (crtPref === 'disabled') {
      document.body.classList.add('no-crt');
    }
  }

  // -------------------------------------------------------------------------
  // MODAL CONTROLS
  // -------------------------------------------------------------------------
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    if (window.RetroAudio) window.RetroAudio.playModalOpen();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (window.RetroAudio) window.RetroAudio.playModalClose();
  }

  function closeAllModals() {
    closeModal(modalHowToPlay);
    closeModal(modalSettings);
  }

  if (btnHowToPlay) {
    btnHowToPlay.addEventListener('click', () => openModal(modalHowToPlay));
    btnHowToPlay.addEventListener('mouseenter', () => window.RetroAudio && window.RetroAudio.playHover());
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', () => openModal(modalSettings));
    btnSettings.addEventListener('mouseenter', () => window.RetroAudio && window.RetroAudio.playHover());
  }

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  // Close on backdrop click
  [modalHowToPlay, modalSettings].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // -------------------------------------------------------------------------
  // START TRIAL FLOW & CRT BOOT SEQUENCE
  // -------------------------------------------------------------------------
  if (btnStartTrial) {
    btnStartTrial.addEventListener('mouseenter', () => {
      if (!isGameStarting) {
        veri.onHoverStartButton();
        if (window.RetroAudio) window.RetroAudio.playHover();
      }
    });

    btnStartTrial.addEventListener('click', () => {
      if (isGameStarting) return; // Prevent repeated clicks
      isGameStarting = true;

      // 1. Audio and Button state
      if (window.RetroAudio) window.RetroAudio.playStart();
      btnStartTrial.classList.add('loading');
      btnStartTrial.disabled = true;

      // 2. VERI reaction
      veri.onStartGame();

      // 3. Screen Flash
      if (crtFlash) {
        crtFlash.classList.add('flash');
      }

      // 4. Activate Transition Curtain
      setTimeout(() => {
        if (transitionCurtain) {
          transitionCurtain.classList.add('active');
        }

        // Animated Boot Sequence
        const bootMessages = [
          { text: ">> VERIFYNET KERNEL v0.07 ONLINE", class: "cyan", delay: 200 },
          { text: ">> SUBJECT_ID: PLAYER_01 (HUMAN SUSPECT)", class: "purple", delay: 500 },
          { text: ">> DISTRUST ALGORITHM: MAXIMUM CONFIDENCE", class: "lime", delay: 850 },
          { text: ">> INITIALIZING TRIAL 01: THE FIRST TEST...", class: "lime", delay: 1200 }
        ];

        if (bootLinesContainer) {
          bootLinesContainer.innerHTML = '';
          bootMessages.forEach(msg => {
            setTimeout(() => {
              const div = document.createElement('div');
              div.className = `boot-line ${msg.class}`;
              div.textContent = msg.text;
              bootLinesContainer.appendChild(div);
              if (window.RetroAudio) window.RetroAudio.playSpeech();
            }, msg.delay);
          });
        }

        if (bootProgressFill) {
          setTimeout(() => {
            bootProgressFill.style.width = '100%';
          }, 300);
        }

        // 5. Navigate to Trial 01 Screen
        setTimeout(() => {
          // Integrated navigation callback pattern
          if (typeof window.VerifyNetLaunchTrial === 'function') {
            window.VerifyNetLaunchTrial(1);
          } else {
            window.location.href = 'trial-01.html';
          }
        }, 2200);

      }, 350);
    });
  }

  // Generic Button Hover SFX
  document.querySelectorAll('button:not(#btn-start-trial), .icon-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (window.RetroAudio) window.RetroAudio.playHover();
    });
  });

  // Global namespace for testing and expansion
  window.VerifyNet = {
    audio: window.RetroAudio,
    veri: veri,
    background: bg,
    startTrial: () => {
      if (btnStartTrial) btnStartTrial.click();
    }
  };
});
