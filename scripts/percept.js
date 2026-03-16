// ─── Element references ────────────────────────────────────────────────────
const profileSelect  = document.getElementById('profile');
const styleToggle    = document.getElementById('style-toggle');
const markupInput    = document.getElementById('markup');
const feedbackBox    = document.getElementById('feedback-output');
const tonePreview    = document.getElementById('tone-preview');
const analyzeBtn     = document.getElementById('analyze');
const copyBtn        = document.getElementById('copy-feedback');

// ─── Tone preview on profile change ────────────────────────────────────────
profileSelect.addEventListener('change', () => {
  const selected = profileSelect.options[profileSelect.selectedIndex];
  const tone = selected.dataset.tone || '';
  tonePreview.textContent = tone ? `Tone: ${tone}` : '';
});

// ─── Debounced live analysis as user types ──────────────────────────────────
let debounceTimer;
markupInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => analyzeBtn.click(), 600);
});

// ─── Copy feedback to clipboard ────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
  const text = feedbackBox.innerText;
  if (!text.trim()) {
    alert("No feedback to copy yet.");
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => alert("Feedback copied to clipboard."))
    .catch(() => alert("Copy failed. Please try again."));
});

// ─── Render feedback as structured HTML cards ───────────────────────────────
function renderFeedback(checks, markup, style) {
  feedbackBox.innerHTML = '';

  const matched = checks.filter(check => check.keyword && markup.includes(check.keyword));

  if (matched.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'result-info';
    empty.textContent = "No profile-specific traits detected in this markup. Try pasting more HTML or explore a different profile.";
    feedbackBox.appendChild(empty);
    return;
  }

  matched.forEach(check => {
    const card = document.createElement('p');
    // Checks with a 'technical' field are treated as warnings; others are informational
    const isTechnical = style === 'technical' && check.technical;
    card.className = isTechnical ? 'result-warn' : 'result-info';
    card.textContent = isTechnical ? check.technical : check.message;
    feedbackBox.appendChild(card);
  });
}

// ─── Main analyze handler ───────────────────────────────────────────────────
analyzeBtn.addEventListener('click', () => {
  const profile = profileSelect.value;
  const markup  = markupInput.value.trim().toLowerCase().replace(/\s+/g, ' ');
  const style   = styleToggle.value;

  if (!profile || !markup) {
    feedbackBox.innerHTML = '<p class="result-info">Please select a profile and paste HTML to continue.</p>';
    return;
  }

  fetch(`profiles/${profile}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Profile file not found: profiles/${profile}.json`);
      return res.json();
    })
    .then(profileData => {
      const checks = profileData.checks || [];
      renderFeedback(checks, markup, style);
    })
    .catch(err => {
      feedbackBox.innerHTML = '<p class="result-warn">Error loading profile data. Please check the file path or profile name.</p>';
      console.error(err);
    });
});
