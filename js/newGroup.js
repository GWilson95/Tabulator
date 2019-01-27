/* Connects functions to button clicks as chrome does not allow it inline in the HTML */
setupButtons();

/* If the user hits the 'enter' key on the popup, it activates the createButton click */
document.onkeyup = function(key) {
    if (key.key == 'Enter')
        document.getElementById("createButton").click();
}

/* Add onclick functions to the HTML buttons */
function setupButtons() {
    var createButton = document.getElementById('createButton');
    createButton.onclick = function(){createGroup()};

    var cancelButton = document.getElementById('cancelButton');
    cancelButton.onclick = function(){window.close()};
}

/* Creates a group using data inputted by user and closes the window */
function createGroup() {
    // Gets values
    var name = document.getElementById('name').value;
    var colour = document.getElementById('colour').value;
    var fontColour = getFontColour(colour);

    // Requests background script creates a new group with the data and closes the window
    chrome.runtime.sendMessage({greeting: "newGroup_" + JSON.stringify({groupName: name, groupColour: colour, fontColour: fontColour})}, function(response) {
        console.log('HI RETURN');
        window.close();
    });
}

/* Takes a hexadecimal colour string and gets a readable font colour based on the background colour selected for the group */
function getFontColour(colour){
    // Gets the RGB values
    var r = parseInt(colour.substr(1, 2), 16);
    var g = parseInt(colour.substr(3, 2), 16);
    var b = parseInt(colour.substr(5, 2), 16);
    
    // Checks if the average is above of below 128 (halfway point from 0-255)
    let avg = (r + g + b) / 3;
    if (avg - 128 < 0) {
        // Less than 128 is considered dark so create a lighter version for the text
        console.log('Dark');
        r += 128;
        g += 128;
        b += 128;
        r = (r > 255) ? 255 : r;
        g = (g > 255) ? 255 : g;
        b = (b > 255) ? 255 : b;
    } else {
        // Greater than 128 is considered light so create a darker version for the text;
        console.log('Light');
        r -= 128;
        g -= 128;
        b -= 128;
        r = (r < 0) ? 0 : r;
        g = (g < 0) ? 0 : g;
        b = (b < 0) ? 0 : b;
    }

    // Returns the colour string in a hex format
    return '#' + decToHexString(r) + decToHexString(g) + decToHexString(b);
}

// Converts decimal to hex
function decToHexString(value){
    hexValue = value.toString(16);
    if (hexValue.length == 1) {
        hexValue = '0' + hexValue;
    }
    return hexValue;
}