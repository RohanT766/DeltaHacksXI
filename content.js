// Function to make the owl fly in from the right and move to the top-right corner
function animateOwlIntoScreen() {
    // Create the owl element
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.style.position = "fixed";
    flyingOwl.style.top = "50%"; // Start at the vertical center of the screen
    flyingOwl.style.right = "-200px"; // Start completely off-screen on the right
    flyingOwl.style.transform = "translateY(-50%)"; // Adjust for vertical centering
    flyingOwl.style.width = "200px"; // Owl size
    flyingOwl.style.zIndex = "9999"; // Ensure it appears above all content
    flyingOwl.style.transition = "right 1.5s ease-out, top 1s ease-out"; // Smooth flying and upward movement
  
    // Append the owl to the document body
    document.body.appendChild(flyingOwl);
  
    // Step 1: Trigger the owl flying in from the right
    setTimeout(() => {
      flyingOwl.style.right = "20px"; // Final horizontal position inside the screen
    }, 100); // Slight delay to ensure proper rendering
  
    // Step 2: After the owl flies in, move it to the top-right corner
    setTimeout(() => {
      flyingOwl.style.top = "20px"; // Move to the top-right corner
      flyingOwl.style.transform = "translateY(0)"; // Reset translation for proper positioning
    }, 1600); // Start upward movement after the flying-in animation completes
  
    // Optionally remove the owl after a delay or keep it on screen
    setTimeout(() => {
      flyingOwl.remove();
    }, 5000); // Owl stays for 5 seconds before disappearing
  }
  
  // Listen for messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "flyOwl") {
      // Trigger the owl animation
      animateOwlIntoScreen();
      sendResponse({ status: "Owl animation triggered on webpage" });
    }
  });
  