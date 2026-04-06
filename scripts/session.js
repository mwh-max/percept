// ─── History, settings panel, and session persistence ────────────────────────

const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
const tonePreviewEl = document.getElementById("tone-preview");
const tonePreviewToggle = document.getElementById("tone-preview-toggle");
const autosaveToggle = document.getElementById("autosave-toggle");
const liveAnalysisToggle = document.getElementById("live-analysis-toggle");
const markupInput = document.getElementById("markup");
const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");

// ─── Undo / redo history ──────────────────────────────────────────────────────

const feedbackHistory = [];
let historyIndex = -1;

export function addToHistory(state) {
  if (historyIndex < feedbackHistory.length - 1) {
    feedbackHistory.splice(historyIndex + 1);
  }
  feedbackHistory.push(state);
  historyIndex = feedbackHistory.length - 1;
  updateUndoRedoState();
}

// Returns the restored state object, or null if there is nothing to undo.
export function undo() {
  if (historyIndex <= 0) return null;
  historyIndex--;
  updateUndoRedoState();
  return feedbackHistory[historyIndex];
}

// Returns the restored state object, or null if there is nothing to redo.
export function redo() {
  if (historyIndex >= feedbackHistory.length - 1) return null;
  historyIndex++;
  updateUndoRedoState();
  return feedbackHistory[historyIndex];
}

function updateUndoRedoState() {
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= feedbackHistory.length - 1;
}

// ─── Live analysis flag ───────────────────────────────────────────────────────

export let liveAnalysisEnabled = false;

// ─── Settings panel ───────────────────────────────────────────────────────────

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function openSettings() {
  settingsModal.hidden = false;
  const first = settingsModal.querySelector(FOCUSABLE);
  if (first) first.focus();
}

function closeSettings() {
  settingsModal.hidden = true;
  settingsBtn.focus();
}

export function initSettings() {
  if (!settingsBtn || !settingsModal) return;

  settingsBtn.addEventListener("click", openSettings);

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", closeSettings);
  }

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  settingsModal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeSettings();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(settingsModal.querySelectorAll(FOCUSABLE));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (tonePreviewToggle) {
    tonePreviewToggle.addEventListener("change", (e) => {
      tonePreviewEl.style.display = e.target.checked ? "block" : "none";
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

  const savedTonePreview = localStorage.getItem("percept-tone-preview") !== "false";
  const savedAutosave = localStorage.getItem("percept-autosave") !== "false";
  const savedLiveAnalysis = localStorage.getItem("percept-live-analysis") === "true";

  if (tonePreviewToggle) tonePreviewToggle.checked = savedTonePreview;
  if (autosaveToggle) autosaveToggle.checked = savedAutosave;
  if (liveAnalysisToggle) liveAnalysisToggle.checked = savedLiveAnalysis;

  tonePreviewEl.style.display = savedTonePreview ? "block" : "none";
  liveAnalysisEnabled = savedLiveAnalysis;
}

// ─── Session persistence ──────────────────────────────────────────────────────

export function saveSessionState() {
  if (localStorage.getItem("percept-autosave") === "false") return;
  localStorage.setItem("percept-markup", markupInput.value);
  localStorage.setItem("percept-profile", profileSelect.value);
  localStorage.setItem("percept-style", styleToggle.value);
}

export function restoreSessionState() {
  const savedMarkup = localStorage.getItem("percept-markup");
  const savedProfile = localStorage.getItem("percept-profile");
  const savedStyle = localStorage.getItem("percept-style");

  if (savedMarkup) markupInput.value = savedMarkup;
  if (savedProfile) {
    profileSelect.value = savedProfile;
    // If the value wasn't found in the options (e.g. a stale custom-* id),
    // the select resets to empty — clear storage to avoid a confusing state.
    if (profileSelect.value !== savedProfile) {
      localStorage.removeItem("percept-profile");
    }
  }
  if (savedStyle) styleToggle.value = savedStyle;
}

updateUndoRedoState();
