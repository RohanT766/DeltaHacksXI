console.log("Background script is running!");

let currentSession = null; // Tracks the current session
let lastCaptureTime = 0; // Tracks the last time a screenshot was taken

// Detect when a tab is updated (page load or reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log(`Page changed: ${tab.url}`);
    startSession(tabId, tab.url);
  }
});

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
  startSession(tab.id, tab.url || "about:blank");
});

// Detect when the user switches between tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(`Switched to tab: TabId = ${activeInfo.tabId}, URL = ${tab.url}`);
    startSession(activeInfo.tabId, tab.url);
  });
});

// Function to start a new session
function startSession(tabId, url) {
  // End the current session if it exists
  if (currentSession) {
    console.log(`Ending session for TabId = ${currentSession.tabId}, URL = ${currentSession.url}`);
    currentSession = null;
  }

  // Check if the URL is restricted or blank
  if (!url || url.startsWith("chrome://") || url.startsWith("about:")) {
    console.log(`Skipping session for restricted or blank URL: ${url}`);
    return;
  }

  // Start a new session
  currentSession = { tabId, url };
  console.log(`Starting new session for TabId = ${tabId}, URL = ${url}`);

  // Delay the screenshot by 1 second for the new session
  setTimeout(() => {
    if (currentSession && currentSession.tabId === tabId) {
      takeScreenshot(url);
    } else {
      console.log("Session ended before screenshot could be taken.");
    }
  }, 1000);
}

// Function to take a screenshot with error handling
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

    // TODO: Send the screenshot to ChatGPT API for analysis
  });
}
