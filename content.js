// Create the owl GIF
const owl = document.createElement("img");
owl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
owl.style.position = "fixed";
owl.style.width = "150px";
owl.style.zIndex = "9999";
owl.style.top = "50%";
owl.style.left = "50%";
owl.style.transform = "translate(-50%, -50%)";
owl.style.transition = "all 2s ease-in-out";

// Add the owl to the page
document.body.appendChild(owl);

// Animate the owl flying to the top-right corner
setTimeout(() => {
  owl.style.top = "10px";
  owl.style.left = "calc(100% - 160px)";
  owl.style.transform = "none";
  owl.style.opacity = "0.7";
}, 100);

// Remove the owl after the animation ends
setTimeout(() => {
  owl.remove();
}, 2500);
