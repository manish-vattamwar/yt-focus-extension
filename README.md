# YT Focus Mode — Chrome Extension

A Chrome extension that hides YouTube Shorts and video recommendations,
with toggles to turn each feature on/off.

---

## File Structure

```
yt-focus-extension/
├── manifest.json   ← Extension's "ID card" — Chrome reads this first
├── content.js      ← Injected into YouTube — does the actual hiding
├── popup.html      ← The UI that appears when you click the icon
├── popup.js        ← Logic for the toggles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## How the Code Works (plain English)

### manifest.json
Tells Chrome:
- What the extension is called
- What websites it can run on (`youtube.com`)
- Which JS file to inject (`content.js`)
- Which file is the popup (`popup.html`)
- What permissions it needs (`storage` to save settings)

### content.js
- Runs automatically on every YouTube page
- Creates a `<style>` tag and injects CSS to hide elements
- Uses YouTube's internal HTML class names as CSS selectors
- Watches for URL changes (YouTube is an SPA — it doesn't reload pages)
- Listens for messages from popup.js to update instantly

### popup.html + popup.js
- Shows when you click the extension icon
- Reads saved settings from `chrome.storage.sync`
- When you flip a toggle, it saves the new setting AND sends a message
  to content.js so the page updates without a reload

---

## Troubleshooting

**Shorts still showing?**
YouTube sometimes changes their HTML class names. Open DevTools (F12)
on YouTube, right-click a Shorts shelf → Inspect, and find the new
class name, then update `SHORTS_SELECTORS` in content.js.

**Extension not loading?**
Check for errors in `chrome://extensions` — there's an "Errors" button
on the extension card.

**Changes not taking effect?**
After editing any file, go to `chrome://extensions` and click the
refresh icon on the extension card, then reload YouTube.
