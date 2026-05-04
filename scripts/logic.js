// ─── Pure logic — no DOM, no side-effects ────────────────────────────────────

export const keywordAliases = {
  modal: ["dialog", "popup", "overlay"],
  autoplay: ["auto-play"],
  animation: ["animate", "transition"],
  marquee: ["ticker", "scroll"],
  infinite: ["infinite-scroll", "infinitescroll"],
  tooltip: ["hint", "help", "aria-describedby"],
  countdown: ["timer", "timeout"],
};

export function validateProfileSchema(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["Profile must be a valid JSON object."];
  }
  if (typeof data.name !== "string" || !data.name.trim()) {
    errors.push('Profile must have a "name" property (non-empty string).');
  }
  if (typeof data.tone !== "string" || !data.tone.trim()) {
    errors.push('Profile must have a "tone" property (non-empty string).');
  }
  if (!Array.isArray(data.checks)) {
    errors.push('Profile must have a "checks" property (array of objects).');
    return errors;
  }
  if (data.checks.length === 0) {
    errors.push("Profile must have at least one check in the checks array.");
  }
  data.checks.forEach((check, idx) => {
    if (!check || typeof check !== "object") {
      errors.push(`Check ${idx}: must be an object.`);
      return;
    }
    const hasKeyword = typeof check.keyword === "string" && check.keyword.trim();
    const hasPattern = typeof check.pattern === "string" && check.pattern.trim();
    if (!hasKeyword && !hasPattern) {
      errors.push(
        `Check ${idx}: must have a "keyword" or "pattern" property (non-empty string).`,
      );
    }
    if (hasPattern) {
      try {
        new RegExp(check.pattern);
      } catch {
        errors.push(`Check ${idx}: "pattern" is not a valid regular expression.`);
      }
    }
    if (typeof check.message !== "string" || !check.message.trim()) {
      errors.push(
        `Check ${idx}: must have a "message" property (non-empty string).`,
      );
    }
    if (
      check.technical !== undefined &&
      (typeof check.technical !== "string" || !check.technical.trim())
    ) {
      errors.push(
        `Check ${idx}: if provided, "technical" must be a non-empty string.`,
      );
    }
    if (!["warn", "info"].includes(check.severity)) {
      errors.push(`Check ${idx}: severity must be "warn" or "info".`);
    }
  });
  return errors;
}

export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function normalizeMarkup(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getKeywordVariants(keyword) {
  const normalized = keyword.toLowerCase().trim();
  const baseVariants = [normalized];
  if (keywordAliases[normalized]) {
    baseVariants.push(...keywordAliases[normalized]);
  }
  return [...new Set(baseVariants)];
}

export function checkKeywordMatch(keyword, markup) {
  const variants = getKeywordVariants(keyword);
  return variants.some((variant) => {
    const plainWord = new RegExp(`\\b${escapeRegex(variant)}\\b`, "i");
    const htmlAttr = new RegExp(`\\b${escapeRegex(variant)}\\s*=`, "i");
    const htmlTag = new RegExp(`<\\s*${escapeRegex(variant)}\\b`, "i");
    return (
      plainWord.test(markup) || htmlAttr.test(markup) || htmlTag.test(markup)
    );
  });
}

// Card class is determined by two signals in priority order:
//   1. If style toggle is "technical" and a technical field exists → result-warn
//   2. Otherwise → the check's own severity field ("warn" → result-warn,
//      "info" or absent → result-info)
export function getMatchDetails(keyword, markup) {
  const variants = getKeywordVariants(keyword);

  for (const variant of variants) {
    const snippetRegex = new RegExp(
      `(.{0,30})(${escapeRegex(variant)})(.{0,30})`,
      "i",
    );
    const attrRegex = new RegExp(`\\b${escapeRegex(variant)}\\s*=`, "i");
    const tagRegex = new RegExp(`<\\s*${escapeRegex(variant)}\\b`, "i");

    const plainMatch = markup.match(snippetRegex);
    if (plainMatch) {
      const snippet = `${plainMatch[1]}${plainMatch[2]}${plainMatch[3]}`.trim();
      return { type: "text", variant, snippet };
    }

    if (attrRegex.test(markup)) {
      const start = markup.search(attrRegex);
      const snippet = markup.slice(Math.max(0, start - 24), start + 40);
      return { type: "attribute", variant, snippet: snippet.trim() };
    }

    if (tagRegex.test(markup)) {
      const start = markup.search(tagRegex);
      const snippet = markup.slice(Math.max(0, start - 24), start + 40);
      return { type: "tag", variant, snippet: snippet.trim() };
    }
  }

  return null;
}
