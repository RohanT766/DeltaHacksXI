document.addEventListener("DOMContentLoaded", () => {
  const goalContainer = document.getElementById("goalContainer");

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
      <h1 class="owl-title">Owl's Honor!</h1>
      <p class="owl-paragraph">Hoot hoot! Enter your wise goal below:</p>

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
        placeholder="e.g., Study under the moonlight..."
      />
      <button id="startBtn" class="owl-button">Start Tracking</button>
      <p id="statusMessage" class="owl-status"></p>
    `;

    document.getElementById("startBtn").addEventListener("click", () => {
      const goalInput = document.getElementById("goalInput").value.trim();
      if (goalInput === "") {
        updateStatusMessage("Please enter a valid goal, wise owl!", "red");
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

          // Listen for the popup closing
          listenForPopupClose(rect);
        } else {
          updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
        }
      });
    });
  }

  // Animate the owl flying to the top-right corner
  function animateFlyingOwl(rect) {
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.className = "owl-fly";

    // Set initial size and position
    flyingOwl.style.width = rect.width + "px";
    flyingOwl.style.height = rect.height + "px";
    flyingOwl.style.left = rect.left + "px";
    flyingOwl.style.top = rect.top + "px";

    // Append to body
    document.body.appendChild(flyingOwl);

    // Animate to the top-right corner
    flyingOwl.style.transform = "translate(300px, -250px) scale(0.8)";
    flyingOwl.style.opacity = "0.7";

    // Remove flying owl after animation ends
    flyingOwl.addEventListener("transitionend", () => {
      document.body.removeChild(flyingOwl);
    });
  }

  // Display the active goal
  function displayActiveGoal(goal) {
    goalContainer.innerHTML = `
      <h1 class="owl-title">Currently Perched Goal</h1>
      <p class="owl-paragraph">${goal}</p>
      <button id="stopBtn" class="owl-button">Stop Tracking</button>
      <p id="statusMessage" class="owl-status"></p>
    `;

    document.getElementById("stopBtn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "stopTracking" }, (response) => {
        if (response.success) {
          displayGoalInput();
        } else {
          updateStatusMessage("Hoot! Couldn't stop tracking.", "red");
        }
      });
    });
  }

  // Recreate the owl when the popup is dismissed
  function listenForPopupClose(rect) {
    // Add a listener for when the popup is dismissed
    window.addEventListener("unload", () => {
      const returnedOwl = document.createElement("img");
      returnedOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
      returnedOwl.className = "owl-return";

      // Set size and position to match the original owl
      returnedOwl.style.width = rect.width + "px";
      returnedOwl.style.height = rect.height + "px";
      returnedOwl.style.position = "absolute";
      returnedOwl.style.left = rect.left + "px";
      returnedOwl.style.top = rect.top + "px";
      returnedOwl.style.zIndex = "9999"; // Ensure it appears above other content

      // Append the recreated owl to the body
      document.body.appendChild(returnedOwl);
    });
  }

  // Update the status message
  function updateStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.style.color = color;
  }
});
