console.log("Background script is running!");

let lastCaptureTime = 0;

// Detect when a tab is updated (page load or reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log(`Page changed: ${tab.url}`);
    setTimeout(() => takeScreenshot(tab.url), 1000); // 1-second delay
  }
});

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
  setTimeout(() => takeScreenshot(tab.url || "about:blank"), 1000); // 1-second delay
});

// Detect when the user switches between tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(`Switched to tab: TabId = ${activeInfo.tabId}, URL = ${tab.url}`);
    setTimeout(() => takeScreenshot(tab.url), 1000); // 1-second delay
  });
});

// Function to take a screenshot with rate-limiting and error handling
function takeScreenshot(url) {
  const now = Date.now();
  if (now - lastCaptureTime < 1000) { // 1-second cooldown
    console.warn("Skipping screenshot to avoid exceeding rate limit.");
    return;
  }
  lastCaptureTime = now;

  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
      return;
    }
    console.log(`Screenshot taken for ${url}`);
    console.log("Screenshot (base64):", dataUrl.slice(0, 100) + "..."); // Log only the start for brevity
  });
}
