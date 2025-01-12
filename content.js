// Single GIF URL to be used throughout the bobbing phase
const OWL_GIF_URL = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXJoaWxpc2JhM2Z5N3plN2VvcDVrbm41bDdib2Fwam9odHdlc2hmdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MwprkGiTxoeUM17RDp/giphy.gif";
// GIF URL for the owl during its initial flight
const FLYING_OWL_GIF_URL = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";

// Append CSS for bobbing animation if not already present
(function addBobbingAnimationCSS() {
  if (document.getElementById('bobbingAnimationStyle')) return;
  const styleElem = document.createElement('style');
  styleElem.id = 'bobbingAnimationStyle';
  styleElem.innerHTML = `
    @keyframes bob {
      0% { transform: translateY(0); }
      50% { transform: translateY(10px); }
      100% { transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleElem);
})();

// Function to make the owl fly in from the top-right corner
function animateOwlIntoScreen() {
  const flyingOwl = document.createElement("img");
  // Use the flying owl GIF during the initial flight
  flyingOwl.src = FLYING_OWL_GIF_URL;
  flyingOwl.style.position = "fixed";
  flyingOwl.style.top = "0px";
  flyingOwl.style.right = "-200px"; 
  flyingOwl.style.width = "150px";
  flyingOwl.style.zIndex = "9999";
  // Set transition for moving into final position
  flyingOwl.style.transition = "top 1.5s ease-out, right 1.5s ease-out";
  
  document.body.appendChild(flyingOwl);

  // Animate owl into final position
  setTimeout(() => {
    flyingOwl.style.top = "40px";
    flyingOwl.style.right = "20px";
    
    // After transition completes, start bobbing animation after an additional delay
    flyingOwl.addEventListener('transitionend', () => {
      // Wait 2 seconds before switching to bobbing animation
      setTimeout(() => {
        // Switch to the bobbing GIF (if different) or continue using the same GIF
        flyingOwl.src = OWL_GIF_URL;
        // Remove transition to allow smooth bobbing without interference
        flyingOwl.style.transition = "";
        // Apply bobbing animation
        flyingOwl.style.animation = "bob 2s infinite ease-in-out";
      }, 2000); // 2-second delay
    }, { once: true });
  }, 1200);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "flyOwl") {
    animateOwlIntoScreen();
    sendResponse({ status: "Owl animation triggered on webpage" });
  }
});
