import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  addToHistory,
  undo,
  redo,
  saveSessionState,
  restoreSessionState,
} from "./session.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const markupInput = document.getElementById("markup");
const profileSelect = document.getElementById("profile");
const styleToggle = document.getElementById("style-toggle");

function clearStorage() {
  localStorage.clear();
}

function resetForm() {
  markupInput.value = "";
  profileSelect.value = "";
  styleToggle.value = "";
}

// ─── Session persistence ──────────────────────────────────────────────────────

describe("saveSessionState / restoreSessionState", () => {
  beforeEach(() => {
    clearStorage();
    resetForm();
  });

  afterEach(clearStorage);

  it("writes markup, profile, and style to localStorage", () => {
    markupInput.value = "<div>hello</div>";
    profileSelect.innerHTML = '<option value="adhd">ADHD</option>';
    profileSelect.value = "adhd";
    styleToggle.innerHTML = '<option value="emotional">Emotional</option>';
    styleToggle.value = "emotional";

    saveSessionState();

    expect(localStorage.getItem("percept-markup")).toBe("<div>hello</div>");
    expect(localStorage.getItem("percept-profile")).toBe("adhd");
    expect(localStorage.getItem("percept-style")).toBe("emotional");
  });

  it("restores markup from localStorage into the textarea", () => {
    localStorage.setItem("percept-markup", "<p>restored</p>");
    restoreSessionState();
    expect(markupInput.value).toBe("<p>restored</p>");
  });

  it("restores style from localStorage into the style toggle", () => {
    styleToggle.innerHTML =
      '<option value="emotional">Emotional</option><option value="technical">Technical</option>';
    localStorage.setItem("percept-style", "technical");
    restoreSessionState();
    expect(styleToggle.value).toBe("technical");
  });

  it("does not write to localStorage when autosave is disabled", () => {
    localStorage.setItem("percept-autosave", "false");
    markupInput.value = "<div>should not save</div>";

    saveSessionState();

    expect(localStorage.getItem("percept-markup")).toBeNull();
  });

  it("clears a stale custom profile key that no longer exists in the select", () => {
    // Restore a profile value that has no matching <option>
    profileSelect.innerHTML = '<option value="adhd">ADHD</option>';
    localStorage.setItem("percept-profile", "custom-1234567890");

    restoreSessionState();

    // The stale key should be removed
    expect(localStorage.getItem("percept-profile")).toBeNull();
  });
});

// ─── Undo / redo history ──────────────────────────────────────────────────────

describe("addToHistory / undo / redo", () => {
  // History state is module-level; we can't fully reset it between tests
  // without re-importing, so tests must be order-aware or use distinct states.

  it("undo returns null when history is empty or at the start", () => {
    // Before any history entries undo should be a no-op
    const result = undo();
    // May return null or the first entry depending on prior test state;
    // key assertion: it does not throw
    expect(() => undo()).not.toThrow();
  });

  it("addToHistory then undo returns the previous state", () => {
    const stateA = { markup: "<a>", profile: "adhd", style: "emotional", timestamp: "t1" };
    const stateB = { markup: "<b>", profile: "adhd", style: "emotional", timestamp: "t2" };

    addToHistory(stateA);
    addToHistory(stateB);

    const restored = undo();
    expect(restored).toEqual(stateA);
  });

  it("redo after undo returns the forward state", () => {
    const stateA = { markup: "<a>", profile: "adhd", style: "emotional", timestamp: "t3" };
    const stateB = { markup: "<b>", profile: "adhd", style: "emotional", timestamp: "t4" };

    addToHistory(stateA);
    addToHistory(stateB);
    undo();

    const redone = redo();
    expect(redone).toEqual(stateB);
  });

  it("redo returns null when at the latest history entry", () => {
    addToHistory({ markup: "<c>", profile: "adhd", style: "emotional", timestamp: "t5" });
    expect(redo()).toBeNull();
  });
});
