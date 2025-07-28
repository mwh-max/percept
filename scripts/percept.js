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
          feedbackText += `• ${check.message}\n`;
        }
      });

      if (!feedbackText) {
        feedbackText = "No profile-specific traits detected in this layout. Try pasting more HTML or explore a different profile.";
      }

      feedbackBox.textContent = feedbackText;
    })
    .catch(err => {
      feedbackBox.textContent = "Error loading profile data. Please check the profile name or file.";
      console.error(err);
    });
});
