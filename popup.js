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
      <h1 class="owl-title">Stop Hootin' Around</h1>
      <p class="owl-paragraph">Hoot hoot! Enter your goal below:</p>

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

    // Attach the click event listener with { once: true } to allow only one click
    document.getElementById("startBtn").addEventListener(
      "click",
      () => {
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

            // Animate the flying owl first
            animateFlyingOwl(rect);

            // Delay the display of the active goal until after the owl animation
            setTimeout(() => {
              displayActiveGoal(response.goal);
            }, 1); // Adjust the delay as necessary

            // Send a message to content.js to animate the owl on the active webpage
            sendOwlToWebpage();
          } else {
            updateStatusMessage("Uh-oh! We couldn’t start tracking.", "red");
          }
        });
      },
      { once: true } // Ensures the listener is removed after first invocation
    );
  }

  // Animate an owl to fly straight up out of the screen
  function animateFlyingOwl(rect) {
    // Create a flying owl duplicate
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.className = "owl-fly";

    // Set its initial position and size
    flyingOwl.style.width = rect.width + "px";
    flyingOwl.style.height = rect.height + "px";
    flyingOwl.style.left = rect.left + "px";
    flyingOwl.style.top = rect.top + "px";

    // Append it to the body
    document.body.appendChild(flyingOwl);

    // Force reflow to apply initial position
    flyingOwl.getBoundingClientRect();

    // Animate directly upward out of the screen
    flyingOwl.style.transform = `translateY(-${window.innerHeight}px)`;
    flyingOwl.style.opacity = "0";

    // Listen for transition end to remove the flying owl and save final position
    flyingOwl.addEventListener("transitionend", () => {
      // Save the final position and size
      const finalRect = flyingOwl.getBoundingClientRect();
      finalOwlPosition = {
        left: finalRect.left,
        top: finalRect.top,
        width: finalRect.width,
        height: finalRect.height,
      };

      document.body.removeChild(flyingOwl); // Remove the flying owl
    });
  }

  // Display the active goal
  function displayActiveGoal(goal) {
    goalContainer.innerHTML = `
      <h1 class="owl-title">Currently Tracking Goal</h1>
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

  // Send a message to content.js to animate the owl on the active webpage
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

  // Add an owl at the saved position when the popup loses focus (user clicks off)
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
