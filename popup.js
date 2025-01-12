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
      <p class="owl-paragraph">“Hoot hoot! Enter your wise goal below.”</p>
      <input 
        type="text" 
        id="goalInput" 
        class="owl-input" 
        placeholder="e.g. Study, exercise, read at dusk..."
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

      chrome.runtime.sendMessage({ type: "startTracking", goal: goalInput }, (response) => {
        if (response.success) {
          displayActiveGoal(response.goal);
          console.log(`Goal set: "${goalInput}". Tracking started.`);
        } else {
          updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
        }
      });
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
          console.log("Tracking stopped.");
        } else {
          updateStatusMessage("Hoot! Couldn't stop tracking.", "red");
        }
      });
    });
  }

  // Update the status message
  function updateStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    // We still handle dynamic color in JS
    statusMessage.style.color = color;
  }
});
