//var newGroup;
var size = 0;

/* Connects functions to button clicks as chrome does not allow it inline in the HTML */
setupButtons();

// Once PopUp is opened request all the current groups
chrome.runtime.sendMessage({greeting: "getAllGroups"}, function(response) {
    console.log('Requesting ALL GROUPS');
    for (var i = 0 ; i < response.groupList.length ; i++){
        console.log('1:' + JSON.stringify(response.groupList[i]));
        console.log('popupMsg_name: '+response.groupList[i].name);
        createGroup(response.groupList[i]);
    }
});



/* Add onclick functions to the HTML buttons */
function setupButtons() {
    var clearButton = document.getElementById('clearButton');
    clearButton.onclick = function() { clearGroups() };
}

/* Takes a group and creates a span element to represent it in HTML */ //<button class="group"><span class="alignleft">NAME</span><span class="alignright">6</span></span>
function createGroup(g) {
    // Create the main button element
    var group = document.createElement('button');
    group.className = 'group';
    group.id = 'uniqueGroupId-' + g.name;

    // Create a span to contain the name on the left side of the button
    var nameSpan = document.createElement('span');
    nameSpan.className = 'alignleft'
    nameSpan.textContent = g.name;
    group.appendChild(nameSpan);

    // Create a span to contain the tab count on the right side of the button
    var countSpan = document.createElement('span');
    countSpan.className = 'alignright'
    countSpan.textContent = g.tabs.length;
    group.appendChild(countSpan);

    // Sets mouse interactions
    group.onclick = function(){openGroup(g.name)};

    // Adds to popup
    groupDiv.appendChild(group);
}

/* Takes a group id and opens up a window containing all the stored tab URLs */
function openGroup(name) {
    // Retrieve the specific group by id
    chrome.runtime.sendMessage({greeting: "getGroupTabs_" + name}, function(response) {
        let group = response.group;
        if (group != null) {
            console.log('Requesting GROUP TABS: '+JSON.stringify(response.group));
            // Create the window
            chrome.windows.create({url: group['tabs'][0], state: 'maximized'}, (window) => {
                let winID = window.tabs[0].windowId;
                // For each stored tab, create a tab in the new window
                for (var i = 1 ; i < group['tabs'].length ; i++){
                    chrome.tabs.create({windowId: winID, index: i, url: group['tabs'][i]});
                }
                deleteGroup(group.name);
            });
        }
    });
}

/* Request to background that a specific group should be deleted */
function deleteGroup(name) {
    var group = document.getElementById('uniqueGroupId-' + name);
    group.parentNode.removeChild(group);
    chrome.runtime.sendMessage({greeting: "deleteGroup_" + name}, function(response) {

    });
}

/* Request to background script that all groups should be cleared */
function clearGroups() {
    console.log('CLEAR: ' + size);
    chrome.runtime.sendMessage({greeting: "clearGroups"}, function(response) {
        console.log('CLEARED ALL');
        document.getElementById('groupDiv').innerHTML = "";
    });
}




/* USED IN UNFINISHED FEATURE */
/*
document.addEventListener('DOMContentLoaded', function() {
    newGroup = document.getElementById('newGroup');
    newGroup.addEventListener('click', function() {
        createGroup();
        chrome.runtime.sendMessage({greeting: "newGroup"});
    });
});*/

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