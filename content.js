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
  'ytd-guide-entry-renderer:has(a[href="/shorts"])',      // ← fixed
  'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])'  // ← fixed
].join(', ');
```

---

## What changed and why?

| Before | After |
|---|---|
| `ytd-guide-entry-renderer a[href="/shorts"]` | `ytd-guide-entry-renderer:has(a[href="/shorts"])` |

The `:has()` is a CSS selector that means **"select the parent element IF it contains this child".**

So instead of hiding just the `<a>` link inside, you're now hiding the **entire `ytd-guide-entry-renderer` block** — which is the whole sidebar item including its icon and text.

Think of it like this:
```
ytd-guide-entry-renderer        ← this is the whole sidebar row (hide THIS)
  └── a[href="/shorts"]         ← this is just the link inside (you were hiding this)
        └── "Shorts" text + icon

// Recommendations shown on the right side while watching a video
const RECOMMENDATIONS_SELECTORS = [
  '#secondary',                        // The entire right-side panel on watch page
].join(', ');

// ─────────────────────────────────────────────
// INJECT STYLES
// ─────────────────────────────────────────────

// We create a <style> tag and inject it into the page.
// This is more reliable than setting display:none on each element individually
// because YouTube is a Single Page App — it constantly re-renders elements.

const styleTag = document.createElement('style');
styleTag.id = 'yt-focus-mode-styles';
document.head.appendChild(styleTag);

function applyStyles(hideShorts, hideRecommendations) {
  let css = '';

  if (hideShorts) {
    css += `${SHORTS_SELECTORS} { display: none !important; }\n`;
  }

  if (hideRecommendations) {
    // Only hide recommendations on the watch page (URL contains /watch)
    // We do this check in JS so we don't break the homepage layout
    if (window.location.pathname === '/watch') {
      css += `${RECOMMENDATIONS_SELECTORS} { display: none !important; }\n`;
      // Expand the video player to fill the space
      css += `#primary { max-width: 100% !important; }\n`;
    }
  }

  styleTag.textContent = css;
}

// ─────────────────────────────────────────────
// READ SETTINGS & APPLY
// ─────────────────────────────────────────────

function loadAndApply() {
  // chrome.storage.sync stores data in Chrome (synced across devices)
  chrome.storage.sync.get(
    { hideShorts: true, hideRecommendations: true }, // default values
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

// YouTube doesn't do full page reloads when you click around — it's a
// Single Page Application (SPA). So we need to re-apply our styles
// every time the URL changes (e.g., going from home to a video).

let lastUrl = location.href;

const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Small delay to let YouTube render the new page content
    setTimeout(loadAndApply, 500);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// ─────────────────────────────────────────────
// LISTEN FOR CHANGES FROM THE POPUP
// ─────────────────────────────────────────────

// When you flip a toggle in popup.js, it sends a message here.
// We listen for it and immediately re-apply styles without a page reload.

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SETTINGS_UPDATED') {
    applyStyles(message.hideShorts, message.hideRecommendations);
  }
});
