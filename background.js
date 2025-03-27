// Initialize default settings on install
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.storage.sync.set({
      "toggle-sidebar": true,
      "toggle-comments": true,
      "toggle-endscreen": true,
      "toggle-notifications": true,
      "toggle-homepage": true,
    });
  }
});

// Listen for changes in settings to broadcast to any open tabs
chrome.storage.onChanged.addListener(function (changes) {
  const changedSettings = {};

  for (const [key, { newValue }] of Object.entries(changes)) {
    changedSettings[key] = newValue;
  }

  // Only send message if we have relevant changes
  if (Object.keys(changedSettings).length > 0) {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateSettings",
            settings: changedSettings,
          })
          .catch(() => {
            // Ignore errors from disconnected tabs
          });
      });
    });
  }
});
