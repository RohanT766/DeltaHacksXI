console.log("Background script is running!");

// Detect when a tab is updated (page load or reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log(`Page changed: ${tab.url}`);
    // TODO: Take a screenshot and analyze it with ChatGPT API
  }
});

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
  // TODO: Monitor and handle unproductive tabs
});

// Detect when the user switches between tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(`Switched to tab: TabId = ${activeInfo.tabId}, URL = ${tab.url}`);
    // TODO: Take a screenshot and analyze it with ChatGPT API
  });
});
