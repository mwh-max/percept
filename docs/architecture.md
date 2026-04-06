# Percept – Architecture Map

## Module structure

```mermaid
graph TD
    subgraph Scripts["scripts/"]
        PERCEPT["percept.js\nEntry point\nDOM refs · debouncedAnalyze\nundo/redo wiring · keyboard shortcuts · init"]
        LOGIC["logic.js\nPure functions — no DOM\nvalidateProfileSchema · debounce\nnormalizeMarkup · escapeRegex\ngetKeywordVariants · checkKeywordMatch\ngetMatchDetails"]
        PROFILES["profiles.js\nProfile data + loading\ninlineProfiles{} · profileCache Map\ngetProfileURL · loadProfile"]
        FEEDBACK["feedback.js\nRendering + export\nshowToast · renderMessage · renderFeedback\ndownloadFile · copy/export listeners"]
        SESSION["session.js\nState + persistence\naddToHistory · undo · redo\ninitSettings · saveSessionState\nrestoreSessionState · liveAnalysisEnabled"]
    end

    PERCEPT -->|"import"| LOGIC
    PERCEPT -->|"import"| PROFILES
    PERCEPT -->|"import"| FEEDBACK
    PERCEPT -->|"import"| SESSION
    FEEDBACK -->|"import"| LOGIC
```

## Full data-flow

```mermaid
flowchart TD
    subgraph Static["Static assets"]
        HTML["index.html\nUI shell + layout"]
        CSS["style.css\nVisual styling"]
        PJSON["profiles/*.json\nadhd · blinduser · dyslexia\nhearing · lowvision · motor\nphotosensitivity · screenreader"]
    end

    subgraph UI["UI Inputs"]
        SEL["Profile select"]
        UPLOAD["Custom JSON upload"]
        TOGGLE["Feedback style\nEmotional · Technical"]
        TEXTAREA["HTML textarea"]
        PRESETS["Preset examples\naria-describedby linked"]
        SETTINGS["Settings modal\nautosave · live analysis · tone preview\nfocus trap · returns focus on close"]
    end

    subgraph LogicMod["logic.js — pure, no DOM"]
        VALIDATE["validateProfileSchema()"]
        NORMALIZE["normalizeMarkup()\ntrim · lowercase · collapse whitespace"]
        ALIASES["keywordAliases{}\nmodal→dialog, autoplay→auto-play …"]
        ESCAPE["escapeRegex()"]
        VARIANTS["getKeywordVariants()"]
        MATCH["checkKeywordMatch()\nword boundary · attr · tag regex"]
        SNIPPET["getMatchDetails()\nExtract ~60-char context snippet"]
        DEBOUNCE["debounce()\nClosure-scoped timer"]
    end

    subgraph ProfilesMod["profiles.js"]
        INLINE["inlineProfiles{}\nFallback profile data"]
        CACHE["profileCache Map\nMemoised profiles"]
        LOAD["loadProfile()\nfetch → cache → inline fallback"]
    end

    subgraph FeedbackMod["feedback.js"]
        TOAST["showToast()"]
        RENDERMSG["renderMessage()"]
        RENDER["renderFeedback()\nSort warn→info · build article cards\nWarning / Note label spans"]
        EXPORT["copy/export handlers\nJSON · TXT · CSV · Clipboard"]
    end

    subgraph SessionMod["session.js"]
        HISTORY["feedbackHistory[]\naddToHistory · undo · redo"]
        PERSIST["saveSessionState()\nrestoreSessionState()\nlocalStorage · gated by autosave flag"]
        SETTINGSINIT["initSettings()\ntoggles: autosave · live analysis · tone preview"]
        LIVEFLG["liveAnalysisEnabled\nexported let — live binding"]
    end

    subgraph EntryPoint["percept.js — entry point"]
        ANALYZE["debouncedAnalyze()"]
        UNDOREDO["undo/redo wiring\napplyHistoryState()"]
        KBD["Keyboard shortcuts\nCtrl+Enter · Ctrl+Shift+C\nCtrl+Z · Ctrl+Y · Esc"]
        TONEHINT["setToneHintForSelectedProfile()"]
        CUSTPROF["addCustomProfile()"]
    end

    subgraph Output["DOM output"]
        TONEOUT["#tone-preview\nTone hint line"]
        CARDS["#feedback-output\ntabindex=-1 · programmatic focus\nresult-warn · result-info cards"]
        TOASTOUT["#toast-container\naria-live polite"]
    end

    HTML --> CSS
    HTML -->|"type=module"| EntryPoint

    %% Profile loading
    SEL --> ANALYZE
    ANALYZE --> LOAD
    LOAD -->|"fetch"| PJSON
    PJSON --> CACHE
    INLINE -->|"fallback when fetch fails"| CACHE
    CACHE -->|"checks[]"| RENDER

    %% Custom profile upload
    UPLOAD -->|"FileReader → JSON.parse"| VALIDATE
    VALIDATE -->|"pass"| CUSTPROF
    VALIDATE -->|"errors"| TOAST
    CUSTPROF --> CACHE

    %% Analysis — keyword path
    TEXTAREA --> ANALYZE
    ANALYZE --> NORMALIZE
    NORMALIZE --> MATCH
    ALIASES --> VARIANTS
    ESCAPE --> VARIANTS
    VARIANTS --> MATCH
    MATCH --> SNIPPET
    SNIPPET --> RENDER

    %% Analysis — pattern path
    NORMALIZE -->|"check.pattern"| RENDER

    %% Rendering
    TOGGLE -->|"style mode"| RENDER
    RENDER --> CARDS
    RENDER -->|"addToHistory()"| HISTORY
    TOAST --> TOASTOUT
    RENDERMSG --> CARDS

    %% Undo/redo
    HISTORY --> UNDOREDO
    UNDOREDO --> ANALYZE

    %% Live analysis
    LIVEFLG -->|"live binding read"| ANALYZE
    SETTINGSINIT --> LIVEFLG

    %% Tone hint
    SEL --> TONEHINT
    TONEHINT --> TONEOUT

    %% Export
    CARDS --> EXPORT

    %% Session persistence
    PERSIST <-->|"read/write"| TEXTAREA
    PERSIST <-->|"read/write"| SEL
    PERSIST <-->|"read/write"| TOGGLE
    SETTINGS --> SETTINGSINIT

    %% Presets
    PRESETS -->|"inject into"| TEXTAREA

    %% Debounce
    DEBOUNCE --> ANALYZE

    %% Tests
    subgraph Tests["Vitest · 54 unit tests"]
        TESTFILE["scripts/percept.test.js\nimports from logic.js only\nno DOM setup required"]
    end
    TESTFILE -.->|"import"| LogicMod
```

## Key data flows

**Profile load**
`select → loadProfile() → fetch profiles/*.json → profileCache → checks[]`
Falls back to `inlineProfiles{}` if the fetch fails (e.g. offline or `file://`). Custom uploads go through `validateProfileSchema()` in `logic.js` before entering the cache. Each check may specify a `keyword`, a `pattern` (regex string), or both.

**Analysis — keyword path**
`textarea → normalizeMarkup() → checkKeywordMatch() (+ keywordAliases) → getMatchDetails() → renderFeedback() → result cards`

**Analysis — pattern path**
`textarea → normalizeMarkup() → RegExp(check.pattern).test() → snippet from match → renderFeedback() → result cards`
Used when a keyword cannot express the condition — for example, detecting `<img>` elements with no `alt` attribute at all via a negative lookahead: `<img\b(?![^>]*\balt\s*=)[^>]*>`.

**Severity display**
Each card receives a `<span class="result-label" aria-hidden="false">` as its first child, with text content `"Warning"` or `"Note"`. This is real DOM text, announced reliably by screen readers. Cards are further distinguished by left border weight (6 px warn, 4 px info) and color. Color alone is never the sole signal (WCAG 1.4.1).

**Persistence**
`saveSessionState()` writes markup, profile, and style to `localStorage` on every input change, gated by the autosave setting. `restoreSessionState()` reads them back on page load, clearing any stale profile key that no longer matches a valid option.

**Settings modal**
Opens with focus moved to the first focusable element inside the modal. Tab and Shift+Tab cycle within the modal. Escape and the close button return focus to `#settings-btn`.

**Feedback output**
`#feedback-output` carries `tabindex="-1"` so `feedbackBox.focus()` can move focus to the results region after analysis runs, without inserting it into the natural tab order.

**Module boundaries**
`logic.js` has no DOM access and no side-effects — it can be imported in any environment. `profiles.js` uses `fetch` and `window.location` but no direct DOM manipulation. `feedback.js` and `session.js` both acquire their own DOM references via `getElementById` at module load time (safe because all scripts are loaded as `type="module"`, which defers execution until the DOM is ready).
