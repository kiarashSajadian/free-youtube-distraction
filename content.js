// Global settings object
let settings = {
  "toggle-sidebar": true,
  "toggle-comments": true,
  "toggle-endscreen": true,
  "toggle-notifications": true,
  "toggle-homepage": true,
};

// Function to load settings from storage
function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(Object.keys(settings), function (result) {
      // Update settings with stored values, keeping defaults for any missing values
      Object.keys(settings).forEach((key) => {
        if (result[key] !== undefined) {
          settings[key] = result[key];
        }
      });
      resolve(settings);
    });
  });
}

// Main function to remove distractions based on settings
function removeDistractions() {
  // Only apply if we're on a YouTube page
  if (!window.location.hostname.includes("youtube.com")) return;

  // Handle video page elements
  if (window.location.pathname.includes("/watch")) {
    // Hide sidebar recommendations
    if (settings["toggle-sidebar"]) {
      const sidebar = document.querySelector("#secondary");
      if (sidebar) sidebar.style.display = "none";
    } else {
      const sidebar = document.querySelector("#secondary");
      if (sidebar) sidebar.style.display = "";
    }

    // Hide comments
    if (settings["toggle-comments"]) {
      const comments = document.querySelector("#comments");
      if (comments) comments.style.display = "none";
    } else {
      const comments = document.querySelector("#comments");
      if (comments) comments.style.display = "";
    }

    // Hide end screen suggestions
    if (settings["toggle-endscreen"]) {
      const endScreen = document.querySelector(".ytp-endscreen-content");
      if (endScreen) endScreen.style.display = "none";
    } else {
      const endScreen = document.querySelector(".ytp-endscreen-content");
      if (endScreen) endScreen.style.display = "";
    }
  }

  // Handle general elements (present on all YouTube pages)
  if (settings["toggle-notifications"]) {
    const notifications = document.querySelectorAll(
      ".ytd-notification-topbar-button-renderer"
    );
    notifications.forEach((notification) => {
      notification.style.display = "none";
    });
  } else {
    const notifications = document.querySelectorAll(
      ".ytd-notification-topbar-button-renderer"
    );
    notifications.forEach((notification) => {
      notification.style.display = "";
    });
  }

  // Simplify homepage
  if (settings["toggle-homepage"] && window.location.pathname === "/") {
    const recommendations = document.querySelector(
      'ytd-browse[page-subtype="home"]'
    );
    if (recommendations) {
      const contentSections = recommendations.querySelectorAll(
        "ytd-rich-grid-renderer"
      );
      contentSections.forEach((section) => {
        section.style.display = "none";
      });
    }
  } else if (window.location.pathname === "/") {
    const recommendations = document.querySelector(
      'ytd-browse[page-subtype="home"]'
    );
    if (recommendations) {
      const contentSections = recommendations.querySelectorAll(
        "ytd-rich-grid-renderer"
      );
      contentSections.forEach((section) => {
        section.style.display = "";
      });
    }
  }
}

// Initialize and set up observers
async function initialize() {
  // Load settings first
  await loadSettings();

  // Apply initial changes
  removeDistractions();

  // Set up DOM change observer
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length || mutation.type === "attributes") {
        shouldUpdate = true;
        break;
      }
    }

    if (shouldUpdate) {
      removeDistractions();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  // Listen for YouTube SPA navigation
  if (window.yt && window.yt.config_) {
    document.addEventListener("yt-navigate-finish", function () {
      removeDistractions();
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateSettings") {
    // Update our local settings
    Object.assign(settings, message.settings);

    // Apply changes immediately
    removeDistractions();

    // Acknowledge
    sendResponse({ status: "settings updated" });
  }
});

// Start the extension
initialize();
