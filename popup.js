document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn");

  btn.addEventListener("click", () => {
    // Create the popup overlay
    const popupOverlay = document.createElement("div");
    popupOverlay.style.position = "fixed";
    popupOverlay.style.top = "0";
    popupOverlay.style.left = "0";
    popupOverlay.style.width = "100vw";
    popupOverlay.style.height = "100vh";
    popupOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    popupOverlay.style.display = "flex";
    popupOverlay.style.justifyContent = "center";
    popupOverlay.style.alignItems = "center";
    popupOverlay.style.zIndex = "1000";

    // Create the popup container
    const popupContainer = document.createElement("div");
    popupContainer.style.backgroundColor = "white";
    popupContainer.style.padding = "20px";
    popupContainer.style.borderRadius = "8px";
    popupContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    popupContainer.style.textAlign = "center";

    // Add input box
    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Type something...";
    inputBox.style.width = "100%";
    inputBox.style.padding = "10px";
    inputBox.style.marginBottom = "10px";
    inputBox.style.border = "1px solid #ccc";
    inputBox.style.borderRadius = "4px";

    // Add start button
    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.style.padding = "10px 20px";
    startButton.style.border = "none";
    startButton.style.backgroundColor = "#007BFF";
    startButton.style.color = "white";
    startButton.style.borderRadius = "4px";
    startButton.style.cursor = "pointer";

    startButton.addEventListener("click", () => {
      alert(`You typed: ${inputBox.value}`);
      document.body.removeChild(popupOverlay); // Close the popup
    });

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.padding = "10px 20px";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "#FF0000";
    closeButton.style.color = "white";
    closeButton.style.borderRadius = "4px";
    closeButton.style.cursor = "pointer";
    closeButton.style.marginLeft = "10px";

    closeButton.addEventListener("click", () => {
      document.body.removeChild(popupOverlay); // Close the popup
    });

    // Append elements to the popup container
    popupContainer.appendChild(inputBox);
    popupContainer.appendChild(startButton);
    popupContainer.appendChild(closeButton);

    // Append the popup container to the overlay
    popupOverlay.appendChild(popupContainer);

    // Append the overlay to the body
    document.body.appendChild(popupOverlay);
  });
});