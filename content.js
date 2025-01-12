// Single GIF URL to be used throughout the bobbing phase
const OWL_GIF_URL = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXJoaWxpc2JhM2Z5N3plN2VvcDVrbm41bDdib2Fwam9odHdlc2hmdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MwprkGiTxoeUM17RDp/giphy.gif";
// GIF URL for the owl during its initial flight and for flying away
const FLYING_OWL_GIF_URL = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";

let currentOwl = null; // Track the current owl element on screen

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
  // Remove any existing owl before creating a new one
  if (currentOwl) {
    currentOwl.remove();
    currentOwl = null;
  }

  currentOwl = document.createElement("img");
  currentOwl.src = FLYING_OWL_GIF_URL;
  currentOwl.style.position = "fixed";
  currentOwl.style.top = "0px";
  currentOwl.style.right = "-200px"; 
  currentOwl.style.width = "150px";
  currentOwl.style.zIndex = "9999";
  currentOwl.style.transition = "top 1.5s ease-out, right 1.5s ease-out";

  document.body.appendChild(currentOwl);

  setTimeout(() => {
    currentOwl.style.top = "40px";
    currentOwl.style.right = "20px";

    currentOwl.addEventListener('transitionend', () => {
      setTimeout(() => {
        currentOwl.src = OWL_GIF_URL;
        currentOwl.style.transition = "";
        currentOwl.style.animation = "bob 2s infinite ease-in-out";
      }, 2000);
    }, { once: true });
  }, 1200);
}

// Function to animate the owl flying away to the right and disappearing with a flying GIF
function animateOwlAway() {
  if (!currentOwl) return;

  // Switch to the flying GIF for a dynamic fly-away effect
  currentOwl.src = FLYING_OWL_GIF_URL;
  
  currentOwl.style.animation = "";
  currentOwl.style.transition = "right 1.5s ease-in, opacity 1.5s ease-in";
  currentOwl.style.right = "-300px";
  currentOwl.style.opacity = "0";

  currentOwl.addEventListener('transitionend', () => {
    if (currentOwl && currentOwl.parentElement) {
      currentOwl.parentElement.removeChild(currentOwl);
      currentOwl = null;
    }
  }, { once: true });
}

// Listen for messages from popup.js or background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "flyOwl") {
    animateOwlIntoScreen();
    sendResponse({ status: "Owl animation triggered on webpage" });
  } else if (message.action === "flyOwlAway") {
    animateOwlAway();
    sendResponse({ status: "Owl fly-away animation triggered on webpage" });
  }
});
