import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateProfileSchema,
  normalizeMarkup,
  escapeRegex,
  getKeywordVariants,
  checkKeywordMatch,
  getMatchDetails,
  debounce,
} from "./logic.js";

// ─── validateProfileSchema ────────────────────────────────────────────────────

describe("validateProfileSchema", () => {
  const validProfile = {
    name: "Test Profile",
    tone: "calm",
    checks: [
      { keyword: "autoplay", message: "Autoplay is jarring.", severity: "warn" },
    ],
  };

  it("returns no errors for a valid profile", () => {
    expect(validateProfileSchema(validProfile)).toEqual([]);
  });

  it("returns error for null input", () => {
    const errors = validateProfileSchema(null);
    expect(errors).toEqual(["Profile must be a valid JSON object."]);
  });

  it("returns error for non-object input", () => {
    expect(validateProfileSchema("string")).toEqual([
      "Profile must be a valid JSON object.",
    ]);
    expect(validateProfileSchema(42)).toEqual([
      "Profile must be a valid JSON object.",
    ]);
  });

  it("returns error when name is missing", () => {
    const errors = validateProfileSchema({ ...validProfile, name: undefined });
    expect(errors.some((e) => e.includes('"name"'))).toBe(true);
  });

  it("returns error when name is an empty string", () => {
    const errors = validateProfileSchema({ ...validProfile, name: "   " });
    expect(errors.some((e) => e.includes('"name"'))).toBe(true);
  });

  it("returns error when tone is missing", () => {
    const errors = validateProfileSchema({ ...validProfile, tone: undefined });
    expect(errors.some((e) => e.includes('"tone"'))).toBe(true);
  });

  it("returns error when checks is not an array", () => {
    const errors = validateProfileSchema({ ...validProfile, checks: "nope" });
    expect(errors.some((e) => e.includes('"checks"'))).toBe(true);
  });

  it("returns error when checks array is empty", () => {
    const errors = validateProfileSchema({ ...validProfile, checks: [] });
    expect(errors.some((e) => e.includes("at least one check"))).toBe(true);
  });

  it("returns error when a check has neither keyword nor pattern", () => {
    const profile = {
      ...validProfile,
      checks: [{ message: "Something.", severity: "warn" }],
    };
    const errors = validateProfileSchema(profile);
    expect(errors.some((e) => e.includes('"keyword" or "pattern"'))).toBe(true);
  });

  it("returns error when check message is missing", () => {
    const profile = {
      ...validProfile,
      checks: [{ keyword: "autoplay", severity: "warn" }],
    };
    const errors = validateProfileSchema(profile);
    expect(errors.some((e) => e.includes('"message"'))).toBe(true);
  });

  it("returns error for invalid severity value", () => {
    const profile = {
      ...validProfile,
      checks: [{ keyword: "autoplay", message: "Oops.", severity: "error" }],
    };
    const errors = validateProfileSchema(profile);
    expect(errors.some((e) => e.includes("severity"))).toBe(true);
  });

  it('accepts severity "info"', () => {
    const profile = {
      ...validProfile,
      checks: [{ keyword: "autoplay", message: "Oops.", severity: "info" }],
    };
    expect(validateProfileSchema(profile)).toEqual([]);
  });

  it("returns error for an invalid regex pattern", () => {
    const profile = {
      ...validProfile,
      checks: [
        {
          pattern: "[invalid",
          message: "Bad regex.",
          severity: "warn",
        },
      ],
    };
    const errors = validateProfileSchema(profile);
    expect(errors.some((e) => e.includes("valid regular expression"))).toBe(
      true,
    );
  });

  it("accepts a valid regex pattern", () => {
    const profile = {
      ...validProfile,
      checks: [
        {
          pattern: "<img\\b(?![^>]*\\balt\\s*=)[^>]*>",
          message: "Image missing alt.",
          severity: "warn",
        },
      ],
    };
    expect(validateProfileSchema(profile)).toEqual([]);
  });

  it("returns error when technical field is an empty string", () => {
    const profile = {
      ...validProfile,
      checks: [
        {
          keyword: "autoplay",
          message: "Oops.",
          severity: "warn",
          technical: "  ",
        },
      ],
    };
    const errors = validateProfileSchema(profile);
    expect(errors.some((e) => e.includes('"technical"'))).toBe(true);
  });

  it("accepts a non-empty technical field", () => {
    const profile = {
      ...validProfile,
      checks: [
        {
          keyword: "autoplay",
          message: "Oops.",
          severity: "warn",
          technical: "Use prefers-reduced-motion.",
        },
      ],
    };
    expect(validateProfileSchema(profile)).toEqual([]);
  });

  it("collects multiple errors at once", () => {
    const profile = { name: "", tone: "", checks: [{}] };
    const errors = validateProfileSchema(profile);
    expect(errors.length).toBeGreaterThan(1);
  });
});

// ─── normalizeMarkup ──────────────────────────────────────────────────────────

describe("normalizeMarkup", () => {
  it("lowercases the input", () => {
    expect(normalizeMarkup("AUTOPLAY")).toBe("autoplay");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeMarkup("  hello  ")).toBe("hello");
  });

  it("collapses internal whitespace to a single space", () => {
    expect(normalizeMarkup("a  b\t\tc")).toBe("a b c");
  });

  it("handles an already-normalised string", () => {
    expect(normalizeMarkup("hello world")).toBe("hello world");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(normalizeMarkup("   ")).toBe("");
  });
});

// ─── escapeRegex ──────────────────────────────────────────────────────────────

describe("escapeRegex", () => {
  it("escapes dots", () => {
    expect(escapeRegex("a.b")).toBe("a\\.b");
  });

  it("escapes asterisks", () => {
    expect(escapeRegex("a*b")).toBe("a\\*b");
  });

  it("escapes parentheses and brackets", () => {
    expect(escapeRegex("(a)[b]{c}")).toBe("\\(a\\)\\[b\\]\\{c\\}");
  });

  it("escapes pipe and caret", () => {
    expect(escapeRegex("a|b^c")).toBe("a\\|b\\^c");
  });

  it("escapes backslash", () => {
    expect(escapeRegex("a\\b")).toBe("a\\\\b");
  });

  it("leaves plain alphanumeric strings unchanged", () => {
    expect(escapeRegex("hello123")).toBe("hello123");
  });

  it("produces a pattern safe for RegExp constructor", () => {
    const raw = "img[src]";
    const re = new RegExp(escapeRegex(raw));
    expect(re.test("img[src]")).toBe(true);
    expect(re.test("imgXsrcY")).toBe(false);
  });
});

// ─── getKeywordVariants ───────────────────────────────────────────────────────

describe("getKeywordVariants", () => {
  it("returns the keyword itself when there are no aliases", () => {
    expect(getKeywordVariants("autoplay")).toEqual(["autoplay", "auto-play"]);
  });

  it("includes all known aliases for modal", () => {
    const variants = getKeywordVariants("modal");
    expect(variants).toContain("modal");
    expect(variants).toContain("dialog");
    expect(variants).toContain("popup");
    expect(variants).toContain("overlay");
  });

  it("normalises input to lowercase", () => {
    const variants = getKeywordVariants("MODAL");
    expect(variants).toContain("modal");
    expect(variants).toContain("dialog");
  });

  it("trims whitespace from the keyword", () => {
    const variants = getKeywordVariants("  tooltip  ");
    expect(variants).toContain("tooltip");
  });

  it("deduplicates entries", () => {
    const variants = getKeywordVariants("modal");
    const unique = new Set(variants);
    expect(unique.size).toBe(variants.length);
  });

  it("returns only the keyword for a term with no aliases", () => {
    const variants = getKeywordVariants("blinking");
    expect(variants).toEqual(["blinking"]);
  });
});

// ─── checkKeywordMatch ────────────────────────────────────────────────────────

describe("checkKeywordMatch", () => {
  it("matches keyword as a plain word in text", () => {
    expect(checkKeywordMatch("autoplay", "<video autoplay></video>")).toBe(true);
  });

  it("matches keyword as an HTML attribute assignment", () => {
    expect(checkKeywordMatch("autoplay", 'autoplay="true"')).toBe(true);
  });

  it("matches keyword as an HTML tag", () => {
    expect(checkKeywordMatch("marquee", "<marquee>scroll</marquee>")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(checkKeywordMatch("autoplay", "<video AUTOPLAY>")).toBe(true);
  });

  it("does not match a keyword inside another word", () => {
    // "play" should not match in "autoplay" when the keyword is "play" as a word
    // But "autoplay" keyword should not match "playerautoplayextended" as a whole word
    expect(checkKeywordMatch("modal", "removemodal")).toBe(false);
  });

  it("matches via alias when the alias appears in markup", () => {
    // 'modal' has alias 'dialog'
    expect(checkKeywordMatch("modal", "<dialog open>")).toBe(true);
  });

  it("returns false when keyword is not present", () => {
    expect(checkKeywordMatch("autoplay", "<video controls></video>")).toBe(
      false,
    );
  });

  it("matches animation via alias 'animate'", () => {
    expect(checkKeywordMatch("animation", 'class="animate-spin"')).toBe(true);
  });
});

// ─── getMatchDetails ─────────────────────────────────────────────────────────

describe("getMatchDetails", () => {
  it("returns a text match with a snippet", () => {
    const result = getMatchDetails("autoplay", "<video autoplay></video>");
    expect(result).not.toBeNull();
    expect(result.type).toBe("text");
    expect(result.snippet).toContain("autoplay");
  });

  it("returns an attribute match when the keyword is used as an attribute", () => {
    const result = getMatchDetails(
      "autoplay",
      '<video autoplay="true"></video>',
    );
    expect(result).not.toBeNull();
    // could be text or attribute — either way it should include the keyword
    expect(result.snippet).toMatch(/autoplay/i);
  });

  it("returns a tag match for an HTML tag keyword", () => {
    const result = getMatchDetails("marquee", "<marquee>scroll</marquee>");
    expect(result).not.toBeNull();
    expect(result.snippet).toMatch(/marquee/i);
  });

  it("returns null when keyword is not found in markup", () => {
    const result = getMatchDetails("autoplay", "<video controls></video>");
    expect(result).toBeNull();
  });

  it("includes the matched variant in the result", () => {
    const result = getMatchDetails("modal", "<dialog open></dialog>");
    expect(result).not.toBeNull();
    // 'dialog' is an alias of 'modal'
    expect(result.variant).toBe("dialog");
  });

  it("keeps the snippet within a reasonable length", () => {
    const long = "a".repeat(200) + " autoplay " + "b".repeat(200);
    const result = getMatchDetails("autoplay", long);
    expect(result).not.toBeNull();
    // snippet should be much shorter than the full markup
    expect(result.snippet.length).toBeLessThan(100);
  });
});

// ─── debounce ─────────────────────────────────────────────────────────────────

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not call the function immediately", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the function after the delay elapses", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on repeated calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced();
    vi.advanceTimersByTime(100);
    debounced(); // reset
    vi.advanceTimersByTime(100); // only 100ms since last call
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100); // now 200ms since last call
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes arguments through to the wrapped function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced("hello", 42);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("hello", 42);
  });

  it("calls the function only once after a burst of calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    for (let i = 0; i < 10; i++) debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
