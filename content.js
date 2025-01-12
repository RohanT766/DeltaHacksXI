chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "startOwlAnimation") {
      animateOwl();
    }
  });
  
  function animateOwl() {
    // Create the owl element
    const owl = document.createElement("img");
    owl.src = "https://media.giphy.com/media/5BTz4HSGbL7l6su75e/giphy.gif";
    owl.style.position = "fixed";
    owl.style.width = "150px";
    owl.style.zIndex = "999999";
    owl.style.left = "20px"; // Start near the bottom-left of the screen
    owl.style.bottom = "20px"; // Bottom-left corner
    owl.style.transition = "transform 2s ease-in-out, opacity 2s ease-in-out";
    document.body.appendChild(owl);
  
    // Trigger animation to the top-right corner
    requestAnimationFrame(() => {
      owl.style.transform = "translate(calc(100vw - 200px), -calc(100vh - 200px)) scale(0.7)";
      owl.style.opacity = "0.7";
    });
  
    // Remove the owl after the animation ends
    owl.addEventListener("transitionend", () => {
      owl.remove();
    });
  }
  