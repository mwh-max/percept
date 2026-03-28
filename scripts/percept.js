// ─── Element references ────────────────────────────────────────────────────
const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");
const markupInput = document.getElementById("markup");
const feedbackBox = document.getElementById("feedback-output");
const tonePreview = document.getElementById("tone-preview");
const loadingIndicator = document.getElementById("loading-indicator");
const analyzeBtn = document.getElementById("analyze");
const copyBtn = document.getElementById("copy-feedback");

// ─── Shared helpers ────────────────────────────────────────────────────────
const profileCache = new Map();

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

function renderMessage(message, severity = "info") {
  feedbackBox.innerHTML = `<p class="result-${severity}">${message}</p>`;
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

// Set initial tone for cases where profile is preselected
setToneHintForSelectedProfile();

// ─── Debounced live analysis as user types ──────────────────────────────────
let debounceTimer;
markupInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => analyzeBtn.click(), 600);
});

// ─── Copy feedback to clipboard ────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  const text = feedbackBox.innerText;

  if (!text.trim()) {
    alert("No feedback to copy yet.");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => alert("Feedback copied to clipboard."))
    .catch(() => alert("Copy failed. Please try again."));
});

// ─── Render feedback as structured HTML cards ───────────────────────────────
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

// ─── Main analyze handler ───────────────────────────────────────────────────
analyzeBtn.addEventListener("click", () => {
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
});
