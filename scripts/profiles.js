// ─── Built-in profile data and loading ───────────────────────────────────────

export const inlineProfiles = {
  adhd: {
    name: "ADHD",
    tone: "scattered, effortful, alert",
    description:
      "Layout feels like chasing thoughts across a busy room. Visual noise, unclear pacing and overlapping stimuli demand executive function at every scroll. Simplicity becomes permission to stay.",
    checks: [
      {
        keyword: "marquee",
        message:
          "Moving or scrolling text pulls focus involuntarily. For someone with ADHD, it can make the rest of the page disappear. Remove or replace with static content.",
        technical:
          "Avoid <marquee> or CSS scroll animations on text. These create involuntary attention capture and disrupt reading flow.",
        severity: "warn",
      },
      {
        keyword: "autoplay",
        message:
          "Autoplaying media hijacks attention before the user chooses to engage. This can derail the entire session. Add a play button instead.",
        technical:
          "Do not use autoplay on video or audio elements. Require explicit user interaction to start media.",
        severity: "warn",
      },
      {
        keyword: "animation",
        message:
          "Decorative animation competes with content for attention. For someone with ADHD, motion on the periphery is hard to ignore. Reserve animation for meaningful transitions.",
        technical:
          "Limit animation to purposeful state changes. Wrap decorative animations in a prefers-reduced-motion media query.",
        severity: "warn",
      },
      {
        keyword: "placeholder",
        message:
          "Placeholder text disappears when typing begins. For someone with ADHD, losing the instruction mid-task can cause confusion or a restart. Use a visible label instead.",
        technical:
          "Do not rely on placeholder as the sole label for an input. Use a persistent <label> element above or beside the field.",
        severity: "warn",
      },
      {
        keyword: "infinite",
        message:
          "Infinite scroll removes natural stopping points. Without them, it becomes hard to disengage. Consider pagination or a clear 'load more' boundary.",
        technical:
          "Avoid infinite scroll patterns. Use paginated navigation or an explicit load trigger to create cognitive rest points.",
        severity: "warn",
      },
      {
        keyword: "modal",
        message:
          "Modals interrupt flow without warning. If the user wasn't expecting a new layer, it can feel disorienting. Keep modal use minimal and always provide a clear close action.",
        technical:
          "Ensure modals have a visible close button, trap focus correctly, and return focus to the trigger element on close.",
        severity: "info",
      },
      {
        keyword: "countdown",
        message:
          "Timed countdowns or session expiry warnings create urgency that can spike anxiety and derail concentration. Give users control over their own pace.",
        technical:
          "Avoid time-limited interactions where possible. If a timeout is required, give at least 20 seconds of warning and an option to extend.",
        severity: "warn",
      },
      {
        keyword: "tooltip",
        message:
          "Tooltips that appear only on hover can vanish before the user has finished reading. Consider inline help text that stays visible.",
        technical:
          "Supplement hover tooltips with persistent help text or aria-describedby references that do not disappear on focus loss.",
        severity: "info",
      },
    ],
  },
  dyslexia: {
    name: "Dyslexia",
    tone: "effortful, pattern-sensitive, clarity-seeking",
    description:
      "Text arrives slowly, sometimes out of order. Dense paragraphs and decorative fonts blur meaning. Structure, spacing and semantic clarity offer relief. Simplicity isn't minimalism—it's access.",
    checks: [
      {
        keyword: "font-family",
        message:
          "Consider using dyslexia-friendly fonts like Lexend or OpenDyslexic. Avoid cursive or overly stylized typefaces.",
        technical:
          "Avoid decorative, cursive, or monospace fonts for body text. Lexend, OpenDyslexic, and system fonts with clear letterforms (Arial, Verdana) reduce character confusion.",
        severity: "warn",
      },
      {
        keyword: "line-height",
        message:
          "Adequate line spacing improves readability. Aim for at least 1.5x the font size.",
        technical:
          "Set line-height to at least 1.5 for body text. Values below 1.4 cause lines to visually blur together for many readers with dyslexia.",
        severity: "info",
      },
      {
        keyword: "justify",
        message:
          "Justified text can create uneven spacing between words. This irregular rhythm is particularly disruptive for readers who process text letter-by-letter. Left-align for consistent flow.",
        technical:
          "Use text-align: left for body text. Never use text-align: justify. Uneven word spacing caused by justification fragments the reading rhythm.",
        severity: "warn",
      },
      {
        keyword: "letter-spacing",
        message:
          "Tight letter spacing makes it harder to distinguish individual characters. For dyslexic readers, letters can blur together or be confused for similar shapes.",
        technical:
          "Use letter-spacing of at least 0.12em for body text. Avoid negative letter-spacing. The WCAG 1.4.12 text spacing criterion recommends letter spacing of at least 0.12x font size.",
        severity: "info",
      },
      {
        keyword: "text-transform",
        message:
          "All-caps text significantly increases reading effort. Uppercase words lose their shape — every word becomes a rectangle, removing the visual anchors that aid word recognition.",
        technical:
          "Avoid text-transform: uppercase for body text or anything longer than a few words. Use it only sparingly for short labels or decorative headings.",
        severity: "warn",
      },
      {
        keyword: "columns",
        message:
          "Multi-column layouts interrupt the natural left-to-right reading path. Reaching the end of a column and finding the start of the next one requires spatial reasoning that adds cognitive load.",
        technical:
          "Avoid CSS columns for long-form body text. Single-column layouts remove the need to track column breaks.",
        severity: "warn",
      },
      {
        keyword: "word-spacing",
        message:
          "Word spacing affects how clearly individual words stand apart. Too little spacing causes words to run together; combined with other factors it can make a paragraph feel impenetrable.",
        technical:
          "Use word-spacing of at least 0.16em for body text (WCAG 1.4.12). Avoid negative word-spacing.",
        severity: "info",
      },
      {
        keyword: "background",
        message:
          "Busy or patterned backgrounds compete with text for visual attention. For readers who already find text effortful, a background that 'moves' behind words can make reading feel impossible.",
        technical:
          "Use a solid, low-contrast background behind text. Avoid background-image with patterns, textures, or gradients in text areas.",
        severity: "warn",
      },
    ],
  },
  screenreader: {
    name: "Screen Reader User",
    tone: "linear, anticipatory, moment-to-moment",
    description:
      "The page arrives as a stream, not a surface. There is no glancing around, no skipping ahead, no sense of the whole before the parts. Each element is announced in sequence — heading, link, button, image — and meaning accumulates one moment at a time. A well-structured page feels like a clear path. A poorly structured one feels like a room where the furniture has been moved in the dark. Confidence comes from consistency. When the heading order holds, when every image has a name, when focus never disappears — the interface becomes navigable. When any of those things break, the stream breaks with them.",
    checks: [
      {
        keyword: "img",
        message:
          "Images should include alt text. Screenreader users rely on alt to understand meaning.",
        technical:
          'Every <img> must have an alt attribute. Use alt="" for decorative images and a meaningful description for informative ones.',
        severity: "warn",
      },
      {
        keyword: "role=",
        message:
          "Custom roles should be used carefully. Native semantics are preferred when possible.",
        technical:
          'Prefer native HTML elements over ARIA roles. Use <button> instead of <div role="button">, <nav> instead of <div role="navigation">.',
        severity: "info",
      },
      {
        keyword: "tabindex",
        message:
          "Tab order changes can confuse screenreader flow. Use tabindex intentionally and test focus behavior.",
        technical:
          'Use tabindex="0" to add elements to natural tab order and tabindex="-1" for programmatic focus only. Avoid positive tabindex values.',
        severity: "info",
      },
      {
        keyword: "<h1",
        message:
          "Headings create a map. Be sure to use them in a logical order (h1 to h6) without skipping levels.",
        technical:
          "Every page should have exactly one <h1>. Heading levels should not skip — an <h3> must follow an <h2>, not an <h1>.",
        severity: "warn",
      },
      {
        keyword: "aria-label",
        message:
          "An aria-label is present. Verify that its value is meaningful and matches what a screenreader user would expect to hear when focus lands on the element.",
        technical:
          "aria-label overrides all other accessible name sources. Ensure the value is concise, accurate, and does not simply repeat visible text.",
        severity: "info",
      },
      {
        keyword: "aria-expanded",
        message:
          "Expandable controls like accordions and dropdowns rely on aria-expanded to announce their state. Without it, a screenreader user cannot tell whether content is hidden or shown.",
        technical:
          'Pair aria-expanded="true|false" with aria-controls pointing to the controlled region. Update the value dynamically when state changes.',
        severity: "warn",
      },
      {
        keyword: "skip",
        message:
          "Skip links let screenreader and keyboard users jump past repeated navigation. Without one, every page load starts with the same navigation items before any content.",
        technical:
          'Add a visible-on-focus skip link as the first element in <body>: <a class="skip-link" href="#main">Skip to main content</a>. Ensure the target id exists.',
        severity: "warn",
      },
      {
        pattern: "<button[^>]*>\\s*(?:<[^>]+>\\s*)*</button>",
        message:
          "A button appears to have no visible text. Icon-only buttons are announced by their label, not their icon — without a text label, a screenreader user hears nothing meaningful.",
        technical:
          "Add an aria-label to icon-only buttons, or include visually-hidden text inside them. Never leave a button with only an icon and no accessible name.",
        severity: "warn",
      },
      {
        keyword: "<nav",
        message:
          "Navigation landmarks help screenreader users jump directly to the navigation region without listening through the whole page.",
        technical:
          'Use <nav> for primary and secondary navigation. If multiple <nav> elements exist, distinguish them with aria-label (e.g., aria-label="Primary", aria-label="Footer").',
        severity: "info",
      },
      {
        keyword: "outline:",
        message:
          "CSS outline styles are often removed for visual reasons. For screenreader users who also navigate by keyboard, a missing focus indicator makes the page effectively invisible during tab navigation.",
        technical:
          "Never use outline: none or outline: 0 without providing an equivalent custom focus style. Test all interactive elements with keyboard navigation.",
        severity: "warn",
      },
    ],
  },
  lowvision: {
    name: "Low Vision",
    tone: "blurred, tentative, contrast-seeking",
    description:
      "The page arrives not as a whole—but as fragments in tension. Text floats in a fog of brightness or blends into muted backgrounds. Navigation depends on scale, rhythm, and clear anchors. Every pause is a scan for something readable. Grace lives in contrast, not color.",
    checks: [
      {
        keyword: "color:",
        message:
          "Color is often relied on, but contrast matters more. Ensure text is legible in all lighting environments.",
        technical:
          "Text must meet WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold). Use a contrast checker before finalising colour choices.",
        severity: "warn",
      },
      {
        keyword: "font-size",
        message:
          "Small text can vanish in low vision contexts. Consider default sizing and allow zoom without breakage.",
        technical:
          "Use relative units (rem, em) for font sizes rather than px. This allows browser font scaling to work. Minimum 16px equivalent for body text.",
        severity: "warn",
      },
      {
        keyword: "background-image",
        message:
          "Background images placed behind text make contrast unpredictable. In low vision conditions, text over a photograph or pattern can become completely unreadable.",
        technical:
          "Avoid placing text directly over background-image without a solid colour overlay. If a background image is required, add a semi-opaque solid overlay between it and the text, and test contrast.",
        severity: "warn",
      },
      {
        pattern: "user-scalable\\s*=\\s*(no|0)",
        message:
          "Disabling zoom locks low vision users out of one of their primary tools. Many people with low vision rely on pinch-to-zoom or browser zoom to make text readable. Blocking it is a significant barrier.",
        technical:
          "Remove user-scalable=no from the viewport meta tag. Never prevent zoom. WCAG 1.4.4 (Resize Text) requires content to remain usable at 200% zoom.",
        severity: "warn",
      },
      {
        keyword: "line-height",
        message:
          "Tight line spacing causes lines of text to visually merge at any level of magnification. For low vision users zoomed in to 200%, cramped lines become illegible.",
        technical:
          "Use line-height of at least 1.5 for body text. At high zoom levels, insufficient leading causes line overlap.",
        severity: "info",
      },
      {
        keyword: "opacity",
        message:
          "Very low opacity can render text invisible under reduced screen brightness or for users with reduced contrast sensitivity.",
        technical:
          "Avoid opacity below 0.7 on text or interactive elements. Prefer using a colour with appropriate contrast rather than a transparent version of a colour.",
        severity: "warn",
      },
      {
        keyword: "max-width",
        message:
          "Fixed-width containers that do not reflow at high zoom force horizontal scrolling. For a user zoomed in to 200%, having to scroll both vertically and horizontally makes navigation exhausting.",
        technical:
          "Use max-width with responsive units and ensure content reflows at 400% zoom (WCAG 1.4.10 Reflow). Avoid fixed-pixel widths on containers that hold text.",
        severity: "info",
      },
      {
        keyword: "cursor:",
        message:
          "Changing or hiding the cursor removes a visual anchor that low vision users use to locate their position on screen. A missing or non-standard cursor can make pointer-based navigation very difficult.",
        technical:
          "Never set cursor: none on interactive elements. Avoid cursor: default on clickable elements — it removes the pointer feedback that signals interactivity.",
        severity: "info",
      },
    ],
  },
  motor: {
    name: "Motor Disability",
    tone: "deliberate, effort-aware, access-conscious",
    description:
      "Interaction involves effort. Small buttons, hover-only actions, and drag gestures can demand precision some users may not have. Designers should consider the experience of people with motor disabilities—including those who use adaptive tools or keyboard navigation. Clarity comes from large touch targets, reduced motion demands, and flexible input paths. Design should honor movement—because for many, it carries cost.",
    checks: [
      {
        keyword: "hover",
        message:
          "Hover-only interactions can block access for users who rely on keyboard or voice input. Ensure all actions are reachable without a mouse.",
        technical:
          "Avoid hover-only interactions. Ensure all interactive elements are operable with keyboard or voice input.",
        severity: "info",
      },
      {
        keyword: "button",
        message:
          "Small buttons may be hard to click. Increase target size and spacing to reduce accidental taps.",
        technical:
          "Ensure buttons are at least 44x44px and spaced to reduce touch errors.",
        severity: "warn",
      },
      {
        keyword: "drag",
        message:
          "Drag-and-drop interfaces require fine motor control. Offer alternative actions like \u201cMove Up\u201d or \u201cAdd Below\u201d buttons.",
        technical:
          "Avoid requiring drag-and-drop. Provide buttons or keyboard-accessible alternatives for reordering or inserting elements.",
        severity: "warn",
      },
      {
        keyword: "touch-action",
        message:
          "Restricting touch actions can disable pinch-to-zoom or other gestures that users rely on to navigate or control a page. For someone with limited hand mobility, removing these options can make a page completely unusable.",
        technical:
          "Avoid touch-action: none. If touch gestures must be restricted, ensure all actions remain reachable by alternative input methods.",
        severity: "warn",
      },
      {
        keyword: "pointer-events",
        message:
          "Setting pointer-events: none on an element makes it unclickable and untappable. If used incorrectly it can silently block access to interactive content.",
        technical:
          "Use pointer-events: none only on purely decorative overlays. Never apply it to interactive elements. Verify keyboard operability for all affected regions.",
        severity: "warn",
      },
      {
        keyword: "dblclick",
        message:
          "Double-click actions require precise timing and repeated fine motor movement. For users with tremor or limited dexterity, reliably triggering a double-click can be very difficult.",
        technical:
          "Never require double-click as the only way to trigger an action. Provide a single-click or keyboard-accessible alternative for every double-click interaction.",
        severity: "warn",
      },
      {
        keyword: "outline:",
        message:
          "Removing focus outlines leaves keyboard-only users without a visible indicator of where they are on the page. For motor-disabled users who navigate entirely by keyboard, this is like removing the cursor.",
        technical:
          "Never set outline: none or outline: 0 without providing an equivalent custom focus style. Test all interactive elements with Tab key navigation.",
        severity: "warn",
      },
      {
        keyword: "scroll",
        message:
          "Scroll-only containers can trap keyboard and switch access users. If content is only reachable by scrolling with a mouse, users relying on keyboard or assistive devices may not be able to access it.",
        technical:
          'Ensure scrollable containers are focusable (tabindex="0") and announce themselves as scrollable to assistive technology. All content within should be reachable by keyboard.',
        severity: "info",
      },
    ],
  },
  blinduser: {
    name: "Blind User",
    tone: "sequential, label-dependent, exploratory",
    description:
      "The interface speaks before it is seen. Navigation depends on correct semantics, alt text, and consistent structure. Redundant descriptions can be helpful. Surprises—like unlabeled buttons or nested actions—erode confidence. Every element asks one question: 'Will this make sense when heard?'",
    checks: [
      {
        pattern: "<img\\b(?![^>]*\\balt\\s*=)[^>]*>",
        message:
          "This image has no alt attribute at all. A blind user receives no information about it—not even that an image exists. Add an alt attribute immediately.",
        technical:
          'Every <img> must have an alt attribute. Use alt="" for decorative images, and alt="[meaningful description]" for images that convey content or purpose.',
        severity: "warn",
      },
      {
        keyword: "alt=",
        message:
          "An alt attribute is present. Review its value: it should describe the content or purpose of the image, not its appearance or filename. Decorative images should use alt=\"\".",
        technical:
          'Verify every alt value conveys meaning. Decorative images: alt="". Informative images: alt="[description of content or purpose]". Never use the filename or "image of" as the alt value.',
        severity: "info",
      },
      {
        keyword: "<table",
        message:
          "Tables are navigated cell by cell. Without clear headers, every cell arrives without context. A blind user may not know what column they're in until they've gone too far.",
        technical:
          "Use <th scope='col'> and <th scope='row'> to associate headers. Add a <caption> to describe the table's purpose.",
        severity: "warn",
      },
      {
        keyword: "<form",
        message:
          "Form fields need labels that are programmatically associated, not just visually nearby. A blind user hears the label before typing—if it's missing, they're guessing.",
        technical:
          "Every form input must have an associated <label for='...'> or aria-label. Do not rely on placeholder text as a label substitute.",
        severity: "warn",
      },
      {
        keyword: "onclick",
        message:
          "If a click event is attached to a non-interactive element like a div or span, it won't be reachable by keyboard or announced correctly by a screen reader.",
        technical:
          "Attach click handlers to native interactive elements (<button>, <a>). If a custom element must be used, add role='button' and tabindex='0' and handle keyboard events.",
        severity: "warn",
      },
      {
        keyword: "display:none",
        message:
          "Content hidden with display:none is invisible to screen readers too. If you're hiding decorative content, that's fine. If it carries meaning, it needs a different approach.",
        technical:
          "Use display:none only for content that should be completely hidden from all users. For visually hidden but screen-reader-accessible content, use a visually-hidden utility class instead.",
        severity: "info",
      },
      {
        keyword: "aria-hidden",
        message:
          "aria-hidden removes content from the accessibility tree entirely. Use it carefully—applied to the wrong element, it can hide navigation, labels or critical context from a blind user.",
        technical:
          "Never apply aria-hidden='true' to focusable elements. Audit all aria-hidden usage to confirm it is applied only to decorative or redundant content.",
        severity: "warn",
      },
      {
        keyword: "svg",
        message:
          "SVG icons and illustrations are often invisible to screen readers unless described. A decorative icon is fine unlabelled—but a meaningful one needs a title or aria-label.",
        technical:
          "Add a <title> inside meaningful SVGs and reference it with aria-labelledby. For decorative SVGs, use aria-hidden='true'.",
        severity: "info",
      },
      {
        keyword: "iframe",
        message:
          "Iframes are announced by their title, not their contents. Without a descriptive title attribute, a blind user lands inside an unlabelled frame with no way to orient themselves.",
        technical:
          "Every <iframe> must have a title attribute that describes its purpose. For embeds that are purely decorative, use aria-hidden='true' on the iframe.",
        severity: "warn",
      },
    ],
  },
  hearing: {
    name: "Deaf or Hard of Hearing User",
    tone: "visual, text-dependent, caption-seeking",
    description:
      "Sound carries information that may not be visible on the page. Videos play without captions, audio-only instructions assume hearing, and sound-based alerts have no visual backup. For deaf and hard of hearing users, equal access means every audio moment is also text. Captions aren't optional—they're navigation.",
    checks: [
      {
        keyword: "video",
        message:
          "Videos require captions or a transcript. Without them, deaf and hard of hearing users miss dialogue, context, and meaning. Captions should be synchronized with audio and include speaker identification and sound descriptions.",
        technical:
          "Add <track kind='captions'> inside <video>, or embed captions directly. Captions should include dialogue, speaker names, and descriptions of significant sounds (e.g., [door slams], [music plays]).",
        severity: "warn",
      },
      {
        keyword: "audio",
        message:
          "Audio-only content (podcasts, recordings, sound effects) must have a transcript or visual alternative. Deaf users cannot access audio without text.",
        technical:
          "Provide a transcript alongside all <audio> elements. For audio embeds, link to a text transcript. Describe sound events that convey meaning.",
        severity: "warn",
      },
      {
        keyword: "caption",
        message:
          "Captions are present. Ensure they are accurate, synchronized, and include speaker identification and sound descriptions.",
        severity: "info",
      },
      {
        keyword: "transcript",
        message:
          "A transcript is available. Ensure it is complete, includes speaker names, and describes significant sounds or music.",
        severity: "info",
      },
      {
        keyword: "sound",
        message:
          "If the page uses sound to convey information (alerts, notifications, status changes), provide a visual or text alternative. No hearing user should be required to hear the page.",
        technical:
          "Never rely on sound alone. Pair audio cues with visual indicators, text messages, or aria-live announcements.",
        severity: "warn",
      },
      {
        keyword: "alert",
        message:
          "Alerts that rely on sound (beeps, chimes, sirens) must also have a visual indicator (color change, animation, icon) and accessible text. Hard of hearing users need to see alerts, not just hear them.",
        technical:
          "Use aria-live regions for alerts. Pair audible alerts with visual feedback and text announcements.",
        severity: "warn",
      },
      {
        keyword: "notification",
        message:
          "Notifications delivered only through sound are inaccessible to deaf users. Use visual + text alternatives.",
        technical:
          "Display notifications visually (toast, banner) with text content. Do not rely on sound alone.",
        severity: "warn",
      },
      {
        keyword: "podcast",
        message:
          "Podcasts and audio content require transcripts. Deaf listeners should be able to read every word.",
        technical:
          "Provide a full written transcript alongside every podcast episode. Format clearly and link obviously.",
        severity: "warn",
      },
    ],
  },
  photosensitivity: {
    name: "Photosensitive or Seizure-Prone User",
    tone: "cautious, contrast-aware, motion-sensitive",
    description:
      "For people with photosensitive epilepsy or other photosensitive conditions, certain visual patterns can trigger seizures. Flashing lights, rapid color changes, high-contrast patterns, and motion can all pose serious health risks. Safe design means removing triggers entirely—not just warning users. Every animation decision needs care. Every flash is a potential crisis.",
    checks: [
      {
        keyword: "animation",
        message:
          "Animations can trigger seizures in photosensitive individuals. Check animation speed: safe animations flash no more than 3 times per second. Remove or slow rapid animations (especially strobing effects, color flashes, or rapid pattern changes).",
        technical:
          "Limit animation to ≤3 flashes/second. Use CSS @media (prefers-reduced-motion) to disable animations for users who request reduced motion. Test with epilepsy safety tools.",
        severity: "warn",
      },
      {
        keyword: "flash",
        message:
          "Flashing content is a direct seizure trigger. Any content that flashes more than 3 times per second poses serious risk. Remove all flashing effects immediately.",
        technical:
          "Use JavaScript to detect and eliminate flashing. No element should flash faster than 3 Hz. Include warning if flashing content is unavoidable, and provide a disable toggle.",
        severity: "warn",
      },
      {
        keyword: "transition",
        message:
          "Rapid transitions between high-contrast colors can trigger seizures. Be especially cautious with white-to-black or black-to-white transitions. Gradual transitions are safer than abrupt ones.",
        technical:
          "Avoid abrupt high-contrast transitions. If transitions are necessary, keep them gradual (>1 second for color changes) and avoid white/black flashing patterns.",
        severity: "warn",
      },
      {
        keyword: "autoplay",
        message:
          "Autoplaying videos or animations can contain flashing or rapid motion. Always require user interaction before any animation or video starts. Never surprise users with motion.",
        technical:
          "Never autoplay video or animated content. Require explicit user action to start. Add visible play button and ensure controls are accessible.",
        severity: "warn",
      },
      {
        keyword: "motion",
        message:
          "Large-scale movement across the screen (parallax scrolling, moving backgrounds) can trigger dizziness and seizures in photosensitive users. Test or disable aggressive motion effects.",
        technical:
          "Avoid parallax scrolling and large motion effects. Use CSS @media (prefers-reduced-motion) to disable motion for users who request it. Test with actual photosensitive individuals if motion is important.",
        severity: "info",
      },
      {
        keyword: "blink",
        message:
          "Blinking text or elements create flashing effects. Remove blinking text. Modern CSS text-decoration-blink is rarely used, but check for custom blink effects (JavaScript-based animations).",
        technical:
          "Never use text-decoration: blink. Search codebase for setInterval/setTimeout-based animations that create blinking effects and remove them.",
        severity: "warn",
      },
      {
        keyword: "strobe",
        message:
          "Strobe effects (rapid on/off patterns) are extremely dangerous for photosensitive individuals. Remove all strobe effects.",
        technical:
          "Eliminate any CSS or JavaScript creating strobe/flashing patterns. If unavoidable, include warning before content loads and provide option to disable it entirely.",
        severity: "warn",
      },
      {
        keyword: "pattern",
        message:
          "High-contrast repeating patterns can trigger visual distortion and seizures. Test patterns with photosensitivity safety tools. Reduce contrast or break up patterns where possible.",
        technical:
          "Use photosensitivity testing tools (e.g., Photosensitive Epilepsy Analysis Tool) to test patterns. Avoid geometric patterns with high contrast. Blur or soften edges of patterned elements.",
        severity: "info",
      },
    ],
  },
  vestibular: {
    name: "Vestibular Disorder",
    tone: "still, grounded, motion-wary",
    description:
      "The world is already moving. Parallax backgrounds drift, carousels slide, sticky headers glide past content at a different speed. For someone with a vestibular disorder, these small mismatches between visual motion and the body's sense of position are not decorative — they are disorienting. Dizziness, nausea, and disorientation can arrive within seconds. The page does not need to move to be engaging. Stillness is not boring. It is safe.",
    checks: [
      {
        keyword: "parallax",
        message:
          "Parallax scrolling creates a mismatch between the speed of foreground and background elements. For vestibular disorder users, this split-motion is one of the most reliable triggers for dizziness and nausea.",
        technical:
          "Remove parallax effects or disable them inside a @media (prefers-reduced-motion: reduce) block. Never use parallax on large areas of the screen.",
        severity: "warn",
      },
      {
        keyword: "carousel",
        message:
          "Auto-advancing carousels combine motion with unpredictable position changes. The content shifts without the user's input, and there is no safe place to rest the eye. Even slow carousels can trigger symptoms.",
        technical:
          "Disable auto-advancement by default. If a carousel must auto-play, pause it on hover and focus, and stop it entirely when prefers-reduced-motion is active. Always provide prev/next controls.",
        severity: "warn",
      },
      {
        keyword: "sticky",
        message:
          "Sticky elements scroll at a different rate than the surrounding content. For vestibular users, the visual conflict between a stationary header and moving page content can cause disorientation even during gentle scrolling.",
        technical:
          "Consider removing sticky positioning or making sticky elements smaller. If sticky headers are required, ensure they are narrow enough that the motion conflict is minimal.",
        severity: "info",
      },
      {
        keyword: "scroll-behavior",
        message:
          "Smooth scrolling animates the viewport position when navigating to an anchor. For vestibular users, the viewport moving without direct input is a known trigger.",
        technical:
          "Wrap scroll-behavior: smooth inside @media (prefers-reduced-motion: no-preference) so it only applies when the user has not requested reduced motion.",
        severity: "warn",
      },
      {
        keyword: "transform",
        message:
          "CSS transforms used in scroll-linked animations — elements that rotate, scale, or translate as the user scrolls — create a direct vestibular trigger by tying visual motion to body movement.",
        technical:
          "Avoid scroll-driven transform animations. Disable all transform animations inside @media (prefers-reduced-motion: reduce).",
        severity: "warn",
      },
      {
        keyword: "animation",
        message:
          "Looping or large-scale animations — especially those that cover a wide area of the screen — can cause prolonged vestibular symptoms. The larger the motion, the more disorienting it is.",
        technical:
          "Limit animation to small, purposeful transitions. Wrap all animation declarations in @media (prefers-reduced-motion: no-preference). Use animation-duration: 0.01ms as a fallback for reduced motion.",
        severity: "warn",
      },
      {
        keyword: "fixed",
        message:
          "Fixed-position elements remain stationary as the page scrolls beneath them. This visual layer split can produce a sensation similar to motion sickness in vestibular disorder users.",
        technical:
          "Use fixed positioning sparingly. Prefer sticky with a small height for navigation. Test by scrolling quickly and checking for visual jarring.",
        severity: "info",
      },
      {
        keyword: "background-attachment",
        message:
          "background-attachment: fixed creates a parallax-like effect where the background image stays still as the page content scrolls over it. This is a well-documented vestibular trigger.",
        technical:
          "Replace background-attachment: fixed with background-attachment: scroll. Use @supports to detect and override if needed for older code.",
        severity: "warn",
      },
    ],
  },
  cognitiveload: {
    name: "Cognitive Load / Overwhelm",
    tone: "overloaded, counting steps, seeking simplicity",
    description:
      "The interface asks more than it gives. Forms stretch across the page with no sense of progress. Errors appear all at once, in red, without instruction. Modals interrupt before the task is finished. Accordions hide the answer behind a click. For users with cognitive disabilities, brain injury, chronic fatigue, or high situational load, complexity does not just slow things down — it ends the session. Simplicity is not a design choice here. It is the whole point.",
    checks: [
      {
        keyword: "modal",
        message:
          "Modals interrupt the current task by adding a new layer of interaction. For users managing cognitive load, an unexpected interruption mid-task can cause confusion about where they were and what they were doing.",
        technical:
          "Minimize modal use. Prefer inline confirmation or toast notifications for non-critical information. When a modal is necessary, always provide a clear, prominently placed close button.",
        severity: "warn",
      },
      {
        keyword: "accordion",
        message:
          "Accordions hide content behind a click. If the user does not know the content exists, they may not think to look for it — and may submit incomplete information or give up entirely.",
        technical:
          "Consider showing critical information by default. Use accordions only for supplementary content that is not needed by all users. Test whether users can locate the hidden content without guidance.",
        severity: "info",
      },
      {
        keyword: "error",
        message:
          "Error messages that describe what went wrong without explaining how to fix it leave users stranded. 'Invalid input' says nothing. 'Please enter a date in the format DD/MM/YYYY' solves the problem.",
        technical:
          "Write error messages in plain language. Describe the problem and the solution. Place the message adjacent to the field that caused it. Do not clear field values on error.",
        severity: "warn",
      },
      {
        keyword: "required",
        message:
          "Required fields surfaced only at submission create a high-effort failure moment. The user completes the form believing it is correct, then must find and fix errors they could have avoided.",
        technical:
          "Mark required fields visibly before submission — not only after. Use both an asterisk and a text label (e.g. '* required'). Place a legend at the top of the form explaining the marker.",
        severity: "warn",
      },
      {
        keyword: "infinite",
        message:
          "Infinite scroll removes any sense of where the user is in the content. Without visible progress or an end point, it is impossible to orient or plan. For cognitively loaded users, this can feel like being lost.",
        technical:
          "Replace infinite scroll with paginated navigation or a visible 'Load more' button. Show the user how many items are loaded and how many remain.",
        severity: "warn",
      },
      {
        keyword: "autocomplete",
        message:
          "Autocomplete behaviour that fires unexpectedly — filling fields without warning, changing selections, or submitting forms — can disorient users who are working slowly or re-reading before submitting.",
        technical:
          "Use autocomplete attributes to assist, not override. Test autocomplete behaviour with keyboard navigation. Never submit a form automatically as a result of autocomplete selection.",
        severity: "info",
      },
      {
        keyword: "<table",
        message:
          "Wide tables with many columns demand simultaneous tracking of rows, columns, and headers. For cognitively loaded users, losing your place in a table mid-read can require starting the entire row again.",
        technical:
          "Limit columns to what is essential. Consider providing a simplified list view or summary alongside complex tables. Use row hover styles to help users track their position.",
        severity: "info",
      },
      {
        keyword: "countdown",
        message:
          "Countdown timers and session expiry warnings create urgency that is incompatible with the time some users need to complete tasks at their own pace. The pressure of a ticking clock can cause errors, panic, or abandonment.",
        technical:
          "Avoid session timeouts where possible. If a timeout is required by security policy, warn at least 2 minutes before expiry, provide an extend option, and do not lose entered data on timeout.",
        severity: "warn",
      },
    ],
  },
  colourblindness: {
    name: "Colour Blind User",
    tone: "colour-agnostic, pattern-reliant, label-dependent",
    description:
      "Colour carries meaning that does not always arrive. Red errors and green successes look identical. Charts with coloured lines but no labels are unreadable. Required fields marked only with a red asterisk are invisible. The design is not broken — it just speaks a language that not everyone hears. Roughly 1 in 12 men and 1 in 200 women have some form of colour vision deficiency. Using colour alone to convey meaning excludes them entirely. The fix is always the same: add another signal. A label, an icon, a pattern, a border. Colour can still be there — it just cannot be the only thing.",
    checks: [
      {
        keyword: "color: red",
        message:
          "Red is used as a colour signal. For users who cannot distinguish red from green or brown, this signal is invisible. Pair red with an icon, a text label, or a border to convey the same meaning without colour alone.",
        technical:
          "Never use colour as the sole means of conveying information (WCAG 1.4.1). Supplement colour changes with icons (e.g. \u26a0 for error), text labels, or pattern/shape changes.",
        severity: "warn",
      },
      {
        keyword: "color: green",
        message:
          "Green is used as a colour signal. Red-green colour blindness (deuteranopia and protanopia) is the most common form and affects roughly 8% of men. Green success states are frequently invisible to these users.",
        technical:
          "Pair green success states with a checkmark icon or the word 'Success'. Do not rely on colour alone to distinguish success from error.",
        severity: "warn",
      },
      {
        keyword: "border-color",
        message:
          "A border colour change is present. If this indicates state (focus, error, valid, invalid), ensure the state is also communicated through a non-colour signal such as an icon, a label, or a change in border weight.",
        technical:
          "Colour-only border changes for form state (e.g. red border for error) must be supplemented. Use an error icon adjacent to the field and an error message below it.",
        severity: "info",
      },
      {
        keyword: "background-color",
        message:
          "Background colour changes are used. If background colour alone distinguishes states (active, selected, highlighted, error), users with colour vision deficiency may not be able to perceive the difference.",
        technical:
          "Supplement background-colour state changes with a visible text label, icon, or pattern change. Test your UI in a greyscale simulation to verify all states remain distinguishable.",
        severity: "info",
      },
      {
        keyword: "legend",
        message:
          "A legend is present. If this is a chart or diagram legend that uses colour swatches to identify data series, colour blind users may be unable to match the swatches to the data.",
        technical:
          "Add text labels directly to chart lines, bars, or segments where possible. If a legend is used, supplement colour swatches with distinct shapes, patterns, or labels inside the swatch.",
        severity: "warn",
      },
      {
        keyword: "chart",
        message:
          "A chart or graph is present. Charts that distinguish data series by colour alone are among the most common accessibility failures for colour blind users.",
        technical:
          "Use distinct line styles (solid, dashed, dotted), shapes at data points, or hatching patterns in addition to colour. Label data series directly on the chart. Do not rely on a colour-only legend.",
        severity: "warn",
      },
      {
        keyword: "required",
        message:
          "Required fields are present. If they are marked with a red asterisk as the sole indicator, colour blind users may not see which fields are required.",
        technical:
          "Mark required fields with a visible asterisk (*) and a text label. Place a legend at the top of the form that explains the marker. Never use colour alone to indicate required status.",
        severity: "warn",
      },
      {
        keyword: "status",
        message:
          "Status indicators are present. If status is communicated by colour alone (e.g. a green dot for online, a red dot for offline), colour blind users receive no information.",
        technical:
          "Pair colour-based status indicators with a text label or icon. For example: \u2022 Online instead of a green dot alone.",
        severity: "warn",
      },
    ],
  },
  autism: {
    name: "Autistic User",
    tone: "pattern-seeking, literal, sensory-alert",
    description:
      "Predictability is not a preference — it is how the interface becomes navigable. When a tooltip appears and vanishes without warning, when a modal interrupts mid-task, when a button says one thing and does another, trust erodes. Sensory sensitivity makes unexpected sound, motion, and visual noise costly. Literal interpretation means that ambiguous labels, idioms, and vague error messages genuinely do not communicate. This profile reflects patterns that many autistic users have described as barriers. It is written with care, and should be read and refined with input from the community it represents.",
    checks: [
      {
        keyword: "animation",
        message:
          "Unexpected animation — especially motion that begins without user action — can be startling and sensory-overwhelming. The barrier here is unpredictability, not seizure risk.",
        technical:
          "Wrap all animations in @media (prefers-reduced-motion: no-preference). Avoid animations that fire on page load or scroll without user interaction.",
        severity: "warn",
      },
      {
        keyword: "autoplay",
        message:
          "Autoplaying video or audio introduces unexpected sensory input. Sound that begins without warning is a significant sensory intrusion. Motion that starts before the user is ready is startling.",
        technical:
          "Never autoplay video or audio. Require explicit user interaction. Ensure a visible, accessible mute/pause control is always present for any media.",
        severity: "warn",
      },
      {
        keyword: "notification",
        message:
          "Unexpected notifications that appear without user action interrupt focus and introduce unpredictable change. Frequent or intrusive notifications can disrupt the flow of a task entirely.",
        technical:
          "Use aria-live regions with polite (not assertive) for non-critical notifications. Limit notification frequency. Allow users to control or disable notifications in settings.",
        severity: "warn",
      },
      {
        keyword: "tooltip",
        message:
          "Tooltips that appear and disappear on hover are unpredictable. Content that was visible is suddenly gone. For users who rely on reading content at their own pace, vanishing information is a barrier.",
        technical:
          "Supplement hover tooltips with persistent inline help text or an accessible toggle. Ensure tooltip content is available through a static mechanism, not hover alone.",
        severity: "info",
      },
      {
        keyword: "modal",
        message:
          "Modals that appear without direct user action break the flow of a task with an unexpected context shift. The page the user was on is still there, but suddenly inaccessible. This kind of interruption can be deeply disorienting.",
        technical:
          "Only open modals in direct response to a user action. Never open a modal on page load or on a timer. Always provide a clearly labelled close button. Return focus to the trigger element on close.",
        severity: "warn",
      },
      {
        keyword: "placeholder",
        message:
          "Placeholder text that disappears when the user starts typing removes the instruction at exactly the moment it is needed. For users who process information sequentially, losing the label mid-task can require stopping to re-read the page.",
        technical:
          "Use persistent <label> elements above or beside inputs. Never rely on placeholder as the only source of field instructions. Placeholder text should supplement, not replace, a label.",
        severity: "warn",
      },
      {
        keyword: "error",
        message:
          "Vague, blaming, or unexpected error messages cause confusion and distress. 'Something went wrong' says nothing. 'Invalid input' says nothing. Ambiguous error messages require inference that may not be straightforward.",
        technical:
          "Write error messages in plain, literal language. State exactly what went wrong and exactly what to do to fix it. Avoid metaphor, sarcasm, or implied meaning. Place the message next to the relevant field.",
        severity: "warn",
      },
      {
        keyword: "countdown",
        message:
          "Time pressure is a significant source of distress for many autistic users. A countdown timer changes the nature of the task from 'do this correctly' to 'do this fast' — and may make completion impossible.",
        technical:
          "Avoid session timeouts and time-limited interactions where possible. If a timer is required, provide an option to extend. Never lose user input on timeout.",
        severity: "warn",
      },
    ],
  },
};

export const profileCache = new Map();

export function getProfileURL(profile) {
  return new URL(`profiles/${profile}.json`, window.location.href).href;
}

export function loadProfile(profile) {
  if (profileCache.has(profile)) {
    return Promise.resolve(profileCache.get(profile));
  }

  const url = getProfileURL(profile);

  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Profile file not found: ${url}`);
      return res.json();
    })
    .then((data) => {
      profileCache.set(profile, data);
      return data;
    })
    .catch((err) => {
      console.warn(
        `Failed to load profile from disk: ${profile}. Using inline fallback if available.`,
        err,
      );
      const fallback = inlineProfiles[profile];
      if (fallback) {
        profileCache.set(profile, fallback);
        return fallback;
      }
      throw err;
    });
}
