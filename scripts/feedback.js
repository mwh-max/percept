// ─── Rendering, toast notifications, and export/copy handlers ────────────────

import { checkKeywordMatch, getMatchDetails } from "./logic.js";

const feedbackBox = document.getElementById("feedback-output");
const toastContainer = document.getElementById("toast-container");
const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");
const copyBtn = document.getElementById("copy-feedback");
const exportJsonBtn = document.getElementById("export-json");
const exportTextBtn = document.getElementById("export-text");
const copyAllBtn = document.getElementById("copy-all-feedback");
const exportCsvBtn = document.getElementById("export-csv");

export function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function renderMessage(message, severity = "info") {
  feedbackBox.innerHTML = "";
  const p = document.createElement("p");
  p.className = `result-${severity}`;
  p.textContent = message;
  feedbackBox.appendChild(p);
}

export function renderFeedback(checks, markup, style) {
  feedbackBox.innerHTML = "";

  const matched = checks
    .map((check) => {
      if (check.pattern) {
        let re;
        try { re = new RegExp(check.pattern); } catch { return null; }
        if (!re.test(markup)) return null;
        const m = markup.match(re);
        const snippet = m ? m[0].slice(0, 60).trim() : "";
        return { check, details: { type: "pattern", variant: check.keyword || "pattern", snippet } };
      }
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

    const label = document.createElement("span");
    label.className = "result-label";
    label.setAttribute("aria-hidden", "false");
    label.textContent = severity === "warn" ? "Warning" : "Note";

    const main = document.createElement("p");
    main.className = "result-message";
    main.textContent = isTechnical ? check.technical : check.message;

    const meta = document.createElement("p");
    meta.className = "result-meta";

    if (details) {
      meta.textContent = `Matched: ${details.variant}. Context: ${details.snippet}`;
    } else {
      meta.textContent = check.keyword ? `Matched keyword: ${check.keyword}.` : "Pattern matched.";
    }

    card.appendChild(label);
    card.appendChild(main);
    card.appendChild(meta);
    feedbackBox.appendChild(card);
  });
}

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

// ─── Copy / Export event listeners ───────────────────────────────────────────

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
  const exportData = { timestamp, profile, style, feedback };
  const filename = `percept-feedback-${profile}-${Date.now()}.json`;
  downloadFile(JSON.stringify(exportData, null, 2), filename, "application/json");
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

if (copyAllBtn) {
  copyAllBtn.addEventListener("click", () => {
    const cards = feedbackBox.querySelectorAll("article");
    if (cards.length === 0) {
      showToast("No feedback to copy yet.", "info");
      return;
    }
    const allText = Array.from(cards).map((card) => card.innerText).join("\n\n---\n\n");
    navigator.clipboard
      .writeText(allText)
      .then(() => showToast("All feedback copied to clipboard.", "success"))
      .catch(() => showToast("Copy failed. Please try again.", "error"));
  });
}

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
      ["Message/Technical", "Match Context", "Severity", "Type"],
      ...Array.from(cards).map((card) => {
        const message = card.querySelector(".result-message")?.textContent || "";
        const meta = card.querySelector(".result-meta")?.textContent || "";
        const severity = card.classList.contains("result-warn") ? "warn" : "info";
        return [message, meta, severity, "feedback"];
      }),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const header = `Profile,Style,Timestamp\n"${profile}","${styleToggle.value}","${timestamp}"\n\n${csv}`;
    const filename = `percept-feedback-${profile}-${Date.now()}.csv`;
    downloadFile(header, filename, "text/csv");
  });
}
