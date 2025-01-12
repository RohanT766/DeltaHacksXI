const gifUrl = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2lzbzdjcGlsa2Ezb3I5YnV6YW5nYnRscWVudjQwczBybWQyZjZzeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/5BTz4HSGbL7l6su75e/giphy.gif"; // Owl GIF url 

// Create owl GIF
const owl = document.createElement('img');
owl.src = gifUrl;
owl.style.position = 'fixed';  
owl.style.top = '70%';         // Establish height of the GIF on the screen
owl.style.zIndex = '9999';     // Overlays GIF ontop of other elements on the screen
owl.style.width = '400px';   
owl.style.height = 'auto';     

// Add GIF to webpage
document.body.appendChild(owl);