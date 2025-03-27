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
        // Wrap in try-catch to handle potential errors
        try {
          chrome.tabs.sendMessage(
            tab.id,
            {
              action: "updateSettings",
              settings: changedSettings,
            },
            (response) => {
              // Check for error in the response
              const lastError = chrome.runtime.lastError;
              if (lastError) {
                console.log(
                  `Could not send message to tab ${tab.id}: ${lastError.message}`
                );
                // No need to do anything, this is expected for tabs without our content script
              }
            }
          );
        } catch (err) {
          console.log(`Error messaging tab ${tab.id}: ${err.message}`);
        }
      });
    });
  }
});
