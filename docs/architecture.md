# Percept – Architecture Map

```mermaid
flowchart TD
    subgraph Files["Project Files"]
        HTML["index.html\nUI shell + layout"]
        CSS["style.css\nVisual styling"]
        JS["scripts/percept.js\nAll runtime logic"]
        subgraph Profiles["profiles/*.json"]
            P1[adhd.json]
            P2[dyslexia.json]
            P3[screenreader.json]
            P4[lowvision.json]
            P5[motor.json]
            P6[blinduser.json]
            P7[hearing.json]
            P8[photosensitivity.json]
        end
    end

    subgraph UI["UI Inputs"]
        SEL["Profile select"]
        UPLOAD["Custom JSON upload"]
        TOGGLE["Feedback style\nEmotional · Technical"]
        TEXTAREA["HTML textarea"]
        PRESETS["Preset examples\naria-describedby linked"]
        SETTINGS["Settings modal\nautosave · live analysis · tone preview\nfocus trap · returns focus on close"]
    end

    subgraph Engine["Analysis Engine · percept.js"]
        INLINE["inlineProfiles{}\nFallback profile data"]
        CACHE["profileCache Map\nMemoised profiles"]
        LOAD["loadProfile()\nfetch → cache → inline fallback"]
        VALIDATE["validateProfileSchema()\nAccepts keyword or pattern per check"]
        NORMALIZE["normalizeMarkup()\ntrim · lowercase · collapse whitespace"]
        ALIASES["keywordAliases{}\nmodal→dialog, autoplay→auto-play …"]
        MATCH["checkKeywordMatch()\nword boundary · attr · tag regex"]
        PATTERN["pattern field\nFull regex — e.g. img without alt"]
        SNIPPET["getMatchDetails()\nExtract ~60-char context snippet"]
        RENDER["renderFeedback()\nSort warn→info, build article cards\n⚠ Warning / ℹ Note labels"]
        DEBOUNCE["debounce()\nClosure-scoped timer\ngated by liveAnalysisEnabled"]
        HISTORY["feedbackHistory[]\nUndo · Redo stack"]
        SESSION["saveSessionState()\nrestoreSessionState()\nlocalStorage · gated by autosave flag"]
    end

    subgraph Output["Output"]
        TONE["#tone-preview\nTone hint line"]
        CARDS["#feedback-output\ntabindex=-1 · programmatic focus\nresult-warn · result-info cards"]
        TOAST["#toast-container\nariaPolite toasts"]
        EXPORT["Export\nJSON · TXT · CSV · Clipboard"]
    end

    HTML --> CSS
    HTML --> JS
    JS -->|"fetch (with fallback)"| Profiles
    Profiles -->|"parsed into"| CACHE
    INLINE -->|"fallback when fetch fails"| CACHE
    UPLOAD -->|"FileReader → JSON.parse"| VALIDATE
    VALIDATE -->|"pass"| CACHE

    SEL --> LOAD
    LOAD --> CACHE
    TEXTAREA --> NORMALIZE
    NORMALIZE --> MATCH
    NORMALIZE --> PATTERN
    ALIASES --> MATCH
    MATCH --> SNIPPET
    PATTERN --> SNIPPET
    SNIPPET --> RENDER
    CACHE -->|"checks[]\nkeyword or pattern per check"| RENDER
    TOGGLE -->|"style mode"| RENDER
    PRESETS -->|"inject into"| TEXTAREA

    DEBOUNCE --> RENDER
    RENDER --> CARDS
    RENDER --> HISTORY
    HISTORY --> CARDS

    SEL --> TONE
    CARDS --> EXPORT
    RENDER --> TOAST
    VALIDATE --> TOAST

    SESSION <-->|"read/write"| TEXTAREA
    SESSION <-->|"read/write"| SEL
    SESSION <-->|"read/write"| TOGGLE
    SETTINGS -->|"autosave / liveAnalysis flags"| SESSION
    SETTINGS -->|"liveAnalysisEnabled"| DEBOUNCE
```

## Key data flows

**Profile load**
`select → loadProfile() → fetch profiles/*.json → profileCache → checks[]`
Falls back to `inlineProfiles{}` if the fetch fails. Custom uploads go through `validateProfileSchema()` before entering the cache. Each check may specify a `keyword`, a `pattern` (regex string), or both.

**Analysis — keyword path**
`textarea → normalizeMarkup() → checkKeywordMatch() (+ keywordAliases) → getMatchDetails() → renderFeedback() → result cards`

**Analysis — pattern path**
`textarea → normalizeMarkup() → RegExp(check.pattern).test() → snippet from match → renderFeedback() → result cards`
Used when a simple keyword cannot express the condition — for example, detecting `<img>` elements with no `alt` attribute at all via a negative lookahead: `<img\b(?![^>]*\balt\s*=)[^>]*>`.

**Severity display**
Cards are labelled `⚠ Warning` or `ℹ Note` via CSS `::before`, supplemented by a thicker left border on warnings. Color is preserved but is not the sole distinguishing signal (WCAG 1.4.1).

**Persistence**
`saveSessionState()` writes markup, profile, and style to `localStorage` on every change, gated by the autosave setting. `restoreSessionState()` reads them back on page load, clearing any stale profile key that no longer matches a valid option.

**Settings modal**
Opens with focus moved to the first focusable element inside the modal. Tab and Shift+Tab cycle within the modal. Escape and the close button return focus to `#settings-btn`.

**Feedback output**
`#feedback-output` carries `tabindex="-1"` so `feedbackBox.focus()` can move focus to the results region after analysis runs, without inserting it into the natural tab order.
