//var newGroup;
var size = 0;

/* Connects functions to button clicks as chrome does not allow it inline in the HTML */
setupButtons();

// Once PopUp is opened request all the current groups
chrome.runtime.sendMessage({greeting: "getAllGroups"}, function(response) {
    console.log('Requesting ALL GROUPS');
    for (var i = 0 ; i < response.groupList.length ; i++){
        console.log('1:' + JSON.stringify(response.groupList[i]));
        console.log('popupMsg_fontColour: '+response.groupList[i].fontColour);
        createGroup(response.groupList[i]);
    }
});

/* USED IN UNFINISHED FEATURE */
/*
document.addEventListener('DOMContentLoaded', function() {
    newGroup = document.getElementById('newGroup');
    newGroup.addEventListener('click', function() {
        createGroup();
        chrome.runtime.sendMessage({greeting: "newGroup"});
    });
});*/

/* Add onclick functions to the HTML buttons */
function setupButtons() {
    var clearButton = document.getElementById('clearButton');
    clearButton.onclick = function(){clearGroups()};
}

/* USED IN UNFINISHED FEATURE */
/*
function createGroup() {
    var group = document.createElement('img');
    var groupDiv = document.getElementById('groupDiv');
    group.id = 'group' + size;
    group.className = 'group';
    group.src = 'images/add.png';
    group.alt = "text"
    group.height = '36';
    group.width = '36';
    group.onmouseenter = function(){setName(group.id)};
    group.onmouseleave = function(){setName('No Group Selected')};
    groupDiv.insertBefore(group, newGroup);
    size++;
}*/

/* Takes a group and creates a span element to represent it in HTML */
function createGroup(g) {
    // Gets elements from document
    var group = document.createElement('span');
    var groupDiv = document.getElementById('groupDiv');

    // Sets property values
    group.id = g.id;
    group.className = 'group';
    group.alt = g.name;
    group.textContent = g.tabs.length;
    group.style.backgroundColor = g.colour;
    group.style.color = g.fontColour;
    
    // Sets mouse interactions
    group.onmouseenter = function(){setName(group.alt)};
    group.onmouseleave = function(){setName('')};
    group.onclick = function(){openGroup(g.id)};

    // Adds to popup
    groupDiv.appendChild(group);
}

/* Takes a string and displays it under the group div */
function setName(name) {
    var groupTitle = document.getElementById('groupTitle');
    groupTitle.textContent = name;
}

/* Takes a group id and opens up a window containing all the stored tab URLs */
function openGroup(id) {
    // Retrieve the specific group by id
    chrome.runtime.sendMessage({greeting: "getGroupTabs_" + id}, function(response) {
        let group = response.group;
        console.log('Requesting GROUP TABS: '+JSON.stringify(response.group));
        // Create the window
        chrome.windows.create({url: group['tabs'][0], state: 'maximized'}, (window) => {
            let winID = window.tabs[0].windowId;
            // For each stored tab, create a tab in the new window
            for (var i = 1 ; i < group['tabs'].length ; i++){
                chrome.tabs.create({windowId: winID, index: i, url: group['tabs'][i]});
            }
            deleteGroup(id);
        });
    });
}

/* Request to background that a specific group should be deleted */
function deleteGroup(id) {
    var group = document.getElementById(id);
    group.parentNode.removeChild(group);
    chrome.runtime.sendMessage({greeting: "deleteGroup_" + id}, function(response) {

    });
}

/* Request to background script that all groups should be cleared */
function clearGroups() {
    //for (var i = 0 ; i < size ; i++)
    console.log('CLEAR: ' + size);
    chrome.runtime.sendMessage({greeting: "clearGroups"}, function(response) {
        console.log('CLEARED ALL');
        document.getElementById('groupDiv').innerHTML = "";
    });
}