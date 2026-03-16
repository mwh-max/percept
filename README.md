Percept – Accessibility Prompt Feedback Tool

Percept helps people with disabilities and neurodivergent users get clearer, more accurate responses from AI. It reviews a prompt or HTML snippet, identifies wording or structure that may cause confusion, and suggests changes to improve clarity and tone. Feedback is shaped by the lived experience of each profile, not by audit scores or compliance checklists.


Purpose and Audience

Percept is designed for anyone who wants AI output to be more usable and inclusive. It is aimed at people who face cognitive, sensory, or physical barriers that can be amplified by unclear prompts or inaccessible layouts. The goal is to make the technology work for the user, not the other way around.


How It Works

Select a user experience profile from the dropdown. Options include ADHD, dyslexia, screenreader user, low vision, motor disability, and blind user.

Choose a feedback style. Emotional Tone offers narrative, human-centered guidance. Technical provides implementation-specific recommendations.

Paste HTML or write a plain text prompt into the input field and click Analyze. Feedback appears as color-coded cards in the panel to the right. Warning cards highlight patterns that are likely to cause barriers. Informational cards surface considerations worth reviewing.

A tone preview appears beneath the profile selector to give a sense of the experiential lens being applied before feedback is generated.

Use Copy Feedback to copy all results to your clipboard.


Profiles

Each profile reflects a distinct set of interaction patterns and barriers. Feedback is matched to keywords found in the pasted markup or prompt.

Person with ADHD. Feedback addresses attention capture, pacing, visual noise, and executive function demands such as disappearing labels, autoplaying media, and timed interactions.

Person with dyslexia. Feedback addresses font choice, line spacing, text alignment, and structural clarity that affect decoding and reading rhythm.

Screenreader user. Feedback addresses alt text, heading order, ARIA roles, and tab focus behavior as they affect linear, audio-based navigation.

Person with low vision. Feedback addresses color contrast, font sizing, and zoom behavior.

Person with a motor disability. Feedback addresses touch target size, hover-only interactions, and drag-and-drop patterns that require fine motor precision.

Blind user. Feedback addresses structural semantics, form labeling, table headers, SVG descriptions, iframe titles, and aria-hidden misuse as they affect users who navigate entirely without visual reference.


Terminology

Percept uses person-first language throughout to center human experience rather than condition. Motor disability includes users affected by dexterity, precision, or mobility constraints, including those who use adaptive tools or keyboard-only navigation. Screenreader user highlights the interaction method rather than an ability level. Blind user and low vision are treated as distinct profiles because the barriers and strategies differ meaningfully between them.

Percept avoids diagnostic framing, euphemism, and audit tone. Feedback is shaped by clarity, care, and intent.


Built With

HTML, CSS, and vanilla JavaScript. Profile data stored in local JSON files. Keyword detection against normalized input. Structured card rendering with distinct warning and informational states. Debounced live analysis as the user types. Grid-based responsive layout.


What Is Still Planned

Expanded keyword coverage across all profiles. Additional profile dimensions such as cognitive load sensitivity and vestibular sensitivity. Local storage of session input for continued refinement across page reloads. Grouped feedback organized by interface domain such as navigation, typography, and forms.


License

Mozilla Public License 2.0 (MPL 2.0). This encourages thoughtful modification and reuse while preserving the tone, structure, and inclusive intention of the original work.
