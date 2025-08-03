// Function to handle profile selection change
function handleProfileSelection(event) {
  const profile = event.target;
  const tone = profile.options[profile.selectedIndex].dataset.tone;
  updateTonePreview(tone);
  const markup = document.getElementById("markup").value;
  generateFeedback(profile, markup);
}

// Function to update tone preview
function updateTonePreview(tone) {
  const tonePreview = document.getElementById("tone-preview");
  tonePreview.textContent = `Tone: ${tone}`;
}

// Function to validate inputs before feedback generation
function validateInputs(profile, markup) {
  if (!profile || !markup.trim()) {
    alert("Please select a profile and input valid HTML.");
    return false;
  }
  return true;
}

// Function to generate feedback based on profile and markup
function generateFeedback(profile, markup) {
  if (!validateInputs(profile, markup)) return;

  try {
    const feedback = analyzeMarkup(markup, profile);
    displayFeedback(feedback);
  } catch (error) {
    console.error("Error generating feedback:", error);
    alert("An error occurred. Please try again.");
  }
}

// Function to analyze markup based on profile
function analyzeMarkup(markup, profile) {
  // Placeholder logic for analyzing HTML markup
  return `Feedback for profile: ${profile.value} with markup: ${markup}`;
}

// Function to display the generated feedback
function displayFeedback(feedback) {
  const feedbackOutput = document.getElementById("feedback-output");
  feedbackOutput.textContent = feedback;
}

// Event listener for profile selection
document
  .getElementById("profile")
  .addEventListener("change", handleProfileSelection);
