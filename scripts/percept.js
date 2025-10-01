// percept.js

document.addEventListener("DOMContentLoaded", () => {
  const profileSelect = document.getElementById("profile");
  const markupInput = document.getElementById("markup");
  const feedbackOutput = document.getElementById("feedback-output");
  const tonePreview = document.getElementById("tone-preview");
  const copyButton = document.getElementById("copy-feedback");

  const profiles = {
    adhd: "adhd.json",
    screenreader: "screenreader.json",
    lowvision: "lowvision.json",
    dyslexia: "dyslexia.json",
    motor: "motor.json",
    // blinduser: "blinduser.json", // planned, not yet wired
  };

  let profileCache = {};

  async function loadProfile(profile) {
    if (profileCache[profile]) {
      return profileCache[profile];
    }
    try {
      const response = await fetch(profiles[profile], { cache: "no-store" });
      const data = await response.json();
      profileCache[profile] = data;
      return data;
    } catch (err) {
      console.error(`Error loading ${profile}:`, err);
      return null;
    }
  }

  async function runAnalysis() {
    const profileKey = profileSelect.value.trim();
    const userText = markupInput.value.trim();

    if (!profileKey || !userText) {
      feedbackOutput.textContent =
        "Please select a profile and enter some markup or text.";
      return;
    }

    feedbackOutput.textContent = "Analyzing…";

    const profileData = await loadProfile(profileKey);
    if (!profileData || !Array.isArray(profileData.checks)) {
      feedbackOutput.textContent =
        "No checks available for this profile or failed to load.";
      return;
    }

    let results = [];
    for (const check of profileData.checks) {
      if (
        check.keyword &&
        userText.toLowerCase().includes(check.keyword.toLowerCase())
      ) {
        let msg = `Tip: ${check.message}`;
        if (check.technical) {
          msg += `\n  • ${check.technical}`;
        }
        results.push(msg);
      }
    }

    if (results.length === 0) {
      feedbackOutput.textContent = "No issues found for the selected profile.";
    } else {
      feedbackOutput.textContent = results.join("\n\n");
    }
  }

  async function updateTone() {
    const profileKey = profileSelect.value.trim();
    if (!profileKey) {
      tonePreview.textContent = "";
      return;
    }
    const profileData = await loadProfile(profileKey);
    if (profileData && profileData.tone) {
      tonePreview.textContent = `Tone: ${profileData.tone}`;
    } else {
      tonePreview.textContent = "";
    }
  }

  async function handleProfileChange() {
    await updateTone();
    if (markupInput.value.trim()) {
      runAnalysis();
    }
  }

  async function copyFeedbackToClipboard() {
    const text = feedbackOutput.textContent;
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy Feedback";
      }, 1200);
    } catch (err) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy Feedback";
        }, 1200);
      } catch (err2) {
        console.error("Copy failed:", err2);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  profileSelect.addEventListener("change", handleProfileChange);
  markupInput.addEventListener("input", () => {
    feedbackOutput.textContent = "";
  });
  copyButton.addEventListener("click", copyFeedbackToClipboard);
});
