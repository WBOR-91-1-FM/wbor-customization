// This stopped working? Need to fix at some point

// Add placeholder text to the contact form

function changePlaceholders() {
    var nameInput = document.getElementById("contact-name");
    var emailInput = document.getElementById("contact-email");
    var messageInput = document.getElementById("contact-message");
    
    nameInput.placeholder = "firstname lastname";
    emailInput.placeholder = "your@email.ext";
    messageInput.placeholder = "A message you would like to send to WBOR management!";
}

// Call the function on page load
window.onload = function () {
    changePlaceholders();
};
