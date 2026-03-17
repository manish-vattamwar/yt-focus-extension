// popup.js
// This runs when you click the extension icon and the popup opens.
// It reads your saved settings, updates the toggles, and saves changes.

const shortsToggle = document.getElementById('toggle-shorts');
const recsToggle = document.getElementById('toggle-recommendations');
const rowShorts = document.getElementById('row-shorts');
const rowRecs = document.getElementById('row-recs');

// ─────────────────────────────────────────────
// LOAD SAVED SETTINGS
// ─────────────────────────────────────────────

// When the popup opens, read what was last saved and update the checkboxes.
chrome.storage.sync.get(
  { hideShorts: true, hideRecommendations: true }, // defaults if nothing saved yet
  (settings) => {
    shortsToggle.checked = settings.hideShorts;
    recsToggle.checked = settings.hideRecommendations;

    // Update visual styling of the rows
    updateRowStyle(rowShorts, settings.hideShorts);
    updateRowStyle(rowRecs, settings.hideRecommendations);
  }
);

// ─────────────────────────────────────────────
// HANDLE TOGGLE CHANGES
// ─────────────────────────────────────────────

shortsToggle.addEventListener('change', () => {
  saveAndApply();
});

recsToggle.addEventListener('change', () => {
  saveAndApply();
});

function saveAndApply() {
  const hideShorts = shortsToggle.checked;
  const hideRecommendations = recsToggle.checked;

  // Update row styles
  updateRowStyle(rowShorts, hideShorts);
  updateRowStyle(rowRecs, hideRecommendations);

  // 1. Save to Chrome storage (persists across browser restarts)
  chrome.storage.sync.set({ hideShorts, hideRecommendations });

  // 2. Send a message to content.js on the active tab so it updates immediately
  //    (without needing a page reload)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SETTINGS_UPDATED',
        hideShorts,
        hideRecommendations,
      }).catch(() => {
        // If content script isn't loaded on this tab (e.g., not on YouTube), ignore.
      });
    }
  });
}

// ─────────────────────────────────────────────
// VISUAL HELPER
// ─────────────────────────────────────────────

function updateRowStyle(rowEl, isActive) {
  if (isActive) {
    rowEl.classList.add('active');
  } else {
    rowEl.classList.remove('active');
  }
}
