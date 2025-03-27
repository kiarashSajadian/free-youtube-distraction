// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Define all toggle elements
  const toggles = [
    "hideRecommendations",
    "hideComments",
    "hideThumbnails",
    "hideShorts",
    "hideHomeFeed",
  ];

  // Debug helper
  function logStatus(message) {
    console.log(`[YouTube Distraction Free] ${message}`);
  }

  // Load saved settings from storage
  chrome.storage.sync.get(toggles, function (items) {
    logStatus("Loading saved settings");
    console.log("Saved settings:", items);

    // Apply saved settings to toggle checkboxes
    toggles.forEach(function (toggle) {
      const element = document.getElementById(toggle);
      if (element) {
        // Default to checked if setting doesn't exist yet
        element.checked = items[toggle] !== false;
        logStatus(`Setting ${toggle} to ${element.checked}`);
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

        logStatus(`Toggle changed: ${toggle} = ${this.checked}`);

        // Save to Chrome storage
        chrome.storage.sync.set(setting, function () {
          logStatus(`Saved setting: ${toggle} = ${setting[toggle]}`);

          // Send message to content script
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs[0] && tabs[0].id) {
                try {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    type: "settingsUpdated",
                    setting: toggle,
                    value: setting[toggle],
                  });
                  logStatus(`Sent update message for ${toggle}`);
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

  // Add a reset button functionality if needed
  const resetButton = document.getElementById("resetSettings");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      // Create default settings (all enabled)
      const defaultSettings = {};
      toggles.forEach((toggle) => (defaultSettings[toggle] = true));

      // Save default settings
      chrome.storage.sync.set(defaultSettings, function () {
        logStatus("Reset all settings to defaults");

        // Update UI
        toggles.forEach(function (toggle) {
          const element = document.getElementById(toggle);
          if (element) {
            element.checked = true;
          }
        });

        // Notify content script
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs[0] && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: "settingsReset",
                settings: defaultSettings,
              });
            }
          }
        );
      });
    });
  }
});
