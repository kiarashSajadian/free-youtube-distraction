// YouTube Distraction Free Content Script

// CSS selectors for different YouTube elements
const selectors = {
  hideRecommendations: [
    "ytd-watch-next-secondary-results-renderer", // Video recommendations sidebar
    ".ytp-ce-element", // End screen recommendations
  ],
  hideComments: [
    "ytd-comments", // Comment section
  ],
  hideThumbnails: [
    ".ytd-thumbnail:not(.ytd-video-preview)", // Thumbnails except in player
    ".ytd-playlist-thumbnail", // Playlist thumbnails
  ],
  hideShorts: [
    "ytd-rich-section-renderer", // Shorts section on home
    "ytd-reel-shelf-renderer", // Another shorts element
    "ytd-shorts", // Shorts in search results
  ],
  hideHomeFeed: [
    "ytd-rich-grid-renderer", // Main home feed grid
    'ytd-two-column-browse-results-renderer:not([page-subtype="channels"])', // Feed but not on channel pages
  ],
};

// Settings state
let settings = {};

// Helper to log status
function logStatus(message) {
  console.log(`[YouTube Distraction Free] ${message}`);
}

// Function to load settings
function loadSettings() {
  return new Promise((resolve) => {
    // Get all possible settings
    const allSettings = Object.keys(selectors);

    chrome.storage.sync.get(allSettings, (items) => {
      // If items is empty, use defaults (all features enabled)
      if (Object.keys(items).length === 0) {
        const defaultSettings = {};
        allSettings.forEach((setting) => (defaultSettings[setting] = true));

        // Save defaults to storage
        chrome.storage.sync.set(defaultSettings, () => {
          logStatus("Initialized default settings");
          settings = defaultSettings;
          resolve(settings);
        });
      } else {
        logStatus("Loaded saved settings");
        settings = items;
        resolve(settings);
      }
    });
  });
}

// Apply settings to page
function applySettings() {
  // First remove any existing style element
  const existingStyle = document.getElementById(
    "youtube-distraction-free-styles"
  );
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element
  const style = document.createElement("style");
  style.id = "youtube-distraction-free-styles";

  // Build CSS based on current settings
  let css = "";

  Object.keys(selectors).forEach((setting) => {
    // If setting is enabled (true), add CSS to hide elements
    if (settings[setting] === true) {
      selectors[setting].forEach((selector) => {
        css += `${selector} { display: none !important; }\n`;
      });
      logStatus(`Applied: ${setting}`);
    } else {
      logStatus(`Not applied: ${setting}`);
    }
  });

  // Add the CSS to the style element
  style.textContent = css;

  // Add style to document
  document.head.appendChild(style);
  logStatus("Applied styles to page");
}

// Initialize the extension
async function initialize() {
  // Load settings
  await loadSettings();

  // Apply settings
  applySettings();

  // Watch for DOM changes to reapply settings (for dynamic content)
  const observer = new MutationObserver(() => {
    applySettings();
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  logStatus("Initialized extension and watching for DOM changes");
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle settings updates
  if (message.type === "settingsUpdated") {
    logStatus(`Received setting update: ${message.setting} = ${message.value}`);

    // Update our settings object
    settings[message.setting] = message.value;

    // Reapply settings
    applySettings();

    // No async response needed
    sendResponse({ success: true });
    return false;
  }

  // Handle settings reset
  if (message.type === "settingsReset") {
    logStatus("Received settings reset");

    // Update all settings
    settings = message.settings;

    // Reapply settings
    applySettings();

    // No async response needed
    sendResponse({ success: true });
    return false;
  }

  return false;
});

// Run the extension
initialize();
