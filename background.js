console.log("Background script is running!");

let currentSession = null; // Tracks the current session
let lastCaptureTime = 0; // Tracks the last time a screenshot was taken
let isTracking = false; // Tracks whether goal tracking is active
let currentGoal = ""; // Stores the active goal

// Start or stop tracking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTracking") {
    isTracking = true;
    currentGoal = message.goal;
    console.log(`Goal set: ${currentGoal}`);
    sendResponse({ success: true, goal: currentGoal });
  } else if (message.type === "stopTracking") {
    isTracking = false;
    console.log("Tracking stopped.");
    currentSession = null; // End any ongoing session
    currentGoal = "";
    sendResponse({ success: true });
  } else if (message.type === "getTrackingState") {
    sendResponse({ isTracking, goal: currentGoal });
  }
});

// Detect when a tab is updated (page load or reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isTracking && changeInfo.status === "complete" && tab.url) {
    console.log(`Page changed: ${tab.url}`);
    startSession(tabId, tab.url);
  }
});

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (isTracking) {
    console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
    startSession(tab.id, tab.url || "about:blank");
  }
});

// Detect when the user switches between tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (isTracking) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log(`Switched to tab: TabId = ${activeInfo.tabId}, URL = ${tab.url}`);
      startSession(activeInfo.tabId, tab.url);
    });
  }
});

// Function to start a new session
function startSession(tabId, url) {
  if (currentSession) {
    console.log(`Ending session for TabId = ${currentSession.tabId}, URL = ${currentSession.url}`);
    currentSession = null;
  }

  if (!url || url.startsWith("chrome://") || url.startsWith("about:")) {
    console.log(`Skipping session for restricted or blank URL: ${url}`);
    return;
  }

  currentSession = { tabId, url };
  console.log(`Starting new session for TabId = ${tabId}, URL = ${url}`);

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
  if (now - lastCaptureTime < 1000) {
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
    console.log("Screenshot (base64):", dataUrl.slice(0, 100) + "...");
    // TODO: Send the screenshot to ChatGPT API for analysis
  });
}
