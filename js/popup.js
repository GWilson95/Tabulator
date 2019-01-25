var newGroup;
//var groupList = [];
var size = 0;



setupButtons();

// Once PopUp is opened request all the current groups
chrome.runtime.sendMessage({greeting: "getAllGroups"}, function(response) {
    console.log('Requesting ALL GROUPS');
    for (var i = 0 ; i < response.groupList.length ; i++){
        console.log('1:' + JSON.stringify(response.groupList[i]));
        console.log('popupMsg_fontColour: '+response.groupList[i].fontColour);
        createGroup2(response.groupList[i]);
    }
});

// USED IN UNFINISHED FEATURE
/*
document.addEventListener('DOMContentLoaded', function() {
    newGroup = document.getElementById('newGroup');
    newGroup.addEventListener('click', function() {
        createGroup();
        chrome.runtime.sendMessage({greeting: "newGroup"});
    });
});*/

function setupButtons() {
    var clearButton = document.getElementById('clearButton');
    clearButton.onclick = function(){clearGroups()};
}

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
}

function createGroup2(g) {
    console.log(g);/*
    var group = document.createElement('img');
    var groupDiv = document.getElementById('groupDiv');
    group.id = g.id;
    group.className = 'group';
    group.src = 'images/add.png';
    group.alt = g.name;
    group.height = '36';
    group.width = '36';
    group.onmouseenter = function(){setName(group.alt)};
    group.onmouseleave = function(){setName('No Group Selected')};
    group.onclick = function(){openGroup(g.id)};
    groupDiv.insertBefore(group, newGroup);*/
    var group = document.createElement('span');
    var groupDiv = document.getElementById('groupDiv');
    group.id = g.id;
    group.className = 'dot';
    console.log('TEST_COLOUR: '+g.colour);
    //group.src = 'images/add.png';
    group.alt = g.name;
    group.textContent = g.tabs.length;
    group.style.backgroundColor = g.colour;
    console.log(g.fontColour);
    group.style.color = g.fontColour;
    group.style.textAlign = 'center';
    group.style.verticalAlign = 'middle';
    group.style.lineHeight = '38px';
    group.style.fontSize = '15px';
    group.style.fontWeight = 'bold';
    //group.style.border = '3px solid ' + g.fontColour;
    //group.height = '36';
    //group.width = '36';
    group.onmouseenter = function(){setName(group.alt)};
    group.onmouseleave = function(){setName('')};
    group.onclick = function(){openGroup(g.id)};
    groupDiv.insertBefore(group, newGroup);
}

function setName(name) {
    var groupTitle = document.getElementById('groupTitle');
    groupTitle.textContent = name;
}

function openGroup(id) {
    chrome.runtime.sendMessage({greeting: "getGroupTabs_" + id}, function(response) {
        let group = response.group;
        console.log('Requesting GROUP TABS: '+JSON.stringify(response.group));
        chrome.windows.create({url: group['tabs'][0], state: 'maximized'}, (window) => {
            let winID = window.tabs[0].windowId;
            for (var i = 1 ; i < group['tabs'].length ; i++){
                chrome.tabs.create({windowId: winID, index: i, url: group['tabs'][i]});
            }
            deleteGroup(id);
        });
    });
}

function deleteGroup(id) {
    var group = document.getElementById(id);
    group.parentNode.removeChild(group);
    chrome.runtime.sendMessage({greeting: "deleteGroup_" + id}, function(response) {

    });
}

function clearGroups() {
    //for (var i = 0 ; i < size ; i++)
    console.log('CLEAR: ' + size);
    chrome.runtime.sendMessage({greeting: "clearGroups"}, function(response) {
        console.log('CLEARED ALL');
        document.getElementById('groupDiv').innerHTML = "";
    });
}