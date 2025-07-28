document.getElementById('analyze').addEventListener('click', () => {
  const profile = document.getElementById('profile').value;
  const markup = document.getElementById('markup').value.trim().toLowerCase().replace(/\s+/g, ' ');
  const feedbackBox = document.getElementById('feedback-output');

  if (!profile || !markup) {
    feedbackBox.textContent = "Please select a profile and paste HTML to continue.";
    return;
  }

console.log('Trying to load:', `profiles/${profile}.json`);

  fetch(`profiles/${profile}.json`)
    .then(res => {
      if (!res.ok) throw new Error("Profile file not found.");
      return res.json();
    })
    .then(profileData => {
      const checks = profileData.checks || [];
      let feedbackText = "";

      checks.forEach(check => {
        if (markup.includes(check.keyword)) {
          const style = document.getElementById('style-toggle').value;
          const msg = style === 'technical' ? check.technical || check.message : check.message;
            feedbackText += `• ${msg}\n`;
        }
      });

      if (!feedbackText) {
        feedbackText = "No profile-specific traits detected in this layout. Try pasting more HTML or explore a different profile.";
      }

document.getElementById('copy-feedback').addEventListener('click', () => {
  const feedbackText = document.getElementById('feedback-output').textContent;
  navigator.clipboard.writeText(feedbackText)
    .then(() => alert("Feedback copied to clipboard."))
    .catch(() => alert("Copy failed. Please try again."));
});

let debounceTimer;

document.getElementById('markup').addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    document.getElementById('analyze').click();
  }, 600);
});

profileSelect.addEventListener('mouseout', () => {
  tonePreview.textContent = '';
});

      feedbackBox.textContent = feedbackText;
    })
    .catch(err => {
      feedbackBox.textContent = "Error loading profile data. Please check the profile name or file.";
      console.error(err);
    });
});

const profileSelect = document.getElementById('profile');
const tonePreview = document.getElementById('tone-preview');

profileSelect.addEventListener('change', () => {
  const selectedOption = profileSelect.options[profileSelect.selectedIndex];
  const tone = selectedOption.dataset.tone || '';
  tonePreview.textContent = tone ? `Tone preview: ${tone}` : '';
});