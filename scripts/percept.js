document.getElementById('analyze').addEventListener('click', () => {
  const profile = document.getElementById('profile').value;
  const markup = document.getElementById('markup').value.trim();
  const cleanMarkup = markup.toLowerCase().replace(/\s+/g, ' ');
  const feedbackBox = document.getElementById('feedback-output');
  const profileData = feedbackMap[profile];

  if (!profile || !markup) {
    feedbackBox.textContent = "Please select a profile and paste HTML to continue.";
    return;
  }

  if (!profileData) {
    feedbackBox.textContent = "Profile not recognized. Please select a valid profile.";
    return;
  }

  let feedbackText = "";

profileData.checks.forEach(check => {
  if (cleanMarkup.includes(check.keyword)) {
    feedbackText += `• ${check.message}\n`;
  }
});

if (!feedbackText) {
  feedbackText = "No profile-specific traits detected in this layout. Try pasting more HTML or explore a different profile.";
}

  feedbackBox.textContent = feedbackText;
});

const feedbackMap = {
  adhd: {
    checks: [
      {
        keyword: 'card',
        message: 'Cards help contain content, but too many at once may overwhelm visual flow. Try grouping or spacing out stimuli.'
      },
      {
        keyword: 'animation',
        message: 'Motion can be engaging, but rapid or looping animations may fragment attention. Use with purpose and restraint.'
      }
    ]
  },
  screenreader: {
    checks: [
      {
        keyword: 'aria-hidden',
        message: 'Be careful with aria-hidden. It may hide important content from assistive tech. Ensure intent is clear.'
      },
      {
        keyword: 'div',
        message: 'Using too many <div> tags without semantic headings can make navigation unclear. Add meaning where possible.'
      }
    ]
  },
  lowvision: {
    checks: [
      {
        keyword: 'color:',
        message: 'Color is often relied on, but contrast matters more. Ensure text is legible in all lighting environments.'
      },
      {
        keyword: 'font-size',
        message: 'Small text can vanish in low vision contexts. Consider default sizing and allow zoom without breakage.'
      }
    ]
  },

  motor: {
  checks: [
    {
      keyword: 'hover',
      message: 'Hover-only interactions can block access for users who rely on keyboard or voice input. Ensure all actions are reachable without a mouse.'
    },
    {
      keyword: 'button',
      message: 'Small buttons may be hard to click. Increase target size and spacing to reduce accidental taps.'
    },
    {
      keyword: 'drag',
      message: 'Drag-and-drop interfaces require fine motor control. Offer alternative actions like “Move Up” or “Add Below” buttons.'
    }
  ]
},

dyslexia: {
  checks: [
    {
      keyword: 'font-family',
      message: 'Consider using dyslexia-friendly fonts like Lexend or OpenDyslexic. Avoid cursive or overly stylized typefaces.'
    },
    {
      keyword: 'line-height',
      message: 'Adequate line spacing improves readability. Aim for at least 1.5x the font size.'
    },
    {
      keyword: 'justify',
      message: 'Justified text can create uneven spacing. Left-align for consistent rhythm.'
    }
  ]
}
};
