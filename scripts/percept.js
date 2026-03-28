// ─── Element references ────────────────────────────────────────────────────
const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");
const markupInput = document.getElementById("markup");
const feedbackBox = document.getElementById("feedback-output");
const tonePreview = document.getElementById("tone-preview");
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
function renderFeedback(checks, markup, style) {
  feedbackBox.innerHTML = "";

  const matched = checks.filter((check) => {
    if (!check.keyword) return false;
    const keyword = check.keyword.toLowerCase().trim();
    const regex = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    return regex.test(markup);
  });

  if (matched.length === 0) {
    renderMessage(
      "No profile-specific traits detected in this markup. Try pasting more HTML or explore a different profile.",
      "info",
    );
    return;
  }

  matched.forEach((check) => {
    const card = document.createElement("p");
    const isTechnical = style === "technical" && check.technical;

    if (isTechnical) {
      card.className = "result-warn";
      card.textContent = check.technical;
    } else {
      card.className =
        check.severity === "warn" ? "result-warn" : "result-info";
      card.textContent = check.message;
    }

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
    });
});
