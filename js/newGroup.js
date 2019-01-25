setupButtons();

function setupButtons() {
    var createButton = document.getElementById('createButton');
    createButton.onclick = function(){createGroup()};

    var cancelButton = document.getElementById('cancelButton');
    cancelButton.onclick = function(){window.close()};
}

function createGroup() {
    var name = document.getElementById('name').value;
    var colour = document.getElementById('colour').value;
    var fontColour = getFontColour(colour);
    console.log('CREATING---- ' + name + ' //// ' + colour);
    chrome.runtime.sendMessage({greeting: "newGroup_" + JSON.stringify({groupName: name, groupColour: colour, fontColour: fontColour})}, function(response) {
        console.log('HI RETURN');
        window.close();
    });
}

function getFontColour(colour){
    console.log('TESTCOLOUR_DL: ' + colour);
    var r = parseInt(colour.substr(1, 2), 16);
    var g = parseInt(colour.substr(3, 2), 16);
    var b = parseInt(colour.substr(5, 2), 16);
    console.log('RGB = ' + r + ' - ' + g + ' - ' + b);
    let avg = (r + g + b) / 3;
    if (avg - 128 < 0) {
        console.log('Dark');
        r += 128;
        g += 128;
        b += 128;
        r = (r > 255) ? 255 : r;
        g = (g > 255) ? 255 : g;
        b = (b > 255) ? 255 : b;
    } else {
        console.log('Light');
        r -= 128;
        g -= 128;
        b -= 128;
        r = (r < 0) ? 0 : r;
        g = (g < 0) ? 0 : g;
        b = (b < 0) ? 0 : b;
    }
    return '#' + decToHexString(r) + decToHexString(g) + decToHexString(b);
}

function decToHexString(value){
    hexValue = value.toString(16);
    if (hexValue.length == 1) {
        hexValue = '0' + hexValue;
    }
    return hexValue;
}