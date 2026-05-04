// ─── Entry point — wires modules together ────────────────────────────────────

import { debounce, normalizeMarkup, validateProfileSchema } from "./logic.js";
import { profileCache, loadProfile } from "./profiles.js";
import { showToast, renderMessage, renderFeedback } from "./feedback.js";
import {
  addToHistory,
  undo,
  redo,
  liveAnalysisEnabled,
  initSettings,
  saveSessionState,
  restoreSessionState,
} from "./session.js";

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const DEBOUNCE_DELAY = 300; // ms

// ─── Element references ───────────────────────────────────────────────────────

const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");
const markupInput = document.getElementById("markup");
const feedbackBox = document.getElementById("feedback-output");
const tonePreview = document.getElementById("tone-preview");
const profileUpload = document.getElementById("profile-upload");
const loadingIndicator = document.getElementById("loading-indicator");
const analyzeBtn = document.getElementById("analyze");
const copyBtn = document.getElementById("copy-feedback");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

// ─── Tone hint ────────────────────────────────────────────────────────────────

function setToneHintForSelectedProfile() {
  const selected = profileSelect.options[profileSelect.selectedIndex];
  tonePreview.textContent = selected?.dataset?.tone
    ? `Tone: ${selected.dataset.tone}`
    : "";
}

// ─── Custom profile upload ────────────────────────────────────────────────────

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

profileSelect.addEventListener("change", setToneHintForSelectedProfile);

profileUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    renderMessage(
      `Profile file is too large (${(file.size / 1024).toFixed(1)}KB). Maximum size is ${MAX_FILE_SIZE / 1024}KB.`,
      "warn",
    );
    profileUpload.value = "";
    return;
  }

  if (!file.type.includes("json") && !file.name.endsWith(".json")) {
    renderMessage("Please upload a valid JSON file (.json extension).", "warn");
    profileUpload.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const data = JSON.parse(loadEvent.target.result);
      const validationErrors = validateProfileSchema(data);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid profile format: ${validationErrors.join(" ")}`);
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
    renderMessage("Error reading profile file. Please try another file.", "warn");
    profileUpload.value = "";
  };
  reader.readAsText(file);
});

// ─── Analyze ──────────────────────────────────────────────────────────────────

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

const debouncedAnalyze = debounce(() => {
  const profile = profileSelect.value;
  const markup = normalizeMarkup(markupInput.value);
  const style = styleToggle.value;

  if (!profile || !markup) {
    renderMessage("Please select a profile and paste HTML to continue.", "info");
    return;
  }

  setAnalyzing(true);

  loadProfile(profile)
    .then((profileData) => {
      const checks = profileData.checks || [];
      renderFeedback(checks, markup, style);
      feedbackBox.focus();
      addToHistory({ markup, profile, style, timestamp: new Date().toISOString() });
    })
    .catch((err) => {
      console.error(err);
      renderMessage(
        "Error loading profile data. Please check the file path or profile name.",
        "warn",
      );
    })
    .finally(() => setAnalyzing(false));
}, DEBOUNCE_DELAY);

analyzeBtn.addEventListener("click", debouncedAnalyze);

// ─── Undo / redo ──────────────────────────────────────────────────────────────

function applyHistoryState(state) {
  markupInput.value = state.markup;
  profileSelect.value = state.profile;
  styleToggle.value = state.style;
  setToneHintForSelectedProfile();
  debouncedAnalyze();
}

if (undoBtn) {
  undoBtn.addEventListener("click", () => {
    const state = undo();
    if (state) applyHistoryState(state);
  });
}

if (redoBtn) {
  redoBtn.addEventListener("click", () => {
    const state = redo();
    if (state) applyHistoryState(state);
  });
}

// ─── Live analysis ────────────────────────────────────────────────────────────

if (markupInput) {
  const liveAnalysisDebounced = debounce(() => {
    if (liveAnalysisEnabled && profileSelect.value && markupInput.value.trim()) {
      debouncedAnalyze();
    }
  }, 600);
  markupInput.addEventListener("input", liveAnalysisDebounced);
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

document.addEventListener("keydown", (event) => {
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
  const isMac = /mac|iphone|ipad|ipod/i.test(platform);
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

// ─── Session persistence listeners ───────────────────────────────────────────

markupInput.addEventListener("input", saveSessionState);
profileSelect.addEventListener("change", saveSessionState);
styleToggle.addEventListener("change", saveSessionState);

// ─── Init ─────────────────────────────────────────────────────────────────────

initSettings();
restoreSessionState();
setToneHintForSelectedProfile();
