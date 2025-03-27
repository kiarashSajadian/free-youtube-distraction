// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get all toggle elements
  const toggles = [
    "hideRecommendations",
    "hideComments",
    "hideThumbnails",
    "hideShorts",
    "hideHomeFeed",
  ];

  // Load saved settings
  chrome.storage.sync.get(toggles, function (items) {
    // Apply saved settings to toggle checkboxes
    toggles.forEach(function (toggle) {
      const element = document.getElementById(toggle);
      if (element) {
        element.checked = items[toggle] === true;
      } else {
        console.warn(`Element with ID "${toggle}" not found`);
      }
    });
  });

  // Save settings when toggles change
  toggles.forEach(function (toggle) {
    const element = document.getElementById(toggle);
    if (element) {
      element.addEventListener("change", function () {
        const setting = {};
        setting[toggle] = this.checked;

        // Save to Chrome storage
        chrome.storage.sync.set(setting, function () {
          // Send message to content script without expecting a response
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs[0] && tabs[0].id) {
                try {
                  // Don't expect a response - don't use sendMessage with a callback
                  chrome.tabs.sendMessage(tabs[0].id, {
                    type: "settingsUpdated",
                    settings: setting,
                  });
                } catch (error) {
                  console.error("Error sending message:", error);
                }
              }
            }
          );
        });
      });
    }
  });
});

// If you need to handle incoming messages in the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Important: Always call sendResponse right away or return false
  // Don't return true unless you call sendResponse asynchronously

  if (message.type === "someMessageType") {
    // Handle the message synchronously
    sendResponse({ success: true });
    // Return false to indicate synchronous response
    return false;
  }

  // Always return false if not handling asynchronously
  return false;
});
