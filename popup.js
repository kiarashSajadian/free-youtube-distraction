document.addEventListener("DOMContentLoaded", function () {
  // Define the distraction elements we can toggle
  const toggleOptions = [
    "toggle-sidebar",
    "toggle-comments",
    "toggle-endscreen",
    "toggle-notifications",
    "toggle-homepage",
  ];

  // Load saved preferences
  chrome.storage.sync.get(toggleOptions, function (result) {
    // Set checkboxes based on saved preferences, defaulting to checked if not set
    toggleOptions.forEach((option) => {
      const checkbox = document.getElementById(option);
      // If preference exists, use it; otherwise default to checked (true)
      checkbox.checked = result[option] !== undefined ? result[option] : true;

      // Add change listener to save preferences
      checkbox.addEventListener("change", function () {
        const setting = {};
        setting[option] = checkbox.checked;

        // Save to Chrome storage
        chrome.storage.sync.set(setting);

        // Send message to content script to update without reload
        chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(
              tab.id,
              {
                action: "updateSettings",
                settings: { [option]: checkbox.checked },
              },
              (response) => {
                // Handle error silently - this happens when tab doesn't have content script
                const lastError = chrome.runtime.lastError;
                if (lastError) {
                  console.log(
                    `Message to tab ${tab.id} failed: ${lastError.message}`
                  );
                  // This is expected for tabs without our content script loaded
                }
              }
            );
          });
        });
      });
    });
  });
});
