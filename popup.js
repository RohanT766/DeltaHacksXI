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
      <h1>Set Your Goal</h1>
      <input type="text" id="goalInput" placeholder="Enter your goal here..." />
      <button id="startBtn">Start Tracking</button>
      <p id="statusMessage" style="color: green; margin-top: 10px;"></p>
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
    goalContainer.innerHTML = `
      <h1>Current Goal</h1>
      <p>${goal}</p>
      <button id="stopBtn">Stop Tracking</button>
      <p id="statusMessage" style="color: green; margin-top: 10px;"></p>
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

  // Update the status message
  function updateStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.style.color = color;
  }
});
