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
        } else {
          updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
        }
      });
    });
  }

  // Animate the owl flying to the top-right corner of the browser tab
  function animateFlyingOwl(rect) {
    // Create a flying owl duplicate
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.className = "owl-fly";

    // Set its initial position in the browser viewport
    flyingOwl.style.width = rect.width + "px";
    flyingOwl.style.height = rect.height + "px";
    flyingOwl.style.left = `${rect.left}px`;
    flyingOwl.style.top = `${rect.top}px`;

    // Append it to the body
    document.body.appendChild(flyingOwl);

    // Force reflow to apply initial position
    flyingOwl.getBoundingClientRect();

    // Animate to the top-right corner of the browser
    flyingOwl.style.transform = `translate(calc(100vw - ${rect.left + rect.width}px), calc(-${rect.top}px)) scale(0.8)`;
    flyingOwl.style.opacity = "0.7";

    // Remove the flying owl after the animation ends
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

  // Update the status message
  function updateStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.style.color = color;
  }
});
