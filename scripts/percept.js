// -------- Profile data loader (cached) --------
const PROFILE_FILES = {
  adhd: "adhd.json",
  screenreader: "screenreader.json",
  lowvision: "lowvision.json",
  dyslexia: "dyslexia.json",
  motor: "motor.json",
  // blinduser exists but has no checks yet; you can add it later if you add rules:
  // blinduser: 'blinduser.json',
};

const profileCache = new Map();

async function loadProfileData(profileKey) {
  if (!PROFILE_FILES[profileKey]) return null;
  if (profileCache.has(profileKey)) return profileCache.get(profileKey);

  const res = await fetch(PROFILE_FILES[profileKey], { cache: "no-store" });
  if (!res.ok)
    throw new Error(
      `Failed to load ${PROFILE_FILES[profileKey]} (${res.status})`
    );
  const json = await res.json();
  profileCache.set(profileKey, json);
  return json;
}

// -------- UI helpers --------
function $(id) {
  return document.getElementById(id);
}

function updateTonePreviewFromSelect(selectEl) {
  const tone = selectEl.options[selectEl.selectedIndex]?.dataset?.tone || "";
  $("tone-preview").textContent = tone ? `Tone: ${tone}` : "";
}

function getSelectedProfileKey() {
  return $("profile").value || "";
}

function getFeedbackStyle() {
  return $("style-toggle").value === "technical" ? "technical" : "tone";
}

function setFeedback(text) {
  $("feedback-output").textContent = text;
}

// -------- Analysis --------
function analyzeMarkup(markup, profileJson, styleMode) {
  const checks = Array.isArray(profileJson?.checks) ? profileJson.checks : [];
  if (!checks.length) return "No issues found for the selected profile.";

  const haystack = (markup || "").toLowerCase().trim();
  if (!haystack) return "Paste some HTML to analyze.";

  let messages = [];
  for (const check of checks) {
    const needle = String(check.keyword || "").toLowerCase();
    if (!needle) continue;
    if (haystack.includes(needle)) {
      const msg =
        styleMode === "technical"
          ? check.technical || check.message || ""
          : check.message || check.technical || "";
      if (msg) messages.push(`• ${msg}`);
    }
  }

  return messages.length
    ? messages.join("\n")
    : "No issues found for the selected profile.";
}

// -------- Event handlers --------
async function runAnalysis() {
  const profileKey = getSelectedProfileKey();
  const markup = $("markup").value;
  const styleMode = getFeedbackStyle();

  if (!profileKey) {
    setFeedback("Choose a profile first.");
    return;
  }

  try {
    const profileJson = await loadProfileData(profileKey);
    if (!profileJson) {
      setFeedback("No rules found for this profile.");
      return;
    }
    const result = analyzeMarkup(markup, profileJson, styleMode);
    setFeedback(result);
  } catch (err) {
    console.error(err);
    setFeedback("There was a problem loading profile rules. Please try again.");
  }
}

function copyFeedbackToClipboard() {
  const text = $("feedback-output").textContent || "";
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(() => {
    // lightweight “toast” without extra HTML
    const btn = $("copy-feedback");
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = original), 900);
  });
}

// -------- Wire up --------
window.addEventListener("DOMContentLoaded", () => {
  // Keep existing behavior: update tone preview on profile change, and run analysis if there is input
  $("profile").addEventListener("change", (e) => {
    updateTonePreviewFromSelect(e.target);
    // If user already pasted markup, auto-run to show updated guidance
    if ($("markup").value.trim()) runAnalysis();
  });

  $("style-toggle").addEventListener("change", runAnalysis);
  $("analyze").addEventListener("click", runAnalysis);
  $("copy-feedback").addEventListener("click", copyFeedbackToClipboard);

  // Initialize tone preview if a profile is preselected
  updateTonePreviewFromSelect($("profile"));
});
