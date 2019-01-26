/* Array of tab groups */
var groupList = [];
/* Holds id of target window */
var callingWindow;

/* Context Menus */
// Main parent menu
var mainMenu = chrome.contextMenus.create({
    "title": "Tabulator", 
    "contexts":["page"]
});
// Sub menu for options
var subMenu = chrome.contextMenus.create({
    "title": "Group all tabs in Window", 
    "contexts":["page"],
    "parentId": mainMenu,
    "onclick": openGroupCreateWindow
});



/* On startup of extension, load the local persistant data (groups) */
chrome.runtime.onStartup.addListener(() => {
    // Gets local persistant group data
    chrome.storage.local.get(['groupList'], function(result) {
        // Checks that the data is returned and stores it
        if (result.groupList) {
            console.log('[LOADED] Groups loaded from persistant local storage');
            groupList = result.groupList;
        }
    });
});

/* Message listener that interacts with the context scripts and popup scripts */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[RECIEVED] ' + (sender.tab ? "Message from content script:" + sender.tab.url : "Message from the extension"));

    if (request.greeting == "newGroup"){ // TEMPORARILY DISABLED FEATURE
        console.log("[CREATING] Adding new tab group");
        //addGroup();
    } else if (request.greeting == "getAllGroups"){ // Sends response containing all the group data
        console.log('[RESPONDING] Sending a list of all groups to calling script');
        sendResponse({groupList: groupList});
    } else if (request.greeting.startsWith("getGroupTabs_")){ // Recieves a group ID and responds with that groups data
        let id = request.greeting.split("_").pop();
        let matchingGroup = findGroupByID(id);
        console.log('[RESPONDING] Sending group data for the group with an id of ' + id);
        sendResponse({group: matchingGroup});
    } else if (request.greeting.startsWith("deleteGroup_")){ // Recieves a group ID and removes that group from the list and storage
        let id = request.greeting.split("_").pop();
        deleteGroup(id);
        console.log('[RESPONDING] Sending back successful deletion message');
        sendResponse({msg: 'success'});
    } else if (request.greeting.startsWith("clearGroups")){ // Removes every group from the list and storage
        clearLocalStorage();
        console.log('[RESPONDING] Sending back successful deletion message');
        sendResponse({msg: 'success'});
    } else if  (request.greeting.startsWith("newGroup_")){ // Recieves user input and creates a corresponding group object
        let data = JSON.parse(request.greeting.split("_").pop());
        groupWindowTabs(data.groupName, data.groupColour, data.fontColour);
        console.log('[CREATE] Forming new group: ' + JSON.stringify(data));
        sendResponse({msg: 'success'});
    }
});

/* Uses 'id' param to find the group with matching id from groupList */
function findGroupByID(id) {
    for (var i = 0 ; i < groupList.length ; i++){
        if (groupList[i]['id'] == id)
            return groupList[i];
    }
    return null;
}

/* Uses 'id' param to find the group with matching id from groupList and returns its position */
function findGroupPositionByID(id) {
    for (var i = 0 ; i < groupList.length ; i++){
        if (groupList[i]['id'] == id)
            return i;
    }
    return null;
}

/* Gets all tabs from selected window and creates a group with them */
function groupWindowTabs(name, colour, fontColour) {
    var tabURLs = [];
    // Gets window tabs puts them into an array and creates a group with it
    chrome.windows.get(callingWindow, {populate:true}, (window) => {
        window.tabs.forEach(function(tab){
            tabURLs.push(tab.url);
            console.log(tab.url);
        });
        console.log('tabs: '+tabURLs.length);
        newGroup(groupList.length, name, colour, fontColour, tabURLs);
        chrome.windows.remove(window.id);
    });
}

/* Handles group creation popup */
function openGroupCreateWindow(){
    console.log('[POPUP] Opening newGroup popup');
    chrome.windows.getCurrent((win) => {
        // Get coordinates for middle of correct monitor
        var width = 250;
        var height = 280;
        var left = ((screen.width / 2) - (width / 2)) + win.left;
        var top = ((screen.height / 2) - (height / 2)) + win.top;

        // Save target window
        callingWindow = win.id;

        // Create the group creation popup
        chrome.windows.create({
            url: 'newGroup.html',
            width: width,
            height: height,
            top: Math.round(top),
            left: Math.round(left),
            type: 'popup'
        });
     });
}

/* USED IN UNFINISHED FUNCTIONALITY */
/*
function addGroup(){
    groupList.push({
        "name": "test"
    });
    chrome.storage.local.set({groupList: groupList}, () => {
        console.log('[SAVING] Group data Saved');
    });
    console.log('GROUP COUNT: ' + groupList.length);
}*/

/* Takes all data needed for a group object, creates it, and pushes it onto the array */
function newGroup(id, name, colour, fontColour, tabs) {
    // The new group
    var group = {
        "id": id,
        "name": name,
        "colour": colour,
        "fontColour": fontColour,
        "icon": "on.png",
        "tabs": tabs
    }

    console.log('[STORAGE] Created new group: ' + JSON.stringify(group));
    groupList.push(group);

    saveGroupsLocally();
}

/* Save the list of groups to Chromes local storage */
function saveGroupsLocally() {
    chrome.storage.local.set({groupList: groupList}, () => {
        console.log('[SAVING] Group data Saved');
    });
}

/* Empty the local group array and clear local storage */
function clearLocalStorage() {
    chrome.storage.local.clear(() => {
        console.log('[STORAGE] Cleared all data within this extensions local storage');
        groupList = [];
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

/* Recieves a specific group ID to find and delete a group */
function deleteGroup(id) {
    console.log('[STORAGE] Deleted group and removed it from this extensions local storage');
    let pos = findGroupPositionByID(id);
    if (pos != null)
        groupList.splice(pos, 1);
    saveGroupsLocally();
}