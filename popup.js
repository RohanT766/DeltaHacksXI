document.addEventListener("DOMContentLoaded", () => {
  const goalContainer = document.getElementById("goalContainer");

  // Get the tracking state
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
      chrome.runtime.sendMessage({ type: "startTracking", goal: goalInput }, (res) => {
        if (res.success) {
          // 1) Immediately switch to the "Currently Perched Goal" screen
          displayActiveGoal(res.goal);

          // 2) Then animate an owl flying after the screen is updated
          animateOwlInActiveGoal();
          console.log(`Goal set: "${goalInput}". Tracking started.`);
        } else {
          updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
        }
      });
    });
  }

  // Animate an owl in the new (active goal) screen
  function animateOwlInActiveGoal() {
    // Create a brand-new owl image to fly
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.className = "owl-fly";

    // Append to body so we can absolutely position it
    document.body.appendChild(flyingOwl);

    // Place it near the bottom-left of the popup, or center—your choice
    // Let's place it near the center for demonstration
    const containerRect = goalContainer.getBoundingClientRect();
    // Start in middle of #goalContainer
    const startX = containerRect.left + containerRect.width / 2 - 40; // -40 half the owl width
    const startY = containerRect.bottom - 100; // 100px above bottom

    flyingOwl.style.left = startX + "px";
    flyingOwl.style.top = startY + "px";

    // Force reflow so the browser applies those initial coords
    flyingOwl.getBoundingClientRect();

    // Animate to top-right corner
    // Let's move it ~150px right & ~-150px up relative to start
    flyingOwl.style.transform = "translate(120px, -150px) scale(0.8)";
    flyingOwl.style.opacity = "0.8";

    // Remove the clone after animation completes
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
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.style.color = color;
  }
});
