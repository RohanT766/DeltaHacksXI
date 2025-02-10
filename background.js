console.log("Background script is running!");

let currentSession = null; // Tracks the current session
let lastCaptureTime = 0;   // Tracks the last time a screenshot was taken
let isTracking = false;    // Tracks whether goal tracking is active
let currentGoal = "";      // Stores the active goal
let tabHistory = {};       // Keeps track of tab history to handle redirection

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
    endSession(); // Ensure session ends immediately
    sendResponse({ success: true });
  } else if (message.type === "getTrackingState") {
    sendResponse({ isTracking, goal: currentGoal });
  }
});

// Detect when a tab is updated (page load or reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isTracking && changeInfo.status === "complete" && tab.url) {
    console.log(`Page changed: ${tab.url}`);
    updateTabHistory(tabId, tab.url);
    startSession(tabId, tab.url);

    // Trigger owl animation on new page load
    chrome.tabs.sendMessage(tabId, { action: "flyOwl" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending flyOwl message:", chrome.runtime.lastError);
      } else {
        console.log(response?.status || "Owl message sent");
      }
    });
  }
});

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (isTracking) {
    console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
    updateTabHistory(tab.id, tab.url || "about:blank");
    startSession(tab.id, tab.url || "about:blank");

    // Trigger owl animation on new tab
    chrome.tabs.sendMessage(tab.id, { action: "flyOwl" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending flyOwl message:", chrome.runtime.lastError);
      } else {
        console.log(response?.status || "Owl message sent");
      }
    });
  }
});

// Detect when the user switches between tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (isTracking) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log(`Switched to tab: TabId = ${activeInfo.tabId}, URL = ${tab.url}`);
      updateTabHistory(activeInfo.tabId, tab.url);
      startSession(activeInfo.tabId, tab.url);

      // Trigger owl animation on tab switch
      chrome.tabs.sendMessage(activeInfo.tabId, { action: "flyOwl" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending flyOwl message:", chrome.runtime.lastError);
        } else {
          console.log(response?.status || "Owl message sent");
        }
      });
    });
  }
});

// Function to update tab history
function updateTabHistory(tabId, url) {
  if (!url || url.startsWith("chrome://") || url.startsWith("about:")) {
    return;
  }
  if (!tabHistory[tabId]) {
    tabHistory[tabId] = [];
  }
  const history = tabHistory[tabId];
  if (history.length === 0 || history[history.length - 1] !== url) {
    tabHistory[tabId].push(url);
    console.log(`Updated history for TabId = ${tabId}:`, tabHistory[tabId]);
  }
}

// Function to start a new session
function startSession(tabId, url) {
  endSession();
  if (!url || url.startsWith("chrome://") || url.startsWith("about:")) {
    console.log(`Skipping session for restricted or blank URL: ${url}`);
    return;
  }
  currentSession = { tabId, url, sessionId: Date.now() };
  console.log(`Starting new session for TabId = ${tabId}, URL = ${url}`);

  setTimeout(() => {
    if (currentSession && currentSession.tabId === tabId) {
      takeScreenshot(url, currentSession.sessionId);
    } else {
      console.log("Session ended before screenshot could be taken.");
    }
  }, 2000);
}

// Function to end the current session
function endSession() {
  if (currentSession) {
    console.log(`Ending session for TabId = ${currentSession.tabId}, URL = ${currentSession.url}`);
    currentSession = null;
  }
}

// Function to take a screenshot with error handling
function takeScreenshot(url, sessionId) {
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
    analyzeScreenshotWithOpenAI(dataUrl, currentGoal, sessionId);
  });
}

/**
 * Calls the OpenAI API to analyze the screenshot in relation to the current goal.
 */
function analyzeScreenshotWithOpenAI(base64Screenshot, goal, sessionId) {
  if (!currentSession || currentSession.sessionId !== sessionId) {
    console.log("Session ended or replaced. Disregarding API call.");
    return;
  }

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
      if (!currentSession || currentSession.sessionId !== sessionId) {
        console.log("Session ended or replaced after API response. Disregarding result.");
        return;
      }
      if (data) {
        const offTaskScore = parseInt(data, 10);
        console.log("OpenAI Off-Task Confidence Score:", offTaskScore);
        if (offTaskScore > 70) {
          handleOffTask(currentSession.tabId);
        } else if (offTaskScore >= 30) {
          showBlurOverlay(currentSession.tabId, goal, base64Screenshot);
        } else {      
          // Not distracted: instruct content script to remove thought bubble
          chrome.tabs.sendMessage(currentSession.tabId, { action: "removeThoughtBubble" }, () => {
            if (chrome.runtime.lastError) {
              console.error("Error sending removeThoughtBubble message:", chrome.runtime.lastError);
            } else {
              console.log("Thought bubble removal message sent.");
            }
          });
        }
      } else {
        console.error("No valid score returned from server:", data);
      }
    })
    .catch((error) => {
      console.error("Error calling Python API:", error);
    });
}

function handleOffTask(tabId) {
  console.log(`Off-task behavior detected for TabId = ${tabId}`);

  let firstGifSrc = 'https://github.com/RohanT766/DeltaHacksXI/blob/main/animateWing1.gif?raw=true'; // First GIF (on current page)

  if (tabHistory[tabId] && tabHistory[tabId].length > 1) {
    // Redirect to the last meaningful page
    const previousUrl = tabHistory[tabId][tabHistory[tabId].length - 2];
    console.log(`Redirecting to previous page: ${previousUrl}`);

    // Inject the first GIF before redirecting (on the current page)
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: injectGif,
      args: [firstGifSrc]
    });

    // Wait for a few seconds before redirecting to give time for GIF to show
    setTimeout(() => {
      chrome.tabs.update(tabId, { url: previousUrl });
    }, 2000); // Adjust delay as needed
  } else {
    // If the tab is new, show the GIF before closing the tab
    console.log(`Closing new tab: TabId = ${tabId}`);

    // Inject the first GIF on the current tab (before closure)
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: injectGif,
      args: [firstGifSrc]
    });

    // Delay tab closure to allow the first GIF to be visible
    setTimeout(() => {
      chrome.tabs.remove(tabId);
    }, 2000); // Adjust delay as needed
  }
}

// Helper function to inject the GIF into the page
function injectGif(gifSrc) {
  const body = document.body;
  const img = document.createElement('img');
  img.src = gifSrc;
  img.style.position = 'fixed'; // Fixed to cover viewport
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.width = '100vw'; // Fill viewport width
  img.style.height = '100vh'; // Fill viewport height
  img.style.objectFit = 'cover'; // Crop if needed, keep centered
  img.style.transform = 'translate(-50%, -50%)'; // Center correctly
  img.style.zIndex = '9999999';
  img.style.pointerEvents = 'none';
  img.style.opacity = '1';
  body.appendChild(img);
}


function showBlurOverlay(tabId, goal, base64Screenshot) {
  console.log(`Intermediate off-task behavior detected for TabId = ${tabId}`);

  // Inject the overlay
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: injectBlurOverlay,
  });

  // Add listener to handle user's response
  chrome.runtime.onMessage.addListener(function handleOverlayResponse(message, sender, sendResponse) {
    if (message.type === "overlayResponse" && sender.tab.id === tabId) {
      chrome.runtime.onMessage.removeListener(handleOverlayResponse);

      const userResponse = message.response;

      fetch("http://localhost:8080/validate_reason", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Screenshot: base64Screenshot,
          goal: goal,
          reason: userResponse,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User response validation result:", String(data).toUpperCase());
          if (String(data).toUpperCase() == "PASS") {
            console.log("User response validated. Removing overlay.");
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: removeBlurOverlay,
            });
            chrome.tabs.sendMessage(currentSession.tabId, { action: "removeThoughtBubble" }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error sending removeThoughtBubble message:", chrome.runtime.lastError);
              } else {
                console.log("Thought bubble removal message sent.");
              }
            });
          } else {
            console.log("User response failed validation. Triggering handleOffTask.");
            handleOffTask(tabId);
          }
        })
        .catch((error) => {
          console.error("Error validating user response:", error);
          handleOffTask(tabId);
        });
    }
  });
}

// Injects the blurred overlay with a text box
function injectBlurOverlay() {
  const body = document.body;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'blur-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.backdropFilter = 'blur(10px)';
  overlay.style.zIndex = '9999999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = 'white';
  overlay.style.fontSize = '18px';
  overlay.style.textAlign = 'center';

  // Add prompt
  const prompt = document.createElement('p');
  prompt.textContent = 'Why do you need to access this page?';

  // Add text box
  const input = document.createElement('textarea');
  input.style.width = '80%';
  input.style.height = '100px';
  input.style.marginTop = '20px';
  input.style.fontSize = '16px';
  input.style.padding = '10px';

  // Add submit button
  const button = document.createElement('button');
  button.textContent = 'Submit';
  button.style.marginTop = '20px';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';

  // Append elements
  overlay.appendChild(prompt);
  overlay.appendChild(input);
  overlay.appendChild(button);
  body.appendChild(overlay);

  // Add event listener to submit button
  button.addEventListener('click', () => {
    const userResponse = input.value.trim();
    if (userResponse) {
      chrome.runtime.sendMessage({ type: "overlayResponse", response: userResponse });
      body.removeChild(overlay);
    }
  });
}

// Removes the blurred overlay
function removeBlurOverlay() {
  const overlay = document.getElementById('blur-overlay');
  if (overlay) {
    overlay.remove();
  }
}
