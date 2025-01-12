// This function creates and animates the owl flying upward on the current webpage
function animateOwlOnPage() {
    // Create the owl element
    const flyingOwl = document.createElement("img");
    flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    flyingOwl.style.position = "fixed";
    flyingOwl.style.bottom = "10%"; // Initial position near the bottom
    flyingOwl.style.left = "50%"; // Centered horizontally
    flyingOwl.style.transform = "translateX(-50%)"; // Correct centering
    flyingOwl.style.width = "300px"; // Adjust size of the owl
    flyingOwl.style.zIndex = "9999"; // Ensure it appears above all content
    flyingOwl.style.transition = "transform 1.5s ease-out, opacity 1.5s ease-out";
    flyingOwl.style.opacity = "1"; // Fully visible
  
    // Append the owl to the document body
    document.body.appendChild(flyingOwl);
  
    // Start the animation: move it upward and fade out
    setTimeout(() => {
      flyingOwl.style.transform = `translate(-50%, -200%)`; // Moves upward out of the screen
      flyingOwl.style.opacity = "0"; // Fades out
    }, 1000); // Delay to ensure the initial render completes
  
    // Remove the owl after the animation
    flyingOwl.addEventListener("transitionend", () => {
      flyingOwl.remove();
    });
  }
  
  // Listen for messages from the popup to trigger the owl animation
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "flyOwl") {
      animateOwlOnPage();
      sendResponse({ status: "Owl animation triggered" });
    }
  });
  