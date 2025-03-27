// Main extension logic
(function () {
  // Extension state
  let isEnabled = true;

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement("button");
    button.textContent = isEnabled ? "Show Distractions" : "Hide Distractions";
    button.className = "distraction-free-toggle";

    button.addEventListener("click", () => {
      isEnabled = !isEnabled;
      button.textContent = isEnabled
        ? "Show Distractions"
        : "Hide Distractions";
      toggleDistractionFreeMode(isEnabled);
      saveState(isEnabled);
    });

    document.body.appendChild(button);
    return button;
  }

  // Function to toggle distraction-free mode
  function toggleDistractionFreeMode(enabled) {
    document.body.classList.toggle("distraction-free-mode", enabled);

    // Toggle CSS classes or styles directly
    const elementsToHide = [
      "#secondary", // Sidebar
      "#comments", // Comments section
      "ytd-rich-grid-renderer", // Homepage recommendations
      ".ytp-endscreen-content", // Endscreen recommendations
    ];

    elementsToHide.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.display = enabled ? "none" : "";
      });
    });
  }

  // Save state to Chrome storage
  function saveState(state) {
    chrome.storage.sync.set({ distractionFreeEnabled: state });
  }

  // Load saved state from Chrome storage
  function loadState(callback) {
    chrome.storage.sync.get("distractionFreeEnabled", (data) => {
      isEnabled =
        data.distractionFreeEnabled !== undefined
          ? data.distractionFreeEnabled
          : true;
      callback(isEnabled);
    });
  }

  // Initialize the extension
  function init() {
    loadState((enabled) => {
      toggleDistractionFreeMode(enabled);
      createToggleButton();
    });
  }

  // Wait for the page to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Handle YouTube's SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => {
        toggleDistractionFreeMode(isEnabled);
      }, 1000); // Delay to ensure YouTube's UI has updated
    }
  }).observe(document, { subtree: true, childList: true });
})();
