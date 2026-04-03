// ─── Element references ────────────────────────────────────────────────────
const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");
const markupInput = document.getElementById("markup");
const feedbackBox = document.getElementById("feedback-output");
const tonePreview = document.getElementById("tone-preview");
const profileUpload = document.getElementById("profile-upload");
const loadingIndicator = document.getElementById("loading-indicator");
const analyzeBtn = document.getElementById("analyze");
const copyBtn = document.getElementById("copy-feedback");
const exportJsonBtn = document.getElementById("export-json");
const exportTextBtn = document.getElementById("export-text");
const toastContainer = document.getElementById("toast-container");

// ─── Shared helpers ────────────────────────────────────────────────────────
const profileCache = new Map();
const MAX_FILE_SIZE = 100 * 1024; // 100KB
const DEBOUNCE_DELAY = 300; // ms
let analyzeTimeout = null;
const feedbackHistory = [];
let historyIndex = -1;

function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Profile schema validation
function validateProfileSchema(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["Profile must be a valid JSON object."];
  }
  if (typeof data.name !== "string" || !data.name.trim()) {
    errors.push('Profile must have a "name" property (non-empty string).');
  }
  if (typeof data.tone !== "string" || !data.tone.trim()) {
    errors.push('Profile must have a "tone" property (non-empty string).');
  }
  if (!Array.isArray(data.checks)) {
    errors.push('Profile must have a "checks" property (array of objects).');
    return errors;
  }
  if (data.checks.length === 0) {
    errors.push("Profile must have at least one check in the checks array.");
  }
  data.checks.forEach((check, idx) => {
    if (!check || typeof check !== "object") {
      errors.push(`Check ${idx}: must be an object.`);
      return;
    }
    if (typeof check.keyword !== "string" || !check.keyword.trim()) {
      errors.push(
        `Check ${idx}: must have a "keyword" property (non-empty string).`,
      );
    }
    if (typeof check.message !== "string" || !check.message.trim()) {
      errors.push(
        `Check ${idx}: must have a "message" property (non-empty string).`,
      );
    }
    if (
      check.technical !== undefined &&
      (typeof check.technical !== "string" || !check.technical.trim())
    ) {
      errors.push(
        `Check ${idx}: if provided, "technical" must be a non-empty string.`,
      );
    }
    if (!["warn", "info"].includes(check.severity)) {
      errors.push(`Check ${idx}: severity must be "warn" or "info".`);
    }
  });
  return errors;
}

// Debounce helper
function debounce(fn, delay) {
  return function (...args) {
    clearTimeout(analyzeTimeout);
    analyzeTimeout = setTimeout(() => fn(...args), delay);
  };
}

// Add to history
function addToHistory(feedback) {
  if (historyIndex < feedbackHistory.length - 1) {
    feedbackHistory.splice(historyIndex + 1);
  }
  feedbackHistory.push(feedback);
  historyIndex = feedbackHistory.length - 1;
}

const inlineProfiles = {
  adhd: {
    name: "ADHD",
    tone: "scattered, effortful, alert",
    description:
      "Layout feels like chasing thoughts across a busy room. Visual noise, unclear pacing and overlapping stimuli demand executive function at every scroll. Simplicity becomes permission to stay.",
    checks: [
      {
        keyword: "marquee",
        message:
          "Moving or scrolling text pulls focus involuntarily. For someone with ADHD, it can make the rest of the page disappear. Remove or replace with static content.",
        technical:
          "Avoid <marquee> or CSS scroll animations on text. These create involuntary attention capture and disrupt reading flow.",
        severity: "warn",
      },
      {
        keyword: "autoplay",
        message:
          "Autoplaying media hijacks attention before the user chooses to engage. This can derail the entire session. Add a play button instead.",
        technical:
          "Do not use autoplay on video or audio elements. Require explicit user interaction to start media.",
        severity: "warn",
      },
      {
        keyword: "animation",
        message:
          "Decorative animation competes with content for attention. For someone with ADHD, motion on the periphery is hard to ignore. Reserve animation for meaningful transitions.",
        technical:
          "Limit animation to purposeful state changes. Wrap decorative animations in a prefers-reduced-motion media query.",
        severity: "warn",
      },
      {
        keyword: "placeholder",
        message:
          "Placeholder text disappears when typing begins. For someone with ADHD, losing the instruction mid-task can cause confusion or a restart. Use a visible label instead.",
        technical:
          "Do not rely on placeholder as the sole label for an input. Use a persistent <label> element above or beside the field.",
        severity: "warn",
      },
      {
        keyword: "infinite",
        message:
          "Infinite scroll removes natural stopping points. Without them, it becomes hard to disengage. Consider pagination or a clear 'load more' boundary.",
        technical:
          "Avoid infinite scroll patterns. Use paginated navigation or an explicit load trigger to create cognitive rest points.",
        severity: "warn",
      },
      {
        keyword: "modal",
        message:
          "Modals interrupt flow without warning. If the user wasn't expecting a new layer, it can feel disorienting. Keep modal use minimal and always provide a clear close action.",
        technical:
          "Ensure modals have a visible close button, trap focus correctly, and return focus to the trigger element on close.",
        severity: "info",
      },
      {
        keyword: "countdown",
        message:
          "Timed countdowns or session expiry warnings create urgency that can spike anxiety and derail concentration. Give users control over their own pace.",
        technical:
          "Avoid time-limited interactions where possible. If a timeout is required, give at least 20 seconds of warning and an option to extend.",
        severity: "warn",
      },
      {
        keyword: "tooltip",
        message:
          "Tooltips that appear only on hover can vanish before the user has finished reading. Consider inline help text that stays visible.",
        technical:
          "Supplement hover tooltips with persistent help text or aria-describedby references that do not disappear on focus loss.",
        severity: "info",
      },
    ],
  },
  dyslexia: {
    name: "Dyslexia",
    tone: "effortful, pattern-sensitive, clarity-seeking",
    description:
      "Text arrives slowly, sometimes out of order. Dense paragraphs and decorative fonts blur meaning. Structure, spacing and semantic clarity offer relief. Simplicity isn't minimalism—it's access.",
    checks: [
      {
        keyword: "font-family",
        message:
          "Consider using dyslexia-friendly fonts like Lexend or OpenDyslexic. Avoid cursive or overly stylized typefaces.",
        severity: "warn",
      },
      {
        keyword: "line-height",
        message:
          "Adequate line spacing improves readability. Aim for at least 1.5x the font size.",
        severity: "info",
      },
      {
        keyword: "justify",
        message:
          "Justified text can create uneven spacing. Left-align for consistent rhythm.",
        severity: "warn",
      },
    ],
  },
  screenreader: {
    name: "Screen Reader User",
    tone: "linear, anticipatory, moment-to-moment",
    description:
      "The page arrives as a stream, not a surface. There is no glancing around, no skipping ahead, no sense of the whole before the parts. Each element is announced in sequence — heading, link, button, image — and meaning accumulates one moment at a time. A well-structured page feels like a clear path. A poorly structured one feels like a room where the furniture has been moved in the dark. Confidence comes from consistency. When the heading order holds, when every image has a name, when focus never disappears — the interface becomes navigable. When any of those things break, the stream breaks with them.",
    checks: [
      {
        keyword: "img",
        message:
          "Images should include alt text. Screenreader users rely on alt to understand meaning.",
        severity: "warn",
      },
      {
        keyword: "role=",
        message:
          "Custom roles should be used carefully. Native semantics are preferred when possible.",
        severity: "info",
      },
      {
        keyword: "tabindex",
        message:
          "Tab order changes can confuse screenreader flow. Use tabindex intentionally and test focus behavior.",
        severity: "info",
      },
      {
        keyword: "<h1",
        message:
          "Headings create a map. Be sure to use them in a logical order (h1 to h6) without skipping levels.",
        severity: "warn",
      },
    ],
  },
  lowvision: {
    name: "Low Vision",
    tone: "blurred, tentative, contrast-seeking",
    description:
      "The page arrives not as a whole—but as fragments in tension. Text floats in a fog of brightness or blends into muted backgrounds. Navigation depends on scale, rhythm, and clear anchors. Every pause is a scan for something readable. Grace lives in contrast, not color.",
    checks: [
      {
        keyword: "color:",
        message:
          "Color is often relied on, but contrast matters more. Ensure text is legible in all lighting environments.",
        severity: "warn",
      },
      {
        keyword: "font-size",
        message:
          "Small text can vanish in low vision contexts. Consider default sizing and allow zoom without breakage.",
        severity: "warn",
      },
    ],
  },
  motor: {
    name: "Motor Disability",
    tone: "deliberate, effort-aware, access-conscious",
    description:
      "Interaction involves effort. Small buttons, hover-only actions, and drag gestures can demand precision some users may not have. Designers should consider the experience of people with motor disabilities—including those who use adaptive tools or keyboard navigation. Clarity comes from large touch targets, reduced motion demands, and flexible input paths. Design should honor movement—because for many, it carries cost.",
    checks: [
      {
        keyword: "hover",
        message:
          "Hover-only interactions can block access for users who rely on keyboard or voice input. Ensure all actions are reachable without a mouse.",
        technical:
          "Avoid hover-only interactions. Ensure all interactive elements are operable with keyboard or voice input.",
        severity: "info",
      },
      {
        keyword: "button",
        message:
          "Small buttons may be hard to click. Increase target size and spacing to reduce accidental taps.",
        technical:
          "Ensure buttons are at least 44x44px and spaced to reduce touch errors.",
        severity: "warn",
      },
      {
        keyword: "drag",
        message:
          "Drag-and-drop interfaces require fine motor control. Offer alternative actions like “Move Up” or “Add Below” buttons.",
        technical:
          "Avoid requiring drag-and-drop. Provide buttons or keyboard-accessible alternatives for reordering or inserting elements.",
        severity: "warn",
      },
    ],
  },
  blinduser: {
    name: "Blind User",
    tone: "sequential, label-dependent, exploratory",
    description:
      "The interface speaks before it is seen. Navigation depends on correct semantics, alt text, and consistent structure. Redundant descriptions can be helpful. Surprises—like unlabeled buttons or nested actions—erode confidence. Every element asks one question: 'Will this make sense when heard?'",
    checks: [
      {
        keyword: "alt=",
        message:
          "Alt text is the image for someone who cannot see it. Make sure every alt value describes the content or purpose of the image, not just its appearance.",
        technical:
          'Every <img> must have an alt attribute. Decorative images should use alt="". Informative images need a description of meaning, not appearance.',
        severity: "warn",
      },
      {
        keyword: "<table",
        message:
          "Tables are navigated cell by cell. Without clear headers, every cell arrives without context. A blind user may not know what column they're in until they've gone too far.",
        technical:
          "Use <th scope='col'> and <th scope='row'> to associate headers. Add a <caption> to describe the table's purpose.",
        severity: "warn",
      },
      {
        keyword: "<form",
        message:
          "Form fields need labels that are programmatically associated, not just visually nearby. A blind user hears the label before typing—if it's missing, they're guessing.",
        technical:
          "Every form input must have an associated <label for='...'> or aria-label. Do not rely on placeholder text as a label substitute.",
        severity: "warn",
      },
      {
        keyword: "onclick",
        message:
          "If a click event is attached to a non-interactive element like a div or span, it won't be reachable by keyboard or announced correctly by a screen reader.",
        technical:
          "Attach click handlers to native interactive elements (<button>, <a>). If a custom element must be used, add role='button' and tabindex='0' and handle keyboard events.",
        severity: "warn",
      },
      {
        keyword: "display:none",
        message:
          "Content hidden with display:none is invisible to screen readers too. If you're hiding decorative content, that's fine. If it carries meaning, it needs a different approach.",
        technical:
          "Use display:none only for content that should be completely hidden from all users. For visually hidden but screen-reader-accessible content, use a visually-hidden utility class instead.",
        severity: "info",
      },
      {
        keyword: "aria-hidden",
        message:
          "aria-hidden removes content from the accessibility tree entirely. Use it carefully—applied to the wrong element, it can hide navigation, labels or critical context from a blind user.",
        technical:
          "Never apply aria-hidden='true' to focusable elements. Audit all aria-hidden usage to confirm it is applied only to decorative or redundant content.",
        severity: "warn",
      },
      {
        keyword: "svg",
        message:
          "SVG icons and illustrations are often invisible to screen readers unless described. A decorative icon is fine unlabelled—but a meaningful one needs a title or aria-label.",
        technical:
          "Add a <title> inside meaningful SVGs and reference it with aria-labelledby. For decorative SVGs, use aria-hidden='true'.",
        severity: "info",
      },
      {
        keyword: "iframe",
        message:
          "Iframes are announced by their title, not their contents. Without a descriptive title attribute, a blind user lands inside an unlabelled frame with no way to orient themselves.",
        technical:
          "Every <iframe> must have a title attribute that describes its purpose. For embeds that are purely decorative, use aria-hidden='true' on the iframe.",
        severity: "warn",
      },
    ],
  },
  hearing: {
    name: "Deaf or Hard of Hearing User",
    tone: "visual, text-dependent, caption-seeking",
    description:
      "Sound carries information that may not be visible on the page. Videos play without captions, audio-only instructions assume hearing, and sound-based alerts have no visual backup. For deaf and hard of hearing users, equal access means every audio moment is also text. Captions aren't optional—they're navigation.",
    checks: [
      {
        keyword: "video",
        message:
          "Videos require captions or a transcript. Without them, deaf and hard of hearing users miss dialogue, context, and meaning. Captions should be synchronized with audio and include speaker identification and sound descriptions.",
        technical:
          "Add <track kind='captions'> inside <video>, or embed captions directly. Captions should include dialogue, speaker names, and descriptions of significant sounds (e.g., [door slams], [music plays]).",
        severity: "warn",
      },
      {
        keyword: "audio",
        message:
          "Audio-only content (podcasts, recordings, sound effects) must have a transcript or visual alternative. Deaf users cannot access audio without text.",
        technical:
          "Provide a transcript alongside all <audio> elements. For audio embeds, link to a text transcript. Describe sound events that convey meaning.",
        severity: "warn",
      },
      {
        keyword: "caption",
        message:
          "Captions are present. Ensure they are accurate, synchronized, and include speaker identification and sound descriptions.",
        severity: "info",
      },
      {
        keyword: "transcript",
        message:
          "A transcript is available. Ensure it is complete, includes speaker names, and describes significant sounds or music.",
        severity: "info",
      },
      {
        keyword: "sound",
        message:
          "If the page uses sound to convey information (alerts, notifications, status changes), provide a visual or text alternative. No hearing user should be required to hear the page.",
        technical:
          "Never rely on sound alone. Pair audio cues with visual indicators, text messages, or aria-live announcements.",
        severity: "warn",
      },
      {
        keyword: "alert",
        message:
          "Alerts that rely on sound (beeps, chimes, sirens) must also have a visual indicator (color change, animation, icon) and accessible text. Hard of hearing users need to see alerts, not just hear them.",
        technical:
          "Use aria-live regions for alerts. Pair audible alerts with visual feedback and text announcements.",
        severity: "warn",
      },
      {
        keyword: "notification",
        message:
          "Notifications delivered only through sound are inaccessible to deaf users. Use visual + text alternatives.",
        technical:
          "Display notifications visually (toast, banner) with text content. Do not rely on sound alone.",
        severity: "warn",
      },
      {
        keyword: "podcast",
        message:
          "Podcasts and audio content require transcripts. Deaf listeners should be able to read every word.",
        technical:
          "Provide a full written transcript alongside every podcast episode. Format clearly and link obviously.",
        severity: "warn",
      },
    ],
  },
  photosensitivity: {
    name: "Photosensitive or Seizure-Prone User",
    tone: "cautious, contrast-aware, motion-sensitive",
    description:
      "For people with photosensitive epilepsy or other photosensitive conditions, certain visual patterns can trigger seizures. Flashing lights, rapid color changes, high-contrast patterns, and motion can all pose serious health risks. Safe design means removing triggers entirely—not just warning users. Every animation decision needs care. Every flash is a potential crisis.",
    checks: [
      {
        keyword: "animation",
        message:
          "Animations can trigger seizures in photosensitive individuals. Check animation speed: safe animations flash no more than 3 times per second. Remove or slow rapid animations (especially strobing effects, color flashes, or rapid pattern changes).",
        technical:
          "Limit animation to ≤3 flashes/second. Use CSS @media (prefers-reduced-motion) to disable animations for users who request reduced motion. Test with epilepsy safety tools.",
        severity: "warn",
      },
      {
        keyword: "flash",
        message:
          "Flashing content is a direct seizure trigger. Any content that flashes more than 3 times per second poses serious risk. Remove all flashing effects immediately.",
        technical:
          "Use JavaScript to detect and eliminate flashing. No element should flash faster than 3 Hz. Include warning if flashing content is unavoidable, and provide a disable toggle.",
        severity: "warn",
      },
      {
        keyword: "transition",
        message:
          "Rapid transitions between high-contrast colors can trigger seizures. Be especially cautious with white-to-black or black-to-white transitions. Gradual transitions are safer than abrupt ones.",
        technical:
          "Avoid abrupt high-contrast transitions. If transitions are necessary, keep them gradual (>1 second for color changes) and avoid white/black flashing patterns.",
        severity: "warn",
      },
      {
        keyword: "autoplay",
        message:
          "Autoplaying videos or animations can contain flashing or rapid motion. Always require user interaction before any animation or video starts. Never surprise users with motion.",
        technical:
          "Never autoplay video or animated content. Require explicit user action to start. Add visible play button and ensure controls are accessible.",
        severity: "warn",
      },
      {
        keyword: "motion",
        message:
          "Large-scale movement across the screen (parallax scrolling, moving backgrounds) can trigger dizziness and seizures in photosensitive users. Test or disable aggressive motion effects.",
        technical:
          "Avoid parallax scrolling and large motion effects. Use CSS @media (prefers-reduced-motion) to disable motion for users who request it. Test with actual photosensitive individuals if motion is important.",
        severity: "info",
      },
      {
        keyword: "blink",
        message:
          "Blinking text or elements create flashing effects. Remove blinking text. Modern CSS text-decoration-blink is rarely used, but check for custom blink effects (JavaScript-based animations).",
        technical:
          "Never use text-decoration: blink. Search codebase for setInterval/setTimeout-based animations that create blinking effects and remove them.",
        severity: "warn",
      },
      {
        keyword: "strobe",
        message:
          "Strobe effects (rapid on/off patterns) are extremely dangerous for photosensitive individuals. Remove all strobe effects.",
        technical:
          "Eliminate any CSS or JavaScript creating strobe/flashing patterns. If unavoidable, include warning before content loads and provide option to disable it entirely.",
        severity: "warn",
      },
      {
        keyword: "pattern",
        message:
          "High-contrast repeating patterns can trigger visual distortion and seizures. Test patterns with photosensitivity safety tools. Reduce contrast or break up patterns where possible.",
        technical:
          "Use photosensitivity testing tools (e.g., Photosensitive Epilepsy Analysis Tool) to test patterns. Avoid geometric patterns with high contrast. Blur or soften edges of patterned elements.",
        severity: "info",
      },
    ],
  },
};

function normalizeMarkup(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function getProfileURL(profile) {
  return new URL(`profiles/${profile}.json`, window.location.href).href;
}

function setToneHintForSelectedProfile() {
  const selected = profileSelect.options[profileSelect.selectedIndex];
  tonePreview.textContent = selected?.dataset?.tone
    ? `Tone: ${selected.dataset.tone}`
    : "";
}

function addCustomProfile(profileData) {
  const id = `custom-${Date.now()}`;
  const option = document.createElement("option");

  option.value = id;
  option.textContent = profileData.name
    ? `Custom: ${profileData.name}`
    : "Custom profile";
  if (profileData.tone) {
    option.dataset.tone = profileData.tone;
  }

  profileSelect.appendChild(option);
  profileCache.set(id, profileData);

  profileSelect.value = id;
  setToneHintForSelectedProfile();
}

function renderMessage(message, severity = "info") {
  feedbackBox.innerHTML = "";
  const p = document.createElement("p");
  p.className = `result-${severity}`;
  p.textContent = message;
  feedbackBox.appendChild(p);
}

const keywordAliases = {
  modal: ["dialog", "popup", "overlay"],
  autoplay: ["auto-play"],
  animation: ["animate", "transition"],
  marquee: ["ticker", "scroll"],
  infinite: ["infinite-scroll", "infinitescroll"],
  tooltip: ["hint", "help", "aria-describedby"],
  countdown: ["timer", "timeout"],
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getKeywordVariants(keyword) {
  const normalized = keyword.toLowerCase().trim();
  const baseVariants = [normalized];
  if (keywordAliases[normalized]) {
    baseVariants.push(...keywordAliases[normalized]);
  }
  return [...new Set(baseVariants)];
}

function checkKeywordMatch(keyword, markup) {
  const variants = getKeywordVariants(keyword);

  return variants.some((variant) => {
    const plainWord = new RegExp(`\\b${escapeRegex(variant)}\\b`, "i");
    const htmlAttr = new RegExp(`\\b${escapeRegex(variant)}\\s*=`, "i");
    const htmlTag = new RegExp(`<\\s*${escapeRegex(variant)}\\b`, "i");
    return (
      plainWord.test(markup) || htmlAttr.test(markup) || htmlTag.test(markup)
    );
  });
}

// ─── Tone preview on profile change ────────────────────────────────────────
profileSelect.addEventListener("change", setToneHintForSelectedProfile);

profileUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    renderMessage(
      `Profile file is too large (${(file.size / 1024).toFixed(1)}KB). Maximum size is ${MAX_FILE_SIZE / 1024}KB.`,
      "warn",
    );
    profileUpload.value = "";
    return;
  }

  // Check file type
  if (!file.type.includes("json") && !file.name.endsWith(".json")) {
    renderMessage("Please upload a valid JSON file (.json extension).", "warn");
    profileUpload.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const data = JSON.parse(loadEvent.target.result);

      // Validate schema strictly
      const validationErrors = validateProfileSchema(data);
      if (validationErrors.length > 0) {
        const errorMsg = validationErrors.join(" ");
        throw new Error(`Invalid profile format: ${errorMsg}`);
      }

      addCustomProfile(data);
      showToast("Custom profile loaded and selected.", "success");
    } catch (err) {
      console.error(err);
      renderMessage(`Failed to load profile: ${err.message}`, "warn");
      profileUpload.value = "";
    }
  };
  reader.onerror = (err) => {
    console.error(err);
    renderMessage(
      "Error reading profile file. Please try another file.",
      "warn",
    );
    profileUpload.value = "";
  };

  reader.readAsText(file);
});

// Set initial tone for cases where profile is preselected
setToneHintForSelectedProfile();

// ─── Copy feedback to clipboard ────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  const text = feedbackBox.innerText;

  if (!text.trim()) {
    showToast("No feedback to copy yet.", "info");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => showToast("Feedback copied to clipboard.", "success"))
    .catch(() => showToast("Copy failed. Please try again.", "error"));
});

// ─── Export feedback as JSON or text ───────────────────────────────────────
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`, "success");
}

exportJsonBtn.addEventListener("click", () => {
  const text = feedbackBox.innerText;

  if (!text.trim()) {
    showToast("No feedback to export yet.", "info");
    return;
  }

  const feedback = Array.from(feedbackBox.querySelectorAll("article, p")).map(
    (card) => ({
      message: card.textContent,
      type: card.classList.contains("result-warn") ? "warning" : "info",
    }),
  );

  const profile = profileSelect.value;
  const style = styleToggle.value;
  const timestamp = new Date().toISOString();

  const exportData = {
    timestamp,
    profile,
    style,
    feedback,
  };

  const filename = `percept-feedback-${profile}-${Date.now()}.json`;
  downloadFile(
    JSON.stringify(exportData, null, 2),
    filename,
    "application/json",
  );
});

exportTextBtn.addEventListener("click", () => {
  const text = feedbackBox.innerText;

  if (!text.trim()) {
    showToast("No feedback to export yet.", "info");
    return;
  }

  const profile = profileSelect.value;
  const style = styleToggle.value;
  const timestamp = new Date().toISOString();

  const header = `Percept Feedback Export
Profile: ${profileSelect.options[profileSelect.selectedIndex].text}
Style: ${style}
Generated: ${timestamp}

---

${text}`;

  const filename = `percept-feedback-${profile}-${Date.now()}.txt`;
  downloadFile(header + "\n", filename, "text/plain");
});

// ─── Copy all feedback to clipboard ────────────────────────────────────────
const copyAllBtn = document.getElementById("copy-all-feedback");
if (copyAllBtn) {
  copyAllBtn.addEventListener("click", () => {
    const cards = feedbackBox.querySelectorAll("article");
    if (cards.length === 0) {
      showToast("No feedback to copy yet.", "info");
      return;
    }

    const allText = Array.from(cards)
      .map((card) => card.innerText)
      .join("\n\n---\n\n");

    navigator.clipboard
      .writeText(allText)
      .then(() => showToast("All feedback copied to clipboard.", "success"))
      .catch(() => showToast("Copy failed. Please try again.", "error"));
  });
}

// ─── CSV export ───────────────────────────────────────────────────────────
const exportCsvBtn = document.getElementById("export-csv");
if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", () => {
    const cards = feedbackBox.querySelectorAll("article");
    if (cards.length === 0) {
      showToast("No feedback to export yet.", "info");
      return;
    }

    const profile = profileSelect.value;
    const timestamp = new Date().toISOString();

    const rows = [
      ["Keyword", "Message/Technical", "Severity", "Type"],
      ...Array.from(cards).map((card) => {
        const message = card.querySelector("p")?.textContent || "";
        const meta = card.querySelector(".result-meta")?.textContent || "";
        const severity = card.classList.contains("result-warn")
          ? "warn"
          : "info";
        return [meta, message, severity, "feedback"];
      }),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const header = `Profile,Style,Timestamp\n"${profile}","${styleToggle.value}","${timestamp}"\n\n${csv}`;

    const filename = `percept-feedback-${profile}-${Date.now()}.csv`;
    downloadFile(header, filename, "text/csv");
  });
}

// ─── Settings panel ──────────────────────────────────────────────────────────
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
const tonePreviewToggle = document.getElementById("tone-preview-toggle");
const autosaveToggle = document.getElementById("autosave-toggle");
const liveAnalysisToggle = document.getElementById("live-analysis-toggle");

let liveAnalysisEnabled = false;

if (settingsBtn && settingsModal) {
  settingsBtn.addEventListener("click", () => {
    settingsModal.hidden = false;
  });

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.hidden = true;
    });
  }

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.hidden = true;
    }
  });

  if (tonePreviewToggle) {
    tonePreviewToggle.addEventListener("change", (e) => {
      tonePreview.style.display = e.target.checked ? "block" : "none";
      localStorage.setItem("percept-tone-preview", e.target.checked);
    });
  }

  if (autosaveToggle) {
    autosaveToggle.addEventListener("change", (e) => {
      localStorage.setItem("percept-autosave", e.target.checked);
    });
  }

  if (liveAnalysisToggle) {
    liveAnalysisToggle.addEventListener("change", (e) => {
      liveAnalysisEnabled = e.target.checked;
      localStorage.setItem("percept-live-analysis", e.target.checked);
    });
  }

  const savedTonePreview =
    localStorage.getItem("percept-tone-preview") !== "false";
  const savedAutosave = localStorage.getItem("percept-autosave") !== "false";
  const savedLiveAnalysis =
    localStorage.getItem("percept-live-analysis") === "true";

  if (tonePreviewToggle) tonePreviewToggle.checked = savedTonePreview;
  if (autosaveToggle) autosaveToggle.checked = savedAutosave;
  if (liveAnalysisToggle) liveAnalysisToggle.checked = savedLiveAnalysis;

  tonePreview.style.display = savedTonePreview ? "block" : "none";
  liveAnalysisEnabled = savedLiveAnalysis;
}

// ─── Undo/Redo buttons ───────────────────────────────────────────────────────
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

function updateUndoRedoState() {
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= feedbackHistory.length - 1;
}

if (undoBtn) {
  undoBtn.addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex--;
      const state = feedbackHistory[historyIndex];
      markupInput.value = state.markup;
      profileSelect.value = state.profile;
      styleToggle.value = state.style;
      setToneHintForSelectedProfile();
      debouncedAnalyze();
      updateUndoRedoState();
    }
  });
}

if (redoBtn) {
  redoBtn.addEventListener("click", () => {
    if (historyIndex < feedbackHistory.length - 1) {
      historyIndex++;
      const state = feedbackHistory[historyIndex];
      markupInput.value = state.markup;
      profileSelect.value = state.profile;
      styleToggle.value = state.style;
      setToneHintForSelectedProfile();
      debouncedAnalyze();
      updateUndoRedoState();
    }
  });
}

updateUndoRedoState();

// ─── Live analysis on input (if enabled) ──────────────────────────────────────
if (markupInput) {
  const liveAnalysisDebounced = debounce(() => {
    if (
      liveAnalysisEnabled &&
      profileSelect.value &&
      markupInput.value.trim()
    ) {
      debouncedAnalyze();
    }
  }, 600);

  markupInput.addEventListener("input", liveAnalysisDebounced);
}
// Card class is determined by two signals in priority order:
//   1. If style toggle is "technical" and a technical field exists → result-warn
//   2. Otherwise → the check's own severity field ("warn" → result-warn,
//      "info" or absent → result-info)
function getMatchDetails(keyword, markup) {
  const variants = getKeywordVariants(keyword);

  for (const variant of variants) {
    const snippetRegex = new RegExp(
      `(.{0,30})(${escapeRegex(variant)})(.{0,30})`,
      "i",
    );
    const attrRegex = new RegExp(`\\b${escapeRegex(variant)}\\s*=`, "i");
    const tagRegex = new RegExp(`<\\s*${escapeRegex(variant)}\\b`, "i");

    const plainMatch = markup.match(snippetRegex);
    if (plainMatch) {
      const snippet = `${plainMatch[1]}${plainMatch[2]}${plainMatch[3]}`.trim();
      return { type: "text", variant, snippet };
    }

    if (attrRegex.test(markup)) {
      const start = markup.search(attrRegex);
      const snippet = markup.slice(Math.max(0, start - 24), start + 40);
      return { type: "attribute", variant, snippet: snippet.trim() };
    }

    if (tagRegex.test(markup)) {
      const start = markup.search(tagRegex);
      const snippet = markup.slice(Math.max(0, start - 24), start + 40);
      return { type: "tag", variant, snippet: snippet.trim() };
    }
  }

  return null;
}

function renderFeedback(checks, markup, style) {
  feedbackBox.innerHTML = "";

  const matched = checks
    .map((check) => {
      if (!check.keyword) return null;
      if (!checkKeywordMatch(check.keyword, markup)) return null;
      const details = getMatchDetails(check.keyword, markup);
      return { check, details };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const severityOrder = { warn: 0, info: 1 };
      const sa = a.check.severity === "warn" ? "warn" : "info";
      const sb = b.check.severity === "warn" ? "warn" : "info";
      return severityOrder[sa] - severityOrder[sb];
    });

  if (matched.length === 0) {
    renderMessage(
      "No profile-specific traits detected in this markup. Try pasting more HTML or explore a different profile.",
      "info",
    );
    return;
  }

  matched.forEach(({ check, details }) => {
    const card = document.createElement("article");
    const isTechnical = style === "technical" && check.technical;
    const severity = isTechnical || check.severity === "warn" ? "warn" : "info";

    card.className = `result-${severity}`;

    const main = document.createElement("p");
    main.textContent = isTechnical ? check.technical : check.message;

    const meta = document.createElement("p");
    meta.className = "result-meta";

    if (details) {
      meta.textContent = `Matched keyword: ${details.variant}. Context: ${details.snippet}`;
    } else {
      meta.textContent = `Matched keyword: ${check.keyword}.`;
    }

    card.appendChild(main);
    card.appendChild(meta);
    feedbackBox.appendChild(card);
  });
}

function loadProfile(profile) {
  if (profileCache.has(profile)) {
    return Promise.resolve(profileCache.get(profile));
  }

  const url = getProfileURL(profile);

  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Profile file not found: ${url}`);
      return res.json();
    })
    .then((data) => {
      profileCache.set(profile, data);
      return data;
    })
    .catch((err) => {
      console.warn(
        `Failed to load profile from disk: ${profile}. Using inline fallback if available.`,
        err,
      );
      const fallback = inlineProfiles[profile];
      if (fallback) {
        profileCache.set(profile, fallback);
        return fallback;
      }
      throw err;
    });
}

function setAnalyzing(isBusy) {
  analyzeBtn.disabled = isBusy;
  if (isBusy) {
    loadingIndicator.hidden = false;
    analyzeBtn.dataset.originalText = analyzeBtn.textContent;
    analyzeBtn.textContent = "Analyzing…";
  } else {
    loadingIndicator.hidden = true;
    analyzeBtn.textContent = analyzeBtn.dataset.originalText || "Analyze";
  }
}

// ─── Main analyze handler with debouncing ─────────────────────────────────
const debouncedAnalyze = debounce(() => {
  const profile = profileSelect.value;
  const markup = normalizeMarkup(markupInput.value);
  const style = styleToggle.value;

  if (!profile || !markup) {
    renderMessage(
      "Please select a profile and paste HTML to continue.",
      "info",
    );
    return;
  }

  setAnalyzing(true);

  loadProfile(profile)
    .then((profileData) => {
      const checks = profileData.checks || [];
      renderFeedback(checks, markup, style);
      feedbackBox.focus();

      // Store feedback state in history
      addToHistory({
        markup,
        profile,
        style,
        timestamp: new Date().toISOString(),
      });
    })
    .catch((err) => {
      console.error(err);
      renderMessage(
        "Error loading profile data. Please check the file path or profile name.",
        "warn",
      );
    })
    .finally(() => {
      setAnalyzing(false);
    });
}, DEBOUNCE_DELAY);

analyzeBtn.addEventListener("click", debouncedAnalyze);

// ─── Keyboard shortcuts ────────────────────────────────────────────────────
document.addEventListener("keydown", (event) => {
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const modKey = isMac ? event.metaKey : event.ctrlKey;

  if (modKey && event.key === "Enter") {
    event.preventDefault();
    analyzeBtn.click();
  }

  if (modKey && event.shiftKey && event.key === "C") {
    event.preventDefault();
    copyBtn.click();
  }

  if (modKey && event.key === "z") {
    event.preventDefault();
    undoBtn?.click();
  }

  if (modKey && event.key === "y") {
    event.preventDefault();
    redoBtn?.click();
  }

  if (event.key === "Escape") {
    feedbackBox.innerHTML = "";
    markupInput.focus();
  }
});

// ─── Session persistence ───────────────────────────────────────────────────
function saveSessionState() {
  localStorage.setItem("percept-markup", markupInput.value);
  localStorage.setItem("percept-profile", profileSelect.value);
  localStorage.setItem("percept-style", styleToggle.value);
}

function restoreSessionState() {
  const savedMarkup = localStorage.getItem("percept-markup");
  const savedProfile = localStorage.getItem("percept-profile");
  const savedStyle = localStorage.getItem("percept-style");

  if (savedMarkup) markupInput.value = savedMarkup;
  if (savedProfile) profileSelect.value = savedProfile;
  if (savedStyle) styleToggle.value = savedStyle;

  setToneHintForSelectedProfile();
}

markupInput.addEventListener("input", saveSessionState);
profileSelect.addEventListener("change", saveSessionState);
styleToggle.addEventListener("change", saveSessionState);

restoreSessionState();
