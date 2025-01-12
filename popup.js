document.addEventListener("DOMContentLoaded", () => {
  const goalContainer = document.getElementById("goalContainer");
  let finalOwlPosition = null; // To store the final position and size of the flying owl

  // Fetch the current tracking state
  chrome.runtime.sendMessage({ type: "getTrackingState" }, (response) => {
    if (response.isTracking) {
      displayActiveGoal(response.goal);
    } else {
      displayGoalInput();
    }
  });

  // Display the goal input field
  function displayGoalInput() {
    goalContainer.innerHTML = `
      <h1 class="owl-title">No Hooting Around</h1>
      <p class="owl-paragraph">Hoot hoot! Enter your goal for this session below:</p>

      <!-- Main Owl GIF -->
      <img 
        src="https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif" 
        alt="Owl GIF" 
        class="owl-gif"
        id="owlGif"
      />

      <input 
        type="text" 
        id="goalInput" 
        class="owl-input" 
        placeholder="e.g., Complete my politics essay..."
      />
      <button id="startBtn" class="owl-button">Start Tracking</button>
      <p id="statusMessage" class="owl-status"></p>
    `;

    document.getElementById("startBtn").addEventListener("click", () => {
      const goalInput = document.getElementById("goalInput").value.trim();
      if (goalInput === "") {
        updateStatusMessage("Please enter a valid goal!", "red");
        return;
      }

      // Attempt to start tracking
      chrome.runtime.sendMessage({ type: "startTracking", goal: goalInput }, (response) => {
        if (response.success) {
          const originalOwl = document.getElementById("owlGif");
          const rect = originalOwl.getBoundingClientRect();

          // Switch to active goal screen first
          displayActiveGoal(response.goal);

          // Then animate the flying owl
          animateFlyingOwl(rect);

          // Send a message to content.js to animate the owl on the active webpage
          sendOwlToWebpage();
        } else {
          updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
        }
      });
    });
  }

  // Animate an owl to fly straight up out of the screen
  function animateFlyingOwl(rect) {
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.className = "owl-fly";

    flyingOwl.style.width = rect.width + "px";
    flyingOwl.style.height = rect.height + "px";
    flyingOwl.style.left = rect.left + "px";
    flyingOwl.style.top = rect.top + "px";

    document.body.appendChild(flyingOwl);
    flyingOwl.getBoundingClientRect();

    flyingOwl.style.transform = `translateY(-${window.innerHeight}px)`; 
    flyingOwl.style.opacity = "0"; 

    flyingOwl.addEventListener("transitionend", () => {
      const finalRect = flyingOwl.getBoundingClientRect();
      finalOwlPosition = {
        left: finalRect.left,
        top: finalRect.top,
        width: finalRect.width,
        height: finalRect.height,
      };
      document.body.removeChild(flyingOwl);
    });
  }

  // Display the active goal
  function displayActiveGoal(goal) {
    goalContainer.innerHTML = `
      <h1 class="owl-title">Current Goal:</h1>
      <p class="owl-paragraph">${goal}</p>
      <button id="stopBtn" class="owl-button">Goal Completed</button>
      <p id="statusMessage" class="owl-status"></p>
    `;

    document.getElementById("stopBtn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "stopTracking" }, (response) => {
        if (response.success) {
          // Broadcast message to animate owls away on all webpages
          sendOwlAwayToAllWebpages();
          displayGoalInput();
        } else {
          updateStatusMessage("Hoot! Couldn't stop tracking.", "red");
        }
      });
    });
  }

  function updateStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.style.color = color;
  }

  function sendOwlToWebpage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "flyOwl" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error communicating with content script:", chrome.runtime.lastError);
          } else {
            console.log(response.status);
          }
        }
      );
    });
  }

  // Broadcast "flyOwlAway" message to all open tabs
  function sendOwlAwayToAllWebpages() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "flyOwlAway" },
          (response) => {
            if (chrome.runtime.lastError) {
              // Some tabs may not have our content script; ignore errors
              console.error(`Error sending flyOwlAway to tab ${tab.id}:`, chrome.runtime.lastError.message);
            } else {
              console.log(response?.status || `Owl fly-away message sent to tab ${tab.id}`);
            }
          }
        );
      });
    });
  }

  document.body.addEventListener("blur", () => {
    if (!finalOwlPosition) return;

    const persistentOwl = document.createElement("img");
    persistentOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    persistentOwl.className = "owl-fly";

    persistentOwl.style.position = "absolute";
    persistentOwl.style.left = finalOwlPosition.left + "px";
    persistentOwl.style.top = finalOwlPosition.top + "px";
    persistentOwl.style.width = finalOwlPosition.width + "px";
    persistentOwl.style.height = finalOwlPosition.height + "px";

    document.body.appendChild(persistentOwl);
  });
});
