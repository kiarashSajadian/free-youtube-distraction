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
      // Add null check to prevent errors
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
    // Add null check to prevent errors
    if (element) {
      element.addEventListener("change", function () {
        const setting = {};
        setting[toggle] = this.checked;

        // Save to Chrome storage
        chrome.storage.sync.set(setting, function () {
          // Send message to content script to update without refreshing
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "settingsUpdated",
                  settings: setting,
                });
              }
            }
          );
        });
      });
    }
  });
});
