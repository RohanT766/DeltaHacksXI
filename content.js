// Single GIF URL to be used throughout the bobbing phase
const OWL_GIF_URL = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXJoaWxpc2JhM2Z5N3plN2VvcDVrbm41bDdib2Fwam9odHdlc2hmdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MwprkGiTxoeUM17RDp/giphy.gif";
// GIF URL for the owl during its initial flight and for flying away
const FLYING_OWL_GIF_URL = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";

let currentOwl = null;          // Track the current owl element on screen
let thoughtBubble = null;       // Track the thought bubble element

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

// Function to create and display a thought bubble next to the owl
function addThoughtBubble() {
  console.log("addThoughtBubble called");
  if (!currentOwl) return;
  
  // Create thought bubble element with a unique id
  thoughtBubble = document.createElement("img");
  thoughtBubble.id = "thoughtBubble";
  thoughtBubble.src = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjQ2ZHR0emV3bWkyNmV6NmVraWk5amhkb2k5bGVneWx6dzc3MnZvaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/D3lDc9D3uBxXLShs8K/giphy.gif";
  thoughtBubble.style.position = "fixed";
  thoughtBubble.style.width = "100px"; // Adjust size as needed
  thoughtBubble.style.zIndex = "10000"; // Ensure bubble is on top

  // Position the bubble next to the owl
  const owlRect = currentOwl.getBoundingClientRect();
  thoughtBubble.style.top = `${owlRect.top - 20}px`;
  thoughtBubble.style.left = `${owlRect.right - 200}px`;

  document.body.appendChild(thoughtBubble);
}

// Function to remove the thought bubble
function removeThoughtBubble() {
  console.log("removeThoughtBubble called");
  if (thoughtBubble) {
    thoughtBubble.remove();
    thoughtBubble = null;
  } else {
    const bubble = document.getElementById("thoughtBubble");
    if (bubble) {
      bubble.remove();
    }
  }
}

// Function to make the owl fly in from the top-right corner
function animateOwlIntoScreen() {
  // Remove any existing owl and thought bubble before creating a new one
  if (currentOwl) {
    currentOwl.remove();
    currentOwl = null;
  }
  removeThoughtBubble();

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
        addThoughtBubble();  // Add thought bubble once owl settles
      }, 2000);
    }, { once: true });
  }, 1200);
}

// Function to animate the owl flying away to the right and disappearing with a flying GIF
function animateOwlAway() {
  if (!currentOwl) return;
  removeThoughtBubble(); // Remove thought bubble when flying away

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
  } else if (message.action === "removeThoughtBubble") {
    removeThoughtBubble();
    sendResponse({ status: "Thought bubble removed" });
  }
});
