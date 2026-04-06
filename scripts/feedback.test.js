import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderFeedback, renderMessage } from "./feedback.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const feedbackBox = document.getElementById("feedback-output");

function clearFeedback() {
  feedbackBox.innerHTML = "";
}

// ─── renderFeedback — keyword path ────────────────────────────────────────────

describe("renderFeedback — keyword path", () => {
  beforeEach(clearFeedback);

  it("renders a card when a keyword matches", () => {
    renderFeedback(
      [{ keyword: "autoplay", message: "Autoplay is jarring.", severity: "warn" }],
      "<video autoplay></video>",
      "emotional",
    );
    const cards = feedbackBox.querySelectorAll("article");
    expect(cards.length).toBe(1);
  });

  it("renders no cards and a message when nothing matches", () => {
    renderFeedback(
      [{ keyword: "autoplay", message: "Autoplay is jarring.", severity: "warn" }],
      "<video controls></video>",
      "emotional",
    );
    expect(feedbackBox.querySelectorAll("article").length).toBe(0);
    expect(feedbackBox.querySelector("p")?.textContent).toMatch(/no profile-specific/i);
  });

  it("card has result-warn class for severity warn", () => {
    renderFeedback(
      [{ keyword: "autoplay", message: "Bad.", severity: "warn" }],
      "<video autoplay>",
      "emotional",
    );
    expect(feedbackBox.querySelector("article").classList.contains("result-warn")).toBe(true);
  });

  it("card has result-info class for severity info", () => {
    renderFeedback(
      [{ keyword: "autoplay", message: "Note.", severity: "info" }],
      "<video autoplay>",
      "emotional",
    );
    expect(feedbackBox.querySelector("article").classList.contains("result-info")).toBe(true);
  });

  it("shows technical text when style is technical and technical field exists", () => {
    renderFeedback(
      [{ keyword: "autoplay", message: "Human message.", technical: "Technical fix.", severity: "info" }],
      "<video autoplay>",
      "technical",
    );
    expect(feedbackBox.querySelector(".result-message").textContent).toBe("Technical fix.");
  });

  it("shows message text when style is emotional", () => {
    renderFeedback(
      [{ keyword: "autoplay", message: "Human message.", technical: "Technical fix.", severity: "info" }],
      "<video autoplay>",
      "emotional",
    );
    expect(feedbackBox.querySelector(".result-message").textContent).toBe("Human message.");
  });
});

// ─── renderFeedback — pattern path ───────────────────────────────────────────

describe("renderFeedback — pattern path", () => {
  beforeEach(clearFeedback);

  it("renders a card when a pattern matches", () => {
    renderFeedback(
      [{
        pattern: "<img\\b(?![^>]*\\balt\\s*=)[^>]*>",
        message: "Image missing alt.",
        severity: "warn",
      }],
      '<img src="photo.jpg">',
      "emotional",
    );
    const cards = feedbackBox.querySelectorAll("article");
    expect(cards.length).toBe(1);
    expect(cards[0].classList.contains("result-warn")).toBe(true);
  });

  it("renders no card when a pattern does not match", () => {
    renderFeedback(
      [{
        pattern: "<img\\b(?![^>]*\\balt\\s*=)[^>]*>",
        message: "Image missing alt.",
        severity: "warn",
      }],
      '<img src="photo.jpg" alt="A sunset">',
      "emotional",
    );
    expect(feedbackBox.querySelectorAll("article").length).toBe(0);
  });

  it("does not throw on an invalid pattern — silently skips the check", () => {
    expect(() => {
      renderFeedback(
        [{ pattern: "[invalid", message: "Bad regex.", severity: "warn" }],
        "<img src='x'>",
        "emotional",
      );
    }).not.toThrow();
    // Invalid pattern is skipped; no card rendered
    expect(feedbackBox.querySelectorAll("article").length).toBe(0);
  });
});

// ─── renderFeedback — severity sort order ────────────────────────────────────

describe("renderFeedback — severity sort order", () => {
  beforeEach(clearFeedback);

  it("renders warn cards before info cards", () => {
    renderFeedback(
      [
        { keyword: "tooltip", message: "Info note.", severity: "info" },
        { keyword: "autoplay", message: "Warn message.", severity: "warn" },
      ],
      "<video autoplay> <span class='tooltip'>",
      "emotional",
    );
    const cards = Array.from(feedbackBox.querySelectorAll("article"));
    expect(cards.length).toBe(2);
    expect(cards[0].classList.contains("result-warn")).toBe(true);
    expect(cards[1].classList.contains("result-info")).toBe(true);
  });
});

// ─── CSV export column order ──────────────────────────────────────────────────

describe("CSV export column order", () => {
  beforeEach(clearFeedback);

  it("puts message text in the Message/Technical column and match context in Match Context column", async () => {
    // Render a known card first
    renderFeedback(
      [{ keyword: "autoplay", message: "Autoplay is jarring.", severity: "warn" }],
      "<video autoplay></video>",
      "emotional",
    );

    // Capture the Blob passed to URL.createObjectURL
    let capturedCsv = "";
    vi.stubGlobal("URL", {
      createObjectURL: (blob) => {
        const reader = new FileReader();
        reader.onload = () => { capturedCsv = reader.result; };
        reader.readAsText(blob);
        return "blob:fake";
      },
      revokeObjectURL: () => {},
    });

    // Prevent the <a> click from navigating
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === "a") el.click = () => {};
      return el;
    });

    const exportCsvBtn = document.getElementById("export-csv");
    exportCsvBtn.click();

    // Give FileReader a tick to resolve
    await new Promise((r) => setTimeout(r, 50));

    vi.restoreAllMocks();
    vi.unstubAllGlobals();

    // Column headers must be correctly labelled (they are quoted in the output)
    expect(capturedCsv).toMatch(/"Message\/Technical","Match Context","Severity","Type"/);

    // The message must appear in the first data column
    const dataLine = capturedCsv.split("\n").find((l) => l.includes("Autoplay is jarring."));
    expect(dataLine).toBeTruthy();
    const cols = dataLine.match(/"((?:[^"]|"")*)"/g);
    expect(cols[0]).toContain("Autoplay is jarring.");

    // The match context must appear in the second data column
    expect(cols[1]).toMatch(/autoplay/i);
  });
});
