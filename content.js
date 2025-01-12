// Function to make the owl fly in from the top-right corner
function animateOwlIntoScreen() {
  const flyingOwl = document.createElement("img");
  flyingOwl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
  flyingOwl.style.position = "fixed";
  flyingOwl.style.top = "0px";
  flyingOwl.style.right = "-200px"; 
  flyingOwl.style.transform = "translate(0, 0)";
  flyingOwl.style.width = "150px";
  flyingOwl.style.zIndex = "9999";
  flyingOwl.style.transition = "top 1.5s ease-out, right 1.5s ease-out";

  document.body.appendChild(flyingOwl);

  setTimeout(() => {
    flyingOwl.style.top = "40px";
    flyingOwl.style.right = "20px";
  }, 1200);

  setTimeout(() => {
    flyingOwl.src = "https://i.ibb.co/B2ptS3B/download.png";
  }, 5000);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "flyOwl") {
    animateOwlIntoScreen();
    sendResponse({ status: "Owl animation triggered on webpage" });
  }
});
