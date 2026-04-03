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
        PRESETS["Preset examples"]
        SETTINGS["Settings modal\nautosave · live analysis · tone preview"]
    end

    subgraph Engine["Analysis Engine · percept.js"]
        INLINE["inlineProfiles{}\nFallback profile data"]
        CACHE["profileCache Map\nMemoised profiles"]
        LOAD["loadProfile()\nfetch → cache → inline fallback"]
        VALIDATE["validateProfileSchema()\nStrict schema check on upload"]
        NORMALIZE["normalizeMarkup()\ntrim · lowercase · collapse whitespace"]
        ALIASES["keywordAliases{}\nmodal→dialog, autoplay→auto-play …"]
        MATCH["checkKeywordMatch()\nword boundary · attr · tag regex"]
        SNIPPET["getMatchDetails()\nExtract ~60-char context snippet"]
        RENDER["renderFeedback()\nSort warn→info, build article cards"]
        DEBOUNCE["debounce()\nClosure-scoped timer"]
        HISTORY["feedbackHistory[]\nUndo · Redo stack"]
        SESSION["saveSessionState()\nrestoreSessionState()\nlocalStorage"]
    end

    subgraph Output["Output"]
        TONE["#tone-preview\nTone hint line"]
        CARDS["#feedback-output\nResult cards"]
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
    ALIASES --> MATCH
    MATCH --> SNIPPET
    SNIPPET --> RENDER
    CACHE -->|"checks[]"| RENDER
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
    SETTINGS -->|"flags"| SESSION
    SETTINGS -->|"liveAnalysisEnabled"| DEBOUNCE
```

## Key data flows

**Profile load**
`select → loadProfile() → fetch profiles/*.json → profileCache → checks[]`
Falls back to `inlineProfiles{}` if the fetch fails. Custom uploads go through `validateProfileSchema()` before entering the cache.

**Analysis**
`textarea → normalizeMarkup() → checkKeywordMatch() (+ keywordAliases) → getMatchDetails() → renderFeedback() → result cards`

**Persistence**
`saveSessionState()` writes markup, profile, and style to `localStorage` on every change, gated by the autosave setting. `restoreSessionState()` reads them back on page load, clearing any stale profile key that no longer matches a valid option.
