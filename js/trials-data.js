/**
 * VERIFYNET — TRIALS DATASET & SVG ASSETS (js/trials-data.js)
 * High-definition vector artwork and validation definitions for Rounds 01, 02, and 03.
 */

window.VerifyNetTrials = [
  // =========================================================================
  // ROUND 01: TRAFFIC LIGHTS (Friendly CAPTCHA)
  // =========================================================================
  {
    roundNumber: 1,
    heading: "SELECT THE TRAFFIC LIGHTS",
    subheading: "HUMAN VERIFICATION PROTOCOL / 001",
    instructions: "Select every image tile that contains a traffic light.",
    supportingMessage: "Let's start with something simple.",
    type: "grid_3x3",
    counterLabel: "SELECTED",
    maxCount: 9,
    correctTileIds: [1, 3, 5, 9],
    confidenceTarget: 98,
    completionTitle: "TRIAL 01 COMPLETE",
    identityStatus: "ACCEPTABLE",
    completionNote: "VERIFICATION ACCEPTED",
    veriSpeech: {
      onEntry: "Oh. A player.",
      onDelay: "Welcome to the Human Trial.",
      onFirstSelect: "Good eye.",
      onManySelect: "You're taking this rather seriously.",
      onSuccess: "Excellent! You seem perfectly normal.",
      onCompletionOverlay: "That was easy, wasn't it?"
    },
    systemLogs: [
      "[SYS] INITIALIZING PROTOCOL / 001",
      "[CAPTCHA] 3x3 MATRIX RENDERED",
      "[QUERY] IDENTIFY TRAFFIC SIGNALS",
      "[SENSOR] MONITORING SELECTION LATENCY"
    ],
    tiles: [
      {
        id: 1,
        title: "Urban Intersection Signal",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#121520"/>
          <!-- Road & curb -->
          <rect y="85" width="120" height="35" fill="#1E2232"/>
          <line x1="0" y1="102" x2="120" y2="102" stroke="#D8F36A" stroke-dasharray="8 6" stroke-width="2" opacity="0.6"/>
          <!-- Distant skyline -->
          <rect x="10" y="30" width="22" height="55" fill="#181B28"/>
          <rect x="75" y="20" width="30" height="65" fill="#161926"/>
          <!-- Tall Traffic Light Post -->
          <rect x="42" y="25" width="5" height="60" fill="#2E344A"/>
          <rect x="36" y="22" width="17" height="36" rx="3" fill="#0C0E14" stroke="#4B536D" stroke-width="1.5"/>
          <!-- 3 Glowing Lenses -->
          <circle cx="44.5" cy="28" r="3.5" fill="#FF5252" filter="drop-shadow(0 0 3px #FF5252)"/>
          <circle cx="44.5" cy="37" r="3.5" fill="#423010"/>
          <circle cx="44.5" cy="46" r="3.5" fill="#103820"/>
        </svg>`
      },
      {
        id: 2,
        title: "Building Facade",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#141724"/>
          <!-- Office Building -->
          <rect x="15" y="15" width="90" height="105" fill="#1D2235" stroke="#2B324D"/>
          <!-- Windows grid -->
          <g fill="#A78BFA" opacity="0.4">
            <rect x="25" y="25" width="12" height="15" rx="1"/>
            <rect x="45" y="25" width="12" height="15" rx="1"/>
            <rect x="65" y="25" width="12" height="15" rx="1"/>
            <rect x="85" y="25" width="12" height="15" rx="1"/>
            <rect x="25" y="50" width="12" height="15" rx="1"/>
            <rect x="45" y="50" width="12" height="15" rx="1"/>
            <rect x="65" y="50" width="12" height="15" rx="1"/>
            <rect x="85" y="50" width="12" height="15" rx="1"/>
            <rect x="25" y="75" width="12" height="15" rx="1"/>
            <rect x="45" y="75" width="12" height="15" rx="1"/>
            <rect x="65" y="75" width="12" height="15" rx="1"/>
            <rect x="85" y="75" width="12" height="15" rx="1"/>
          </g>
          <!-- Sidewalk curb -->
          <rect y="105" width="120" height="15" fill="#262C42"/>
        </svg>`
      },
      {
        id: 3,
        title: "Zebra Crossing & Signal",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#11131E"/>
          <!-- Crosswalk stripes -->
          <polygon points="10,120 25,120 45,75 35,75" fill="#F2F1E9" opacity="0.3"/>
          <polygon points="40,120 55,120 75,75 65,75" fill="#F2F1E9" opacity="0.3"/>
          <polygon points="70,120 85,120 105,75 95,75" fill="#F2F1E9" opacity="0.3"/>
          <!-- Pedestrian Signal Post -->
          <rect x="85" y="30" width="4" height="55" fill="#3D4560"/>
          <rect x="80" y="26" width="14" height="28" rx="2" fill="#0E1017" stroke="#62D9E8" stroke-width="1.2"/>
          <circle cx="87" cy="33" r="3" fill="#201010"/>
          <!-- Green Walking Signal -->
          <circle cx="87" cy="45" r="3.5" fill="#62D9E8" filter="drop-shadow(0 0 4px #62D9E8)"/>
        </svg>`
      },
      {
        id: 4,
        title: "Parked Vehicle",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#131622"/>
          <rect y="75" width="120" height="45" fill="#1A1D2B"/>
          <!-- Car silhouette -->
          <path d="M25 78 L38 58 L78 58 L95 72 L102 78 L102 88 L20 88 Z" fill="#6A5ACD" opacity="0.85"/>
          <!-- Car windows -->
          <polygon points="42,61 74,61 88,72 40,72" fill="#62D9E8" opacity="0.5"/>
          <!-- Wheels -->
          <circle cx="36" cy="88" r="8" fill="#0C0E14" stroke="#4B536D" stroke-width="2"/>
          <circle cx="86" cy="88" r="8" fill="#0C0E14" stroke="#4B536D" stroke-width="2"/>
        </svg>`
      },
      {
        id: 5,
        title: "Overhead Signal Beacon",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#0F121C"/>
          <!-- Cantilever mast arm -->
          <path d="M15 110 L15 25 L85 25" stroke="#38405A" stroke-width="4" fill="none"/>
          <!-- Suspended Traffic Light -->
          <line x1="65" y1="25" x2="65" y2="40" stroke="#38405A" stroke-width="2"/>
          <rect x="52" y="40" width="26" height="15" rx="3" fill="#0C0E14" stroke="#D8F36A" stroke-width="1.2"/>
          <!-- Horizontal 3-lens Traffic Light -->
          <circle cx="58" cy="47.5" r="3" fill="#FF5252"/>
          <circle cx="65" cy="47.5" r="3" fill="#FFE600" filter="drop-shadow(0 0 4px #FFE600)"/>
          <circle cx="72" cy="47.5" r="3" fill="#153815"/>
          <rect y="95" width="120" height="25" fill="#1B1F2E"/>
        </svg>`
      },
      {
        id: 6,
        title: "Bicycle on Brick Wall",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#181318"/>
          <!-- Brick pattern lines -->
          <line x1="0" y1="30" x2="120" y2="30" stroke="#2B1E2B" stroke-width="1.5"/>
          <line x1="0" y1="55" x2="120" y2="55" stroke="#2B1E2B" stroke-width="1.5"/>
          <line x1="0" y1="80" x2="120" y2="80" stroke="#2B1E2B" stroke-width="1.5"/>
          <rect y="95" width="120" height="25" fill="#16171E"/>
          <!-- Bicycle -->
          <circle cx="35" cy="85" r="14" fill="none" stroke="#D8F36A" stroke-width="2"/>
          <circle cx="85" cy="85" r="14" fill="none" stroke="#D8F36A" stroke-width="2"/>
          <polyline points="35,85 55,85 70,68 85,85" stroke="#A78BFA" stroke-width="2" fill="none"/>
          <line x1="55" y1="85" x2="48" y2="65" stroke="#A78BFA" stroke-width="2"/>
          <line x1="70" y1="68" x2="72" y2="60" stroke="#D8F36A" stroke-width="2"/>
        </svg>`
      },
      {
        id: 7,
        title: "Highway Lanes",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#10131F"/>
          <!-- Road perspective -->
          <polygon points="45,40 75,40 120,120 0,120" fill="#191D2C"/>
          <line x1="60" y1="40" x2="60" y2="120" stroke="#F2F1E9" stroke-dasharray="10 8" stroke-width="2" opacity="0.5"/>
          <!-- Distant car headlights -->
          <circle cx="56" cy="55" r="2" fill="#FFE600" opacity="0.8"/>
          <circle cx="64" cy="55" r="2" fill="#FFE600" opacity="0.8"/>
          <!-- Mountains horizon -->
          <polygon points="0,40 30,28 60,38 90,25 120,40" fill="#141724"/>
        </svg>`
      },
      {
        id: 8,
        title: "Roadway Signpost",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#121522"/>
          <rect y="90" width="120" height="30" fill="#1D2132"/>
          <!-- Pole -->
          <rect x="58" y="25" width="4" height="75" fill="#3D4560"/>
          <!-- Street Sign rectangle -->
          <rect x="25" y="28" width="55" height="16" rx="2" fill="#1B4D3E" stroke="#F2F1E9" stroke-width="1.5"/>
          <text x="32" y="39" font-family="monospace" font-size="7" fill="#F2F1E9" font-weight="bold">CYBER RD</text>
          <!-- Speed limit sign -->
          <rect x="42" y="50" width="22" height="24" rx="2" fill="#F2F1E9"/>
          <text x="46" y="65" font-family="monospace" font-size="11" fill="#0C0E14" font-weight="bold">40</text>
        </svg>`
      },
      {
        id: 9,
        title: "Downtown Corner Traffic Light",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#111420"/>
          <!-- Tall skyscraper edge -->
          <rect x="0" y="0" width="50" height="120" fill="#1B2032" stroke="#2B324D"/>
          <rect x="10" y="20" width="12" height="20" fill="#62D9E8" opacity="0.3"/>
          <rect x="28" y="20" width="12" height="20" fill="#62D9E8" opacity="0.3"/>
          <rect x="10" y="60" width="12" height="20" fill="#62D9E8" opacity="0.3"/>
          <rect x="28" y="60" width="12" height="20" fill="#62D9E8" opacity="0.3"/>
          <!-- Traffic Light on pole near corner -->
          <rect x="75" y="25" width="4" height="75" fill="#3A415A"/>
          <rect x="69" y="22" width="16" height="38" rx="3" fill="#0C0E14" stroke="#D8F36A" stroke-width="1.2"/>
          <!-- Glowing Red Light with halos -->
          <circle cx="77" cy="28" r="4" fill="#FF5252" filter="drop-shadow(0 0 5px #FF5252)"/>
          <circle cx="77" cy="38" r="3.5" fill="#2E2812"/>
          <circle cx="77" cy="48" r="3.5" fill="#102C18"/>
          <!-- Road -->
          <rect x="50" y="90" width="70" height="30" fill="#191D2C"/>
        </svg>`
      }
    ]
  },

  // =========================================================================
  // ROUND 02: BICYCLES (Curiosity / Slightly Strange)
  // =========================================================================
  {
    roundNumber: 2,
    heading: "FIND THE BICYCLES",
    subheading: "HUMAN VERIFICATION PROTOCOL / 002",
    instructions: "Select all images that contain bicycles.",
    supportingMessage: "You're getting the hang of this.",
    type: "grid_3x3",
    counterLabel: "BICYCLES FOUND",
    maxCount: 9,
    correctTileIds: [1, 4, 6, 9],
    confidenceTarget: 91,
    completionTitle: "TRIAL 02 COMPLETE",
    identityStatus: "CONSISTENT",
    completionNote: "NO IRREGULARITIES DETECTED",
    veriSpeech: {
      onEntry: "You're doing rather well.",
      onDelay: "Do humans usually enjoy these tests?",
      onFirstSelect: "Interesting.",
      onManySelect: "Do humans usually enjoy these tests?",
      onSuccess: "You're faster than expected.",
      onSuccessFollowup: "That's a good thing. Right?",
      onCompletionOverlay: "See? Everything is perfectly normal."
    },
    systemLogs: [
      "[SYS] ADVANCING TO TRIAL 02",
      "[SYS] ENVIRONMENTAL PARAMETERS MODULATED",
      "[QUERY] ISOLATE HUMAN-POWERED TWO-WHEELERS",
      "[SYS] RESPONSE TIME: NORMAL",
      "[SYS] PLAYER BEHAVIOUR: CONSISTENT"
    ],
    tiles: [
      {
        id: 1,
        title: "Touring Bicycle on Wall",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#181524"/>
          <!-- Purple tinted wall with subtle lighting -->
          <rect x="0" y="0" width="120" height="85" fill="#201A30"/>
          <line x1="0" y1="85" x2="120" y2="85" stroke="#A78BFA" stroke-width="1.5" opacity="0.5"/>
          <rect y="85" width="120" height="35" fill="#141120"/>
          <!-- Touring Bicycle -->
          <circle cx="34" cy="78" r="16" fill="none" stroke="#D8F36A" stroke-width="2"/>
          <circle cx="86" cy="78" r="16" fill="none" stroke="#D8F36A" stroke-width="2"/>
          <!-- Spokes -->
          <line x1="34" y1="62" x2="34" y2="94" stroke="#D8F36A" stroke-width="1" opacity="0.6"/>
          <line x1="18" y1="78" x2="50" y2="78" stroke="#D8F36A" stroke-width="1" opacity="0.6"/>
          <line x1="86" y1="62" x2="86" y2="94" stroke="#D8F36A" stroke-width="1" opacity="0.6"/>
          <!-- Diamond Frame -->
          <polyline points="34,78 58,78 74,58 86,78" stroke="#62D9E8" stroke-width="2.5" fill="none"/>
          <line x1="58" y1="78" x2="50" y2="54" stroke="#62D9E8" stroke-width="2.5"/>
          <!-- Seat & Handlebars -->
          <line x1="44" y1="54" x2="55" y2="54" stroke="#D8F36A" stroke-width="3"/>
          <polyline points="74,58 76,50 82,50" stroke="#D8F36A" stroke-width="2.5" fill="none"/>
        </svg>`
      },
      {
        id: 2,
        title: "Heavy Cruiser Motorcycle",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#14141E"/>
          <rect y="82" width="120" height="38" fill="#1C1C2A"/>
          <!-- Thick motorcycle tires -->
          <circle cx="30" cy="82" r="17" fill="#0C0D12" stroke="#FF647C" stroke-width="3"/>
          <circle cx="90" cy="82" r="17" fill="#0C0D12" stroke="#FF647C" stroke-width="3"/>
          <!-- Heavy engine block & gas tank -->
          <rect x="42" y="72" width="26" height="18" fill="#4B536D"/>
          <path d="M46 64 C50 56, 70 56, 75 64 Z" fill="#FF647C"/>
          <!-- Chrome exhaust pipe -->
          <line x1="46" y1="84" x2="85" y2="84" stroke="#F2F1E9" stroke-width="3"/>
          <!-- Front headlight -->
          <circle cx="88" cy="58" r="4" fill="#FFE600" filter="drop-shadow(0 0 3px #FFE600)"/>
          <line x1="90" y1="82" x2="80" y2="52" stroke="#3D4560" stroke-width="3.5"/>
        </svg>`
      },
      {
        id: 3,
        title: "Walking Pedestrian",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#161522"/>
          <rect y="92" width="120" height="28" fill="#201E2E"/>
          <!-- Streetlamp -->
          <rect x="25" y="20" width="3" height="72" fill="#3D4560"/>
          <circle cx="26.5" cy="20" r="5" fill="#FFE600" opacity="0.6"/>
          <!-- Walking Person silhouette -->
          <circle cx="68" cy="45" r="6" fill="#A78BFA"/>
          <path d="M62 54 L74 54 L76 75 L60 75 Z" fill="#6A5ACD"/>
          <!-- Walking legs -->
          <line x1="64" y1="75" x2="58" y2="95" stroke="#A78BFA" stroke-width="3"/>
          <line x1="72" y1="75" x2="78" y2="95" stroke="#A78BFA" stroke-width="3"/>
        </svg>`
      },
      {
        id: 4,
        title: "Bicycle Wheel & Frame Detail",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#19162A"/>
          <!-- Macro close-up of Bicycle front fork & spoked wheel -->
          <circle cx="50" cy="65" r="44" fill="none" stroke="#D8F36A" stroke-width="3"/>
          <circle cx="50" cy="65" r="6" fill="#2E344A" stroke="#D8F36A" stroke-width="2"/>
          <!-- Radial spokes -->
          <g stroke="#62D9E8" stroke-width="1" opacity="0.7">
            <line x1="50" y1="21" x2="50" y2="109"/>
            <line x1="6" y1="65" x2="94" y2="65"/>
            <line x1="19" y1="34" x2="81" y2="96"/>
            <line x1="19" y1="96" x2="81" y2="34"/>
          </g>
          <!-- Frame Tube & Handlebar -->
          <line x1="50" y1="65" x2="85" y2="20" stroke="#A78BFA" stroke-width="5"/>
          <polyline points="80,18 95,18 98,28" stroke="#D8F36A" stroke-width="3.5" fill="none"/>
        </svg>`
      },
      {
        id: 5,
        title: "Passenger Sedan Outside Store",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#151722"/>
          <rect x="10" y="10" width="100" height="65" fill="#1E2336" stroke="#2D354E"/>
          <rect x="20" y="25" width="80" height="35" fill="#62D9E8" opacity="0.2"/>
          <!-- Sedan -->
          <path d="M15 88 L30 72 L85 72 L105 82 L108 92 L12 92 Z" fill="#2563EB" opacity="0.9"/>
          <circle cx="32" cy="92" r="7" fill="#0C0E14" stroke="#64748B" stroke-width="2"/>
          <circle cx="88" cy="92" r="7" fill="#0C0E14" stroke="#64748B" stroke-width="2"/>
        </svg>`
      },
      {
        id: 6,
        title: "Person Riding Bicycle",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#151322"/>
          <rect y="90" width="120" height="30" fill="#211E30"/>
          <!-- Bicycle -->
          <circle cx="32" cy="85" r="14" fill="none" stroke="#D8F36A" stroke-width="2"/>
          <circle cx="86" cy="85" r="14" fill="none" stroke="#D8F36A" stroke-width="2"/>
          <polyline points="32,85 54,85 72,66 86,85" stroke="#A78BFA" stroke-width="2" fill="none"/>
          <!-- Cyclist Figure -->
          <circle cx="62" cy="38" r="5" fill="#FFE600"/>
          <path d="M58 45 L68 45 L62 65 Z" fill="#62D9E8"/>
          <!-- Limbs pedaling -->
          <polyline points="62,65 52,75 54,85" stroke="#D8F36A" stroke-width="2" fill="none"/>
          <polyline points="65,48 78,54 74,66" stroke="#FFE600" stroke-width="2" fill="none"/>
        </svg>`
      },
      {
        id: 7,
        title: "Electric Kick Scooter",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#14141E"/>
          <rect y="92" width="120" height="28" fill="#1F202D"/>
          <!-- Tiny scooter wheels -->
          <circle cx="32" cy="95" r="7" fill="#FF5252" stroke="#0E1016" stroke-width="2"/>
          <circle cx="86" cy="95" r="7" fill="#FF5252" stroke="#0E1016" stroke-width="2"/>
          <!-- Foot deck -->
          <rect x="32" y="90" width="54" height="4" rx="2" fill="#383D52"/>
          <!-- Vertical Handlebar Stem -->
          <line x1="84" y1="92" x2="80" y2="42" stroke="#F2F1E9" stroke-width="3"/>
          <line x1="72" y1="42" x2="88" y2="42" stroke="#FF5252" stroke-width="3"/>
          <!-- Headlight -->
          <circle cx="78" cy="45" r="2.5" fill="#62D9E8" filter="drop-shadow(0 0 2px #62D9E8)"/>
        </svg>`
      },
      {
        id: 8,
        title: "Yellow Hazard Sign",
        hasTarget: false,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#141624"/>
          <rect y="94" width="120" height="26" fill="#1B1E2E"/>
          <!-- Post -->
          <rect x="58" y="45" width="4" height="55" fill="#3D4560"/>
          <!-- Diamond Sign -->
          <polygon points="60,18 88,46 60,74 32,46" fill="#FFE600" stroke="#121520" stroke-width="3"/>
          <!-- Exclamation point -->
          <rect x="58" y="32" width="4" height="16" fill="#0C0E14"/>
          <circle cx="60" cy="56" r="2.5" fill="#0C0E14"/>
        </svg>`
      },
      {
        id: 9,
        title: "Mountain Bike by Tree",
        hasTarget: true,
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#131522"/>
          <!-- Tree trunk -->
          <rect x="85" y="10" width="18" height="100" fill="#2B211D"/>
          <rect y="88" width="120" height="32" fill="#192019"/>
          <!-- Mountain bike with thick tires -->
          <circle cx="28" cy="84" r="15" fill="none" stroke="#D8F36A" stroke-width="3"/>
          <circle cx="76" cy="84" r="15" fill="none" stroke="#D8F36A" stroke-width="3"/>
          <!-- Knobby tread marks -->
          <circle cx="28" cy="84" r="17" fill="none" stroke="#62D9E8" stroke-dasharray="3 3" stroke-width="1.5"/>
          <circle cx="76" cy="84" r="17" fill="none" stroke="#62D9E8" stroke-dasharray="3 3" stroke-width="1.5"/>
          <!-- Frame -->
          <polyline points="28,84 48,84 62,64 76,84" stroke="#A78BFA" stroke-width="2.5" fill="none"/>
          <line x1="62" y1="64" x2="68" y2="54" stroke="#D8F36A" stroke-width="3"/>
          <line x1="64" y1="54" x2="74" y2="54" stroke="#D8F36A" stroke-width="2.5"/>
        </svg>`
      }
    ]
  },

  // =========================================================================
  // ROUND 03: FIND THE ANOMALY (Suspicion / Anomaly / Psychological Glitch)
  // =========================================================================
  {
    roundNumber: 3,
    heading: "FIND THE ANOMALY",
    subheading: "HUMAN VERIFICATION PROTOCOL / 003",
    instructions: "Three images are identical. One is different. Identify the anomaly.",
    supportingMessage: "Trust your observation.",
    type: "arena_2x2",
    counterLabel: "SELECTED ANOMALY",
    correctCardId: "C",
    confidenceTarget: 78,
    completionTitle: "TRIAL 03 COMPLETE",
    identityStatus: "QUESTIONABLE",
    completionNote: "ERROR: UNEXPECTED RESPONSE DETECTED",
    veriSpeech: {
      onEntry: "Something seems... different.",
      onSelect: "Are you sure about that?",
      onWrong: "That doesn't seem right.",
      onSuccess: "Yes. That is what I expected.",
      onSuccessPause1: "Wait.",
      onSuccessPause2: "Why did I expect that?",
      onCompletionOverlay: "Can we just continue?"
    },
    systemLogs: [
      "[SYS] ENTERING PUZZLE CHAMBER / 003",
      "[SYS] ANOMALY DETECTION TEST ACTIVE",
      "[WARNING] SUBTLE COGNITIVE VARIATION APPLIED",
      "[QUERY] IDENTIFY IRREGULARITY AMONG IDENTICAL ARTIFACTS"
    ],
    cards: [
      {
        id: "A",
        label: "CARD A",
        timeString: "10:10",
        isAnomaly: false,
        svg: `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="120" rx="4" fill="#0C0E16" stroke="#2E344A" stroke-width="2"/>
          <!-- Beveled Clock Chassis -->
          <rect x="15" y="20" width="130" height="80" rx="6" fill="#161928" stroke="#A78BFA" stroke-width="1.5"/>
          <rect x="25" y="30" width="110" height="60" rx="3" fill="#0A0B12"/>
          <!-- Screen Glare Line -->
          <path d="M26 31 L65 31 L35 89 L26 89 Z" fill="rgba(255,255,255,0.03)"/>
          <!-- Glowing 7-segment digital time 10:10 -->
          <text x="80" y="68" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="bold" fill="#D8F36A" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 0 5px rgba(216,243,106,0.5))">10:10</text>
          <!-- Small indicator dots -->
          <circle cx="34" cy="40" r="2" fill="#62D9E8"/>
          <text x="40" y="42" font-family="'Press Start 2P', monospace" font-size="5" fill="#62D9E8">SEC 00</text>
        </svg>`
      },
      {
        id: "B",
        label: "CARD B",
        timeString: "10:10",
        isAnomaly: false,
        svg: `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="120" rx="4" fill="#0C0E16" stroke="#2E344A" stroke-width="2"/>
          <!-- Beveled Clock Chassis -->
          <rect x="15" y="20" width="130" height="80" rx="6" fill="#161928" stroke="#A78BFA" stroke-width="1.5"/>
          <rect x="25" y="30" width="110" height="60" rx="3" fill="#0A0B12"/>
          <!-- Screen Glare Line -->
          <path d="M26 31 L65 31 L35 89 L26 89 Z" fill="rgba(255,255,255,0.03)"/>
          <!-- Glowing 7-segment digital time 10:10 -->
          <text x="80" y="68" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="bold" fill="#D8F36A" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 0 5px rgba(216,243,106,0.5))">10:10</text>
          <!-- Small indicator dots -->
          <circle cx="34" cy="40" r="2" fill="#62D9E8"/>
          <text x="40" y="42" font-family="'Press Start 2P', monospace" font-size="5" fill="#62D9E8">SEC 00</text>
        </svg>`
      },
      {
        id: "C",
        label: "CARD C",
        timeString: "10:11", // THE ANOMALY!
        isAnomaly: true,
        svg: `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="120" rx="4" fill="#0C0E16" stroke="#2E344A" stroke-width="2"/>
          <!-- Beveled Clock Chassis -->
          <rect x="15" y="20" width="130" height="80" rx="6" fill="#161928" stroke="#A78BFA" stroke-width="1.5"/>
          <rect x="25" y="30" width="110" height="60" rx="3" fill="#0A0B12"/>
          <!-- Screen Glare Line -->
          <path d="M26 31 L65 31 L35 89 L26 89 Z" fill="rgba(255,255,255,0.03)"/>
          <!-- Glowing 7-segment digital time 10:11 (Anomaly is 11) -->
          <text x="80" y="68" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="bold" fill="#D8F36A" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 0 5px rgba(216,243,106,0.5))">10:11</text>
          <!-- Small indicator dots -->
          <circle cx="34" cy="40" r="2" fill="#62D9E8"/>
          <text x="40" y="42" font-family="'Press Start 2P', monospace" font-size="5" fill="#62D9E8">SEC 00</text>
        </svg>`
      },
      {
        id: "D",
        label: "CARD D",
        timeString: "10:10",
        isAnomaly: false,
        svg: `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="120" rx="4" fill="#0C0E16" stroke="#2E344A" stroke-width="2"/>
          <!-- Beveled Clock Chassis -->
          <rect x="15" y="20" width="130" height="80" rx="6" fill="#161928" stroke="#A78BFA" stroke-width="1.5"/>
          <rect x="25" y="30" width="110" height="60" rx="3" fill="#0A0B12"/>
          <!-- Screen Glare Line -->
          <path d="M26 31 L65 31 L35 89 L26 89 Z" fill="rgba(255,255,255,0.03)"/>
          <!-- Glowing 7-segment digital time 10:10 -->
          <text x="80" y="68" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="bold" fill="#D8F36A" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 0 5px rgba(216,243,106,0.5))">10:10</text>
          <!-- Small indicator dots -->
          <circle cx="34" cy="40" r="2" fill="#62D9E8"/>
          <text x="40" y="42" font-family="'Press Start 2P', monospace" font-size="5" fill="#62D9E8">SEC 00</text>
        </svg>`
      }
    ]
  }
];
