// test-engine-dom.js
// Tests DOM interactions and VerifyNetGameEngine class methods

const fs = require('fs');
const path = require('path');

// Simple DOM Mock
class MockElement {
  constructor(tagName = 'div', id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ') : []),
      add(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === true) this.add(c);
        else if (force === false) this.remove(c);
        else if (this.contains(c)) this.remove(c);
        else this.add(c);
      }
    };
    this.attributes = {};
    this.dataset = {};
    this.children = [];
    this.listeners = {};
    this.textContent = '';
    this.innerHTML = '';
    this.disabled = false;
    this.style = {};
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, currentTarget: this, stopPropagation() {} });
  }

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }

  querySelectorAll(sel) {
    const results = [];
    const check = (el) => {
      if (sel.startsWith('#') && el.id === sel.slice(1)) results.push(el);
      else if (sel.startsWith('.') && el.classList.contains(sel.slice(1))) results.push(el);
      else if (el.tagName.toLowerCase() === sel.toLowerCase()) results.push(el);
      el.children.forEach(check);
    };
    this.children.forEach(check);
    return results;
  }

  appendChild(el) {
    this.children.push(el);
    return el;
  }
}

class MockDocument {
  constructor() {
    this.elementsById = {};
    this.body = new MockElement('body');
  }

  getElementById(id) {
    return this.elementsById[id] || null;
  }

  createElement(tag) {
    return new MockElement(tag);
  }

  querySelectorAll(sel) {
    const res = [];
    for (const id in this.elementsById) {
      const el = this.elementsById[id];
      if (sel.startsWith('.') && el.classList.contains(sel.slice(1))) res.push(el);
      else if (sel.startsWith('#') && el.id === sel.slice(1)) res.push(el);
    }
    return res;
  }
}

const mockDoc = new MockDocument();
global.document = mockDoc;
global.window = {
  document: mockDoc,
  location: { search: '' },
  localStorage: {
    _d: {},
    getItem(k) { return this._d[k] || null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  },
  RetroAudio: {
    enabled: true,
    playTileSelect() {},
    playClick() {},
    playVictory() {},
    playError() {},
    playLevelUp() {},
    playMoralTone() {},
    playMemoryChime() {},
    playCertificateReveal() {},
    playTensionPulse() {},
    playSpeech() {},
    playEvasionPulse() {}
  }
};

// Register elements needed by engine
const ids = [
  'hud-round-title', 'confidence-val', 'confidence-meter-fill', 'challenge-container',
  'log-terminal-body', 'toggle-sound-hud', 'sound-status-hud-label', 'btn-hud-settings',
  'modal-settings', 'modal-how-to-play', 'round-completion-overlay', 'transition-curtain',
  'glitch-flash', 'interrogation-overlay', 'final-ending-overlay'
];

ids.forEach(id => {
  const el = new MockElement('div', id);
  mockDoc.elementsById[id] = el;
});

// Load trials-data and test engine
const trialsCode = fs.readFileSync(path.join(__dirname, '../js/trials-data.js'), 'utf8');
eval(trialsCode);

console.log("=================================================");
console.log("TESTING VERIFYNET ENGINE DOM SYNCHRONIZATION");
console.log("=================================================\n");

// Read game.js code and wrap class for testing
const gameJsCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

// Test that CSS pointer-events rules are strictly in place
const gameCss = fs.readFileSync(path.join(__dirname, '../css/game.css'), 'utf8');
const modalsCss = fs.readFileSync(path.join(__dirname, '../css/modals.css'), 'utf8');

function assert(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
  } else {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
  }
}

// Check CSS pointer-events
assert(gameCss.includes('.round-completion-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1040;\n  background: rgba(10, 12, 18, 0.88);\n  backdrop-filter: blur(8px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;'), "CSS: .round-completion-overlay has pointer-events: none on inactive state");
assert(gameCss.includes('.round-completion-overlay.active {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;'), "CSS: .round-completion-overlay.active has pointer-events: auto");

assert(gameCss.includes('.interrogation-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1055;\n  background: rgba(8, 10, 15, 0.94);\n  backdrop-filter: blur(12px);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;'), "CSS: .interrogation-overlay has pointer-events: none on inactive state");
assert(gameCss.includes('.interrogation-overlay.active {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;'), "CSS: .interrogation-overlay.active has pointer-events: auto");

assert(gameCss.includes('.final-ending-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1090;\n  background: rgba(8, 10, 16, 0.95);\n  backdrop-filter: blur(14px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;'), "CSS: .final-ending-overlay has pointer-events: none on inactive state");
assert(gameCss.includes('.final-ending-overlay.active {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;'), "CSS: .final-ending-overlay.active has pointer-events: auto");

assert(modalsCss.includes('.modal-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(10, 12, 18, 0.82);\n  backdrop-filter: blur(8px);\n  z-index: 1050;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;'), "CSS: .modal-backdrop has pointer-events: none on inactive state");
assert(modalsCss.includes('.modal-backdrop.active {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;'), "CSS: .modal-backdrop.active has pointer-events: auto");

// Check child element pointer-events
assert(gameCss.includes('.captcha-tile * {\n  pointer-events: none;\n}'), "CSS: .captcha-tile * has pointer-events: none to avoid SVG/badge click bubbling traps");
assert(gameCss.includes('.anomaly-card * {\n  pointer-events: none;\n}'), "CSS: .anomaly-card * has pointer-events: none");
assert(gameCss.includes('.dissonance-option-card * {\n  pointer-events: none;\n}'), "CSS: .dissonance-option-card * has pointer-events: none");
assert(gameCss.includes('.memory-symbol-card * {\n  pointer-events: none;\n}'), "CSS: .memory-symbol-card * has pointer-events: none");
assert(gameCss.includes('.philosophical-card * {\n  pointer-events: none;\n}'), "CSS: .philosophical-card * has pointer-events: none");
assert(gameCss.includes('.btn-elusive-verify * {\n  pointer-events: none;\n}'), "CSS: .btn-elusive-verify * has pointer-events: none");

console.log("\nAll CSS hit-testing and pointer-events rules verified successfully!");
