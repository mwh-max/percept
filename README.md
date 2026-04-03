Percept – Accessibility Prompt Feedback Tool

Percept helps people with disabilities and neurodivergent users understand how websites and prompts _feel_ through user-centered feedback. Select a disability or neurodivergent profile, paste HTML or a prompt, and get advice shaped by the lived experience of that community—not compliance checklists.

**This is a lived-experience tool, not a compliance auditor.** For a comprehensive accessibility check, use it alongside WCAG validators like [axe](https://www.deque.com/axe/), [WAVE](https://wave.webaim.org/), or [Lighthouse](https://developers.google.com/web/tools/lighthouse).

What Percept Is & Isn't

**Percept is:**

- A feedback tool for understanding how people with ADHD, dyslexia, blindness, low vision, motor disabilities, screenreader users, deaf and hard of hearing users, and photosensitive users experience your website or interface
- Designed to shift perspective from "audit pass/fail" to "how does this feel?"
- A starting point for empathy-driven design decisions
- Extensible: you can upload custom profiles for your own user research

**Percept is not:**

- A comprehensive 508 or WCAG 2.1 AA audit tool (use axe, WAVE, or automated scanners for that)
- A replacement for accessibility testing with real users from disabled communities
- A compliance checker (though many findings align with WCAG criteria)
- Disability representation for communities not yet in the tool

If your primary need is compliance scoring, automated scanning, or support for disabilities not yet profiled in Percept, please use complementary tools listed below.

Purpose and Audience

Percept is designed for anyone who wants AI output to be more usable and inclusive. It is aimed at people who face cognitive, sensory, or physical barriers that can be amplified by unclear prompts or inaccessible layouts. The goal is to make the technology work for the user, not the other way around.

How It Works

Select a user experience profile from the dropdown. Options include ADHD, dyslexia, screenreader user, low vision, motor disability, blind user, deaf or hard of hearing, and photosensitive or seizure-prone.

Choose a feedback style. Emotional Tone offers narrative, human-centered guidance. Technical provides implementation-specific recommendations.

Paste HTML or write a plain text prompt into the input field and click Analyze. Feedback appears as cards in the panel to the right. Each card carries a visible, screen-reader-announced label rendered as real DOM text: **Warning** cards highlight patterns that are likely to cause barriers; **Note** cards surface considerations worth reviewing. Cards are also distinguished by border weight and color.

A tone preview appears beneath the profile selector to give a sense of the experiential lens being applied before feedback is generated.

**Keyboard shortcuts:** Ctrl/Cmd+Enter to analyze · Ctrl/Cmd+Shift+C to copy · Ctrl/Cmd+Z / Y to undo/redo · Esc to clear results.

Use Copy Feedback or Copy All to copy results to your clipboard. Export as JSON, text, or CSV for use in reports or handoffs.

Profiles

Each profile reflects a distinct set of interaction patterns and barriers. Feedback is matched to keywords and patterns found in the pasted markup or prompt.

Person with ADHD. Feedback addresses attention capture, pacing, visual noise, and executive function demands such as disappearing labels, autoplaying media, and timed interactions.

Person with dyslexia. Feedback addresses font choice, line spacing, text alignment, and structural clarity that affect decoding and reading rhythm.

Screenreader user. Feedback addresses alt text, heading order, ARIA roles, and tab focus behavior as they affect linear, audio-based navigation.

Person with low vision. Feedback addresses color contrast, font sizing, and zoom behavior.

Person with a motor disability. Feedback addresses touch target size, hover-only interactions, and drag-and-drop patterns that require fine motor precision.

Blind user. Feedback distinguishes two alt-text failure modes: images with no alt attribute at all (flagged as a warning — the most serious case) and images where an alt attribute is present but the value may need quality review (flagged as informational). It also covers form labeling, table headers, SVG descriptions, iframe titles, and aria-hidden misuse.

Deaf or hard of hearing user. Feedback addresses video captions, audio transcripts, sound-based alerts, and notification patterns that rely on audio alone.

Photosensitive or seizure-prone user. Feedback addresses flashing content, rapid animations, high-contrast transitions, autoplay, and strobe effects that can trigger seizures.

Other Disabilities

Percept currently covers eight profiles based on community input and design priority. Other disabilities exist and matter. If you represent or advocate for a community not yet included:

- **Upload a custom profile**: Use the file upload feature to test your own profile JSON in a session.
- **Contribute a profile**: Open a GitHub issue or PR with your profile data and description. We welcome profiles for vestibular disorders, cognitive load sensitivity, autism, and others.

Complementary Tools

Percept works best alongside these tools:

- [axe DevTools](https://www.deque.com/axe/devtools/): Automated accessibility scanning for WCAG violations
- [WAVE Browser Extension](https://wave.webaim.org/extension/): Visual feedback on accessibility and structure
- [Lighthouse](https://developers.google.com/web/tools/lighthouse): Accessibility scoring and guidance
- [NVDA](https://www.nvaccess.org/) / [JAWS](https://www.freedomscientific.com/products/software/jaws/): Screen readers for real testing
- [Accessibility Insights](https://accessibilityinsights.io/): Testing tools and guidance

Terminology

Percept uses person-first language throughout to center human experience rather than condition. Motor disability includes users affected by dexterity, precision, or mobility constraints, including those who use adaptive tools or keyboard-only navigation. Screenreader user highlights the interaction method rather than an ability level. Blind user and low vision are treated as distinct profiles because the barriers and strategies differ meaningfully between them.

Percept avoids diagnostic framing, euphemism, and audit tone. Feedback is shaped by clarity, care, and intent.

Built With

HTML, CSS, and vanilla JavaScript. Profile data stored in local JSON files. Keyword detection against normalized input using regex word boundaries and alias expansion; pattern-based detection using full regular expressions for cases that keywords cannot express (such as detecting an element with a missing attribute). Structured card rendering with non-color severity distinction: Warning / Note labels injected as real DOM spans (announced by screen readers) and left border weight difference. Debounced live analysis. Undo/redo history. Session persistence via localStorage. Settings modal with focus trap. Grid-based responsive layout. Inline profile fallback for offline/file:// access.

Custom Profiles

Upload a JSON file in the same format as the built-in profiles. A profile must include:

```json
{
  "name": "Profile Name",
  "tone": "short, descriptive, phrase",
  "description": "Longer explanation of the community's experience and needs.",
  "checks": [
    {
      "keyword": "trigger-word",
      "message": "Human-centered explanation of the barrier.",
      "technical": "Implementation-specific recommendation (optional).",
      "severity": "warn"
    }
  ]
}
```

Each check requires either a `keyword` or a `pattern` (or both). Use `keyword` for simple string matching; use `pattern` when you need a regular expression — for example, to detect an element that is missing an attribute:

```json
{
  "pattern": "<img\\b(?![^>]*\\balt\\s*=)[^>]*>",
  "message": "This image has no alt attribute.",
  "technical": "Add alt=\"\" for decorative images, alt=\"[description]\" for informative ones.",
  "severity": "warn"
}
```

`severity` must be `"warn"` or `"info"`. The `technical` field is optional and shown when the Technical feedback style is selected.

Upload a profile via the file input on the home page. The profile is stored in-session and appears in the dropdown as "Custom: [Name]". No data is sent to a server.

What Is Still Planned

Expanded keyword and pattern coverage for existing profiles. Community-contributed profiles for vestibular disorders, cognitive load sensitivity, autism, and others. Grouped feedback by interface domain (forms, navigation, typography).

Contributing

Percept welcomes contributions. To suggest a new profile or improve an existing one:

1. Review the profile schema above.
2. Test your profile with the custom upload feature.
3. Open a GitHub issue or PR with your profile data, any keyword research, and a brief description of the community it represents.

All contributions are reviewed for accuracy, tone, and alignment with Percept's person-first, lived-experience framing.

License

Mozilla Public License 2.0 (MPL 2.0). This encourages thoughtful modification and reuse while preserving the tone, structure, and inclusive intention of the original work.
