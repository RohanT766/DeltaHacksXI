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
      <h1 class="fun-title">Ready to Conquer Your Goals? ⚔️</h1>
      <p class="fun-paragraph">Type in your epic quest below, brave adventurer!</p>
      <input 
        type="text" 
        id="goalInput" 
        class="fun-input" 
        placeholder="Slay the procrastination dragon..." 
      />
      <button id="startBtn" class="fun-button">Launch Quest</button>
      <p id="statusMessage" class="fun-status"></p>
    `;

    document.getElementById("startBtn").addEventListener("click", () => {
      const goalInput = document.getElementById("goalInput").value.trim();
      if (goalInput === "") {
        updateStatusMessage("Please enter a valid quest, hero!", "red");
        return;
      }

      chrome.runtime.sendMessage({ type: "startTracking", goal: goalInput }, (response) => {
        if (response.success) {
          displayActiveGoal(response.goal);
          console.log(`Goal set: "${goalInput}". Tracking started.`);
        } else {
          updateStatusMessage("Oh no! Failed to launch quest.", "red");
        }
      });
    });
  }

  // Display the active goal
  function displayActiveGoal(goal) {
    goalContainer.innerHTML = `
      <h1 class="fun-title">Current Epic Quest ✨</h1>
      <p class="fun-paragraph">${goal}</p>
      <button id="stopBtn" class="fun-button">Conclude Quest</button>
      <p id="statusMessage" class="fun-status"></p>
    `;

    document.getElementById("stopBtn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "stopTracking" }, (response) => {
        if (response.success) {
          displayGoalInput();
          console.log("Tracking stopped.");
        } else {
          updateStatusMessage("Alas! Failed to end the quest.", "red");
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
