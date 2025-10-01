/**
 * Percept — cleaned core logic (no duplicate listeners; robust JSON loading)
 * - Wires: #profile, #markup, #feedback-output, #copy-feedback
 * - Lazy-loads profile JSON once (with cache + in-flight request dedupe)
 * - Validates inputs; graceful errors; ARIA-friendly updates
 */

(() => {
  /** @type {Record<string, string>} */
  const PROFILE_FILES = {
    adhd: "adhd.json",
    screenreader: "screenreader.json",
    lowvision: "lowvision.json",
    dyslexia: "dyslexia.json",
    motor: "motor.json",
    // blinduser: "blinduser.json", // add when you have checks ready
  };

  /** Cache loaded JSON once fetched */
  const profileCache = new Map();
  /** Track in-flight fetches to prevent duplicate requests */
  const inflight = new Map();

  // ------- DOM lookups (single pass) -------
  const $profile = document.getElementById("profile");
  const $markup = document.getElementById("markup");
  const $feedback = document.getElementById("feedback-output");
  const $tone = document.getElementById("tone-preview");
  const $copyBtn = document.getElementById("copy-feedback");

  // ------- Utilities -------
  const setTone = (tone) => {
    if (!$tone) return;
    $tone.textContent = tone ? `Tone: ${tone}` : "";
  };

  const setFeedback = (text) => {
    if (!$feedback) return;
    $feedback.textContent = text;
  };

  const getSelectedTone = () => {
    if (!$profile) return "";
    const opt = $profile.options[$profile.selectedIndex];
    return opt?.dataset?.tone || "";
  };

  const validateInputs = () => {
    if (!$profile || !$markup) return false;
    const val = $profile.value?.trim();
    const txt = $markup.value?.trim();
    let problems = [];
    if (!val) problems.push("Choose a profile.");
    if (!txt) problems.push("Paste or type your prompt/markup.");
    if (problems.length) {
      setFeedback(problems.join(" "));
      return false;
    }
    return true;
  };

  /**
   * Fetch and cache checks for a profile key.
   * @param {string} key
   * @returns {Promise<Array<{keyword:string,message:string,technical?:string}>>}
   */
  const loadProfileChecks = async (key) => {
    const path = PROFILE_FILES[key];
    if (!path) return [];

    if (profileCache.has(key)) return profileCache.get(key);

    // prevent duplicate fetches
    if (inflight.has(key)) return inflight.get(key);

    const p = fetch(path, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        const json = await res.json();
        const arr = Array.isArray(json?.checks) ? json.checks : [];
        profileCache.set(key, arr);
        inflight.delete(key);
        return arr;
      })
      .catch((err) => {
        inflight.delete(key);
        console.error(err);
        return [];
      });

    inflight.set(key, p);
    return p;
  };

  /**
   * Run simple keyword checks against the user's text.
   * @param {string} text
   * @param {Array<{keyword:string,message:string,technical?:string}>} checks
   * @returns {string}
   */
  const analyze = (text, checks) => {
    if (!checks.length) {
      return "No profile-specific checks available yet.";
    }

    const hits = [];
    for (const chk of checks) {
      if (!chk?.keyword || !chk?.message) continue;
      if (text.toLowerCase().includes(chk.keyword.toLowerCase())) {
        const tech = chk.technical ? `\n  • ${chk.technical}` : "";
        hits.push(`Tip: ${chk.message}${tech}`);
      }
    }

    if (!hits.length) return "No issues found for the selected profile.";
    return hits.join("\n\n");
  };

  // ------- Event handlers -------
  const handleProfileChange = async () => {
    if (!$profile) return;
    setTone(getSelectedTone());

    if (!$markup?.value?.trim()) {
      // Don’t force-run analysis if user hasn’t entered text yet.
      return;
    }
    await runAnalysis();
  };

  const runAnalysis = async () => {
    if (!validateInputs()) return;

    const key = $profile.value.trim();
    const text = $markup.value.trim();

    setFeedback("Analyzing…");
    const checks = await loadProfileChecks(key);
    const result = analyze(text, checks);
    setFeedback(result);
  };

  const copyFeedbackToClipboard = async () => {
    if (!$feedback) return;
    const txt = $feedback.textContent || "";
    if (!txt.trim()) return;

    try {
      await navigator.clipboard.writeText(txt);
      flashCopyState("Copied!");
    } catch {
      // Fallback: select a hidden textarea and copy
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        flashCopyState("Copied!");
      } catch (e) {
        console.error("Copy failed:", e);
        flashCopyState("Copy failed");
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const flashCopyState = (label) => {
    if (!$copyBtn) return;
    const prev = $copyBtn.textContent;
    $copyBtn.textContent = label;
    $copyBtn.setAttribute("aria-live", "polite");
    setTimeout(() => {
      $copyBtn.textContent = prev || "Copy Feedback";
    }, 1200);
  };

  // ------- Wire up once DOM is ready -------
  window.addEventListener("DOMContentLoaded", () => {
    if ($profile) $profile.addEventListener("change", handleProfileChange);
    if ($markup) $markup.addEventListener("input", () => setFeedback("")); // clear stale output as user types
    const analyzeBtn = document.getElementById("analyze"); // optional button, if you add one later
    if (analyzeBtn) analyzeBtn.addEventListener("click", runAnalysis);
    if ($copyBtn) $copyBtn.addEventListener("click", copyFeedbackToClipboard);

    // Initialize tone preview if a profile is preselected
    setTone(getSelectedTone());
  });
})();
