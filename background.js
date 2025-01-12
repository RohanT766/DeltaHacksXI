console.log("Background script is running!");

let currentSession = null; // Tracks the current session
let lastCaptureTime = 0;   // Tracks the last time a screenshot was taken
let isTracking = false;    // Tracks whether goal tracking is active
let currentGoal = "";      // Stores the active goal
// ----------------------------------
// 1. Insert your OpenAI API key here
//    or fetch it securely from elsewhere.
// ----------------------------------
const OPENAI_API_KEY = "placeholder";

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

  // Ignore restricted or blank URLs
  if (!url || url.startsWith("chrome://") || url.startsWith("about:")) {
    console.log(`Skipping session for restricted or blank URL: ${url}`);
    return;
  }

  currentSession = { tabId, url };
  console.log(`Starting new session for TabId = ${tabId}, URL = ${url}`);

  // Take a screenshot after a short delay
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
  // Avoid taking screenshots too frequently
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

    // ------------------------------------------------
    // 2. Send screenshot (Base64) to OpenAI for analysis
    // ------------------------------------------------
    analyzeScreenshotWithOpenAI(dataUrl, currentGoal);
  });
}

/**
 * Calls the OpenAI API to analyze the screenshot in relation to the current goal.
 * Logs the number from 1-100 representing the confidence that the user is off-task.
 */
function analyzeScreenshotWithOpenAI(base64Screenshot, goal) {
  // Construct the prompt as required
  const prompt = `
Given to you is a screenshot of the user’s current activity on Chrome. Your job is to determine the current productiveness of the user based off of the content they are viewing, and more specifically the relevance to their stated goal in this work/study session: “${goal}”. You must be harsh, but not overly harsh. Take for example if the user’s goal is to study calculus and the screenshot shows them watching a video about F1 or texting about video games on Instagram, you may be confident in your assertion that the content on screen is unproductive and irrelevant. You must return a number from 1-100 representing the percentage of confidence you have that the user is off task. Reply with only that number and nothing else.
`;

  // Prepare request for OpenAI Chat Completion (GPT-3.5, GPT-4, etc.)
  fetch("http://localhost:8080/analyze_screenshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base64Screenshot: base64Screenshot,
      goal: goal,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // 'data' might look like { "score": "85" }
      if (data) {
        console.log("OpenAI Off-Task Confidence Score:", data);

let position = 600; // Set starting position 
        // do something with data.score
      } else {
        console.error("No valid score returned from server:", data);
      }
    })
    .catch((error) => {
      console.error("Error calling Python API:", error);
    });
  
}