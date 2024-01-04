// Function to set the default volume to max (100)
function setDefaultVolume() {
    var volumeSlider = document.querySelector('[title="Volume"]');
    if (volumeSlider) {
        volumeSlider.value = 100;

        // Trigger an input event to notify the slider of the value change
        var inputEvent = new Event('input', { bubbles: true });
        volumeSlider.dispatchEvent(inputEvent);
    }
}

// Event listener to call the function after the page has loaded
window.addEventListener('load', setDefaultVolume);