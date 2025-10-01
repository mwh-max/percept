/**
 * Percept core
 * - Elements: #profile, #tone-preview, #markup, #feedback-output, #copy-feedback
 * - Loads profile JSON (adhd.json, dyslexia.json, screenreader.json, lowvision.json, motor.json)
 * - Runs simple keyword checks against the user's text
 * - Debounced analysis on typing; auto-runs on profile change if text exists
 */

(() => {
  // Map of profile key -> json file
  const PROFILE_FILES = {
    adhd: "adhd.json",
    dyslexia: "dyslexia.json",
    screenreader: "screenreader.json",
    lowvision: "lowvision.json",
    motor: "motor.json",
    // blinduser: "blinduser.json", // add when ready
  };

  // ---- DOM ----
  const $profile = document.getElementById("profile");
  const $tone = document.getElementById("tone-preview");
  const $markup = document.getElementById("markup");
  const $out = document.getElementById("feedback-output");
  const $copy = document.getElementById("copy-feedback");

  // Guard if markup isn’t present in the page yet
  if (!$profile || !$markup || !$out) {
    console.warn("Percept: required elements not found.");
    return;
  }

  // ---- Cache & inflight fetch dedupe ----
  const cache = new Map(); // key -> checks[]
  const inflight = new Map(); // key -> Promise<checks[]>

  // ---- Helpers ----
  const setTone = () => {
    if (!$tone) return;
    const opt = $profile.options[$profile.selectedIndex];
    const tone = opt?.dataset?.tone || "";
    $tone.textContent = tone ? `Tone: ${tone}` : "";
  };

  const setOutput = (text) => {
    $out.textContent = text;
  };

  const validate = () => {
    const problems = [];
    if (!$profile.value?.trim()) problems.push("Choose a profile.");
    if (!$markup.value?.trim())
      problems.push("Paste or type your prompt/markup.");
    if (problems.length) {
      setOutput(problems.join(" "));
      return false;
    }
    return true;
  };

  const loadChecks = async (key) => {
    const path = PROFILE_FILES[key];
    if (!path) return [];

    if (cache.has(key)) return cache.get(key);
    if (inflight.has(key)) return inflight.get(key);

    const p = fetch(path, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        const json = await res.json();
        const checks = Array.isArray(json?.checks) ? json.checks : [];
        cache.set(key, checks);
        inflight.delete(key);
        return checks;
      })
      .catch((err) => {
        console.error(err);
        inflight.delete(key);
        return [];
      });

    inflight.set(key, p);
    return p;
  };

  const analyze = (text, checks) => {
    if (!checks?.length) return "No profile-specific checks available yet.";
    const lower = text.toLowerCase();
    const hits = [];

    for (const c of checks) {
      if (!c?.keyword || !c?.message) continue;
      if (lower.includes(String(c.keyword).toLowerCase())) {
        const tech = c.technical ? `\n  • ${c.technical}` : "";
        hits.push(`Tip: ${c.message}${tech}`);
      }
    }

    if (!hits.length) return "No issues found for the selected profile.";
    return hits.join("\n\n");
  };

  // ---- Debounce for typing ----
  let t = null;
  const debounce = (fn, ms = 300) => {
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const run = async () => {
    if (!validate()) return;
    setOutput("Analyzing…");
    const key = $profile.value.trim();
    const text = $markup.value.trim();
    const checks = await loadChecks(key);
    setOutput(analyze(text, checks));
  };

  const onProfileChange = async () => {
    setTone();
    if ($markup.value.trim()) {
      await run();
    } else {
      setOutput(""); // nothing to analyze yet
    }
  };

  const onCopy = async () => {
    const txt = $out.textContent || "";
    if (!txt.trim()) return;
    try {
      await navigator.clipboard.writeText(txt);
      flashCopy("Copied!");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        flashCopy("Copied!");
      } catch (e) {
        console.error("Copy failed:", e);
        flashCopy("Copy failed");
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const flashCopy = (label) => {
    if (!$copy) return;
    const prev = $copy.textContent;
    $copy.textContent = label || "Copied!";
    $copy.setAttribute("aria-live", "polite");
    setTimeout(() => {
      $copy.textContent = prev || "Copy Feedback";
    }, 1200);
  };

  // ---- Wire up ----
  $profile.addEventListener("change", onProfileChange);
  $markup.addEventListener(
    "input",
    debounce(() => {
      setOutput(""); // clear stale results while typing
      if ($profile.value.trim() && $markup.value.trim()) run();
    }, 350)
  );
  if ($copy) $copy.addEventListener("click", onCopy);

  // Init on load (in case a default profile is selected)
  setTone();
})();
