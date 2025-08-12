// percept.js

// Caches profile data after first load
const profileStore = {
  loaded: false,
  data: {},
};

const PROFILE_KEY = "percept.profileId";
const STYLE_KEY = "percept.style";

async function loadProfiles() {
  if (profileStore.loaded) return profileStore.data;

  // Fetch each JSON; if one fails, keep going and log the error
  const files = [
    ["adhd", "profiles/adhd.json"],
    ["screenreader", "profiles/screenreader.json"],
    ["lowvision", "profiles/lowvision.json"],
    ["dyslexia", "profiles/dyslexia.json"],
    ["motor", "profiles/motor.json"],
  ];

  const entries = await Promise.all(
    files.map(async ([key, path]) => {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return [key, json];
      } catch (e) {
        console.error(`Failed to load ${path}:`, e);
        return [key, { name: key, checks: [] }]; // graceful fallback
      }
    })
  );

  profileStore.data = Object.fromEntries(entries);
  profileStore.loaded = true;
  return profileStore.data;
}

// Tone preview
function updateTonePreview(tone) {
  const tonePreview = document.getElementById("tone-preview");
  tonePreview.textContent = tone ? `Tone: ${tone}` : "";
}

// Validate inputs before feedback generation
function validateInputs(profileEl, markup) {
  const profile = profileEl?.value?.trim();
  if (!profile) {
    alert("Please select a profile.");
    return false;
  }
  if (!markup || !markup.trim()) {
    alert("Please paste some HTML to analyze.");
    return false;
  }
  return true;
}

// Analyze markup using selected profile + style (tone vs technical)
function analyzeMarkup(markup, checks, style) {
  const hits = [];

  // Simple keyword matching; can be upgraded to regex per check later
  for (const check of checks) {
    if (!check?.keyword) continue;
    if (markup.includes(check.keyword)) {
      const piece =
        style === "technical" && check.technical
          ? `• ${check.technical}`
          : `• ${
              check.message ||
              check.technical ||
              "Consider revising this pattern."
            }`;
      hits.push(piece);
    }
  }

  if (hits.length === 0) {
    return "No issues found for the selected profile.";
  }

  return hits.join("\n");
}

// Display feedback
function displayFeedback(text) {
  const out = document.getElementById("feedback-output");
  out.textContent = text;
}

// MAIN: wire up UI
async function main() {
  // Preload profiles
  await loadProfiles();

  const profileEl = document.getElementById("profile");
  const markupEl = document.getElementById("markup");
  const analyzeBtn = document.getElementById("analyze");
  const styleToggle = document.getElementById("style-toggle");
  const copyBtn = document.getElementById("copy-feedback");

  // Restore previous selections
  const savedProfile = loadProfileId();
  if (savedProfile) {
    const hasOption = [...profileEl.options].some(
      (o) => o.value === savedProfile
    );
    if (hasOption) {
      profileEl.value = savedProfile;
      const opt = profileEl.options[profileEl.selectedIndex];
      updateTonePreview(opt?.dataset?.tone || "");
    } else {
      saveProfileId("");
      updateTonePreview();
    }
  }

  const savedStyle = loadStyle();
  styleToggle.value = savedStyle;

  styleToggle.addEventListener("change", () => {
    saveStyle(styleToggle.value);
  });

  // Update tone preview on profile change
  profileEl.addEventListener("change", (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    const tone = opt?.dataset?.tone || "";
    updateTonePreview(tone);

    // NEW: save selection
    saveProfileId(e.target.value);
  });

  // Generate feedback on click
  analyzeBtn.addEventListener("click", async () => {
    const markup = markupEl.value;
    if (!validateInputs(profileEl, markup)) return;

    try {
      const style = styleToggle.value; // "tone" or "technical"
      const profiles = await loadProfiles();
      const key = profileEl.value;
      const checks = profiles[key]?.checks || [];

      const feedback = analyzeMarkup(markup, checks, style);
      displayFeedback(feedback);
    } catch (err) {
      console.error("Error generating feedback:", err);
      alert(
        "An error occurred while generating feedback. Check the console for details."
      );
    }
    styleToggle.dispatchEvent(new Event("change"));
  });

  // Copy feedback
  copyBtn.addEventListener("click", async () => {
    const text = document.getElementById("feedback-output").textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy Feedback"), 1200);
    } catch {
      alert("Could not copy to clipboard.");
    }
  });
}

function saveProfileId(id) {
  try {
    localStorage.setItem(PROFILE_KEY, id);
  } catch {}
}
function loadProfileId() {
  try {
    return localStorage.getItem(PROFILE_KEY) || "";
  } catch {
    return "";
  }
}
function saveStyle(val) {
  try {
    localStorage.setItem(STYLE_KEY, val);
  } catch {}
}
function loadStyle() {
  try {
    return localStorage.getItem(STYLE_KEY) || "tone";
  } catch {
    return "tone";
  }
}

// Kick off
document.addEventListener("DOMContentLoaded", main);
