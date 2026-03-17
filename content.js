// content.js
// This script is automatically injected into every YouTube page.
// It reads your toggle settings from Chrome storage and hides/shows elements accordingly.

// ─────────────────────────────────────────────
// CSS SELECTORS — what we're hiding
// ─────────────────────────────────────────────

// Shorts shelf on the homepage and subscriptions page
const SHORTS_SELECTORS = [
  'ytd-rich-shelf-renderer[is-shorts]',
  'ytd-reel-shelf-renderer',
  '[is-shorts]',
].join(', ');

// Recommendations shown on the right side while watching a video
const RECOMMENDATIONS_SELECTORS = [
  '#secondary',
].join(', ');

// ─────────────────────────────────────────────
// INJECT STYLES
// ─────────────────────────────────────────────

const styleTag = document.createElement('style');
styleTag.id = 'yt-focus-mode-styles';
document.head.appendChild(styleTag);

function hideSidebarShorts() {
  // YouTube no longer uses href="/shorts", so we find it by text content
  const guideEntries = document.querySelectorAll('ytd-guide-entry-renderer');
  guideEntries.forEach(entry => {
    const label = entry.querySelector('yt-formatted-string');
    if (label && label.textContent.trim() === 'Shorts') {
      entry.style.display = 'none';
    }
  });
}

function applyStyles(hideShorts, hideRecommendations) {
  let css = '';

  if (hideShorts) {
    css += `${SHORTS_SELECTORS} { display: none !important; }\n`;
  } else {
    // Restore sidebar entries if toggle is turned OFF
    document.querySelectorAll('ytd-guide-entry-renderer').forEach(entry => {
      entry.style.display = '';
    });
  }

  if (hideRecommendations) {
    // Only hide recommendations on the watch page
    if (window.location.pathname === '/watch') {
      css += `${RECOMMENDATIONS_SELECTORS} { display: none !important; }\n`;
      css += `#primary { max-width: 100% !important; }\n`;
    }
  }

  styleTag.textContent = css;

  // Hide sidebar Shorts via JS (CSS alone can't match by text content)
  if (hideShorts) {
    hideSidebarShorts();
    // Retry after delays because YouTube re-renders sidebar slowly
    setTimeout(hideSidebarShorts, 1000);
    setTimeout(hideSidebarShorts, 2000);
  }
}

// ─────────────────────────────────────────────
// READ SETTINGS & APPLY
// ─────────────────────────────────────────────

function loadAndApply() {
  chrome.storage.sync.get(
    { hideShorts: true, hideRecommendations: true },
    (settings) => {
      applyStyles(settings.hideShorts, settings.hideRecommendations);
    }
  );
}

// Run immediately when the page loads
loadAndApply();

// ─────────────────────────────────────────────
// HANDLE YOUTUBE'S SPA NAVIGATION
// ─────────────────────────────────────────────

let lastUrl = location.href;

const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(loadAndApply, 500);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// ─────────────────────────────────────────────
// LISTEN FOR CHANGES FROM THE POPUP
// ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SETTINGS_UPDATED') {
    applyStyles(message.hideShorts, message.hideRecommendations);
  }
});
