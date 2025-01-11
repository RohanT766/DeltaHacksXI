chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      console.log(`Page changed: ${tab.url}`);
      // TODO: Take a screenshot and analyze it with ChatGPT API
    }
  });
  
  chrome.tabs.onCreated.addListener((tab) => {
    console.log(`New tab opened: ${tab.url || "about:blank"}`);
    // TODO: Monitor and handle unproductive tabs
  });
  