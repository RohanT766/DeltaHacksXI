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
    // Added classes: "goal-title", "goal-input", "goal-button", "status-message"
    goalContainer.innerHTML = `
      <h1 class="goal-title">Set Your Goal</h1>
      <input type="text" id="goalInput" class="goal-input" placeholder="Enter your goal here..." />
      <button id="startBtn" class="goal-button">Start Tracking</button>
      <p id="statusMessage" class="status-message"></p>
    `;

    document.getElementById("startBtn").addEventListener("click", () => {
      const goalInput = document.getElementById("goalInput").value.trim();
      if (goalInput === "") {
        updateStatusMessage("Please enter a valid goal.", "red");
        return;
      }

      chrome.runtime.sendMessage({ type: "startTracking", goal: goalInput }, (response) => {
        if (response.success) {
          displayActiveGoal(response.goal);
          console.log(`Goal set: "${goalInput}". Tracking started.`);
        } else {
          updateStatusMessage("Failed to start tracking.", "red");
        }
      });
    });
  }

  // Display the active goal
  function displayActiveGoal(goal) {
    // Added classes: "goal-title", "goal-text", "goal-button", "status-message"
    goalContainer.innerHTML = `
      <h1 class="goal-title">Current Goal</h1>
      <p class="goal-text">${goal}</p>
      <button id="stopBtn" class="goal-button">Stop Tracking</button>
      <p id="statusMessage" class="status-message"></p>
    `;

    document.getElementById("stopBtn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "stopTracking" }, (response) => {
        if (response.success) {
          displayGoalInput();
          console.log("Tracking stopped.");
        } else {
          updateStatusMessage("Failed to stop tracking.", "red");
        }
      });
    });
  }

  // Update the status message color
  function updateStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    // We still let JS set the text color dynamically
    statusMessage.style.color = color;
  }
});
