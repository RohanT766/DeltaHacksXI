document.addEventListener("DOMContentLoaded", () => {
  const goalContainer = document.getElementById("goalContainer");

  // Get initial tracking state
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
      chrome.runtime.sendMessage({ type: "startTracking", goal: goalInput }, (res) => {
        if (res.success) {
          // If success, animate the owl THEN show active goal
          animateOwlThenShowGoal(res.goal);
          console.log(`Goal set: "${goalInput}". Tracking started.`);
        } else {
          updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
        }
      });
    });
  }

  // Animate the owl flying to top-right, then display the active goal
  function animateOwlThenShowGoal(goal) {
    const originalOwl = document.getElementById("owlGif");
    if (!originalOwl) {
      // If no owl in DOM, just display goal right away
      displayActiveGoal(goal);
      return;
    }

    // 1) Get bounding rect of the original owl
    const rect = originalOwl.getBoundingClientRect();

    // 2) Create a clone for the "flying" effect
    const flyingOwl = document.createElement("img");
    flyingOwl.src = originalOwl.src;
    flyingOwl.classList.add("owl-fly");

    // 3) Append the flying owl to the body (so it can position absolutely)
    document.body.appendChild(flyingOwl);

    // 4) Position the clone exactly where the original is
    //    We need the offset from top/left of the viewport
    flyingOwl.style.left = rect.left + "px";
    flyingOwl.style.top = rect.top + "px";

    // 5) Force a reflow so setting transform won't skip the transition
    //    This trick ensures the browser applies the initial left/top first
    flyingOwl.getBoundingClientRect();

    // 6) Set the final transform: move to top-right corner & fade out a bit
    //    We'll pick an offset like 220px left & -200px up, or you can adjust
    flyingOwl.style.transform = "translate(150px, -150px) scale(0.8)";
    flyingOwl.style.opacity = "0.7";

    // 7) Listen for transition end => remove clone + show active goal
    flyingOwl.addEventListener("transitionend", () => {
      document.body.removeChild(flyingOwl);
      displayActiveGoal(goal);
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
