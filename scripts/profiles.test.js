/**
 * Sync validation: every built-in profile exists in two places —
 * profiles/<name>.json (authoritative) and the inlineProfiles fallback
 * in profiles.js (offline/file:// safety net). This test asserts they
 * stay in sync so a contributor editing a JSON file doesn't silently
 * leave the inline copy stale.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { inlineProfiles } from "./profiles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const profilesDir = resolve(__dirname, "../profiles");

// Derive the inline key from a filename: "adhd.json" → "adhd"
function keyFromFilename(filename) {
  return filename.replace(/\.json$/, "");
}

describe("inline profile fallback sync", () => {
  const jsonFiles = readdirSync(profilesDir).filter((f) => f.endsWith(".json"));

  it("has an inline fallback entry for every JSON file", () => {
    const missingKeys = jsonFiles
      .map(keyFromFilename)
      .filter((key) => !(key in inlineProfiles));

    expect(missingKeys).toEqual([]);
  });

  it("has a JSON file for every inline fallback entry", () => {
    const jsonKeys = new Set(jsonFiles.map(keyFromFilename));
    const extraInlineKeys = Object.keys(inlineProfiles).filter(
      (key) => !jsonKeys.has(key),
    );
    expect(extraInlineKeys).toEqual([]);
  });

  jsonFiles.forEach((filename) => {
    const key = keyFromFilename(filename);

    describe(`profile: ${key}`, () => {
      const jsonPath = resolve(profilesDir, filename);
      const jsonProfile = JSON.parse(readFileSync(jsonPath, "utf8"));
      const inlineProfile = inlineProfiles[key];

      it("inline name matches JSON name", () => {
        expect(inlineProfile?.name).toBe(jsonProfile.name);
      });

      it("inline tone matches JSON tone", () => {
        expect(inlineProfile?.tone).toBe(jsonProfile.tone);
      });

      it("inline check count matches JSON check count", () => {
        expect(inlineProfile?.checks?.length).toBe(jsonProfile.checks?.length);
      });

      it("every JSON check keyword/pattern exists in the inline copy", () => {
        const inlineIdentifiers = (inlineProfile?.checks ?? []).map(
          (c) => c.keyword ?? c.pattern,
        );
        const mismatches = (jsonProfile.checks ?? []).filter((jsonCheck) => {
          const id = jsonCheck.keyword ?? jsonCheck.pattern;
          return !inlineIdentifiers.includes(id);
        });
        expect(mismatches).toEqual([]);
      });
    });
  });
});
