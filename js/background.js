/* Array of tab groups */
var groupList = [];
/* Holds id of target window */
var callingWindow;
/* Size of the newGroup.html popup */
var HEIGHT = 200;
var WIDTH = 250;

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
            console.log('[LOADED]     Groups loaded from persistant local storage');
            groupList = result.groupList;
        }
    });
});

/* Message listener that interacts with the context scripts and popup scripts */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting.startsWith("deleteGroup_")){ // Recieves a group name and removes that group from the list and storage
        console.log("[RECIEVED]   Request from popup to delete a tab group");
        let name = request.greeting.split("_").pop();
        deleteGroup(name);
        console.log('[RESPONDING] Sending back successful deletion message');
        sendResponse({msg: 'success'});
    } else if (request.greeting.startsWith("createGroup_")) { // Receives a group name to create a new group from popup
        console.log("[RECIEVED]   Request to create a new tab group");
        let data = JSON.parse(request.greeting.split("_").pop());
        console.log('[CREATE]     Creating a new group: ' + JSON.stringify(data));
        if (data.groupName == '') { // Checks for empty name
            console.log("[RESPONDING] Sending back error message for empty group name");
            sendResponse({ msg: '* name required' });
        } else if (findGroupByName(data.groupName) != null) { // Checks for name that already exists
            console.log("[RESPONDING] Sending back error message for duplicate group name");
            sendResponse({ msg: '* name exists' });
        } else { // If validation is passed, create the group
            groupWindowTabs(data.groupName);
            console.log("[RESPONDING] Sending back successful creation message");
            sendResponse({ msg: 'created' });
        }
    } else if (request.greeting == "getAllGroups"){ // Sends response containing all the group data
        console.log("[RECIEVED]   Request for a list of all groups");
        console.log('[RESPONDING] Sending a list of all groups to calling script');
        sendResponse({groupList: groupList});
    } else if (request.greeting.startsWith("getGroupTabs_")){ // Recieves a group name and responds with that groups data
        console.log("[RECIEVED]   Request to get a specific groups tabs by its ID");
        let name = request.greeting.split("_").pop();
        let matchingGroup = findGroupByName(name);
        console.log('[RESPONDING] Sending group data for the group with a name of ' + name);
        sendResponse({group: matchingGroup});
    } else if (request.greeting.startsWith("clearGroups")){ // Removes every group from the list and storage
        console.log("[RECIEVED]   Request to delete all groups from local storage");
        clearLocalStorage();
        console.log('[RESPONDING] Sending back successful deletion message');
        sendResponse({msg: 'success'});
    }
});

// Finds a groups contents given its name
function findGroupByName(name) {
    for (var i = 0 ; i < groupList.length ; i++){
        if (groupList[i]['name'] == name)
            return groupList[i];
    }
    return null;
}

/* Uses 'id' param to find the group with matching id from groupList and returns its position */
function findGroupPositionByName(name) {
    for (var i = 0 ; i < groupList.length ; i++){
        if (groupList[i]['name'] == name)
            return i;
    }
    return null;
}

/* Gets all tabs from selected window and creates a group with them */
function groupWindowTabs(name) {
    var tabURLs = [];
    // Gets window tabs puts them into an array and creates a group with it
    chrome.windows.get(callingWindow, {populate:true}, (window) => {
        window.tabs.forEach(function(tab){
            tabURLs.push(tab.url);
            console.log(tab.url);
        });
        console.log('tabs: '+tabURLs.length);
        newGroup(groupList.length, name, tabURLs);
        //chrome.windows.remove(window.id);
    });
}

/* Handles group creation popup */
function openGroupCreateWindow(){
    console.log('[POPUP]      Opening newGroup popup');
    chrome.windows.getCurrent((win) => {
        // Get coordinates for middle of correct monitor
        var left = ((screen.width / 2) - (WIDTH / 2)) + win.left;
        var top = ((screen.height / 2) - (HEIGHT / 2)) + win.top;

        // Save target window
        callingWindow = win.id;

        // Create the group creation popup
        chrome.windows.create({
            url: 'newGroup.html',
            width: WIDTH,
            height: HEIGHT,
            top: Math.round(top),
            left: Math.round(left),
            type: 'popup'
        });
     });
}

/* Takes all data needed for a group object, creates it, and pushes it onto the array */
function newGroup(id, name, tabs) {
    // The new group
    var group = {
        "id": id,
        "name": name,
        "tabs": tabs
    }

    console.log('[STORAGE]    Created new group: ' + JSON.stringify(group));
    groupList.push(group);
    saveGroupsLocally();
}


/**************************************************************
 * The following functions handle local storage of the groups *
 **************************************************************/

/* Save the list of groups to Chromes local storage */
function saveGroupsLocally() {
    chrome.storage.local.set({groupList: groupList}, () => {
        console.log('[STORAGE]    Saved group data to local storage');
        console.log({groupList: groupList});
    });
}

/* Empty the local group array and clear local storage */
function clearLocalStorage() {
    chrome.storage.local.clear(() => {
        console.log('[STORAGE]    Cleared all data within this extensions local storage');
        groupList = [];
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

/* Recieves a specific group ID to find and delete a group */
function deleteGroup(name) {
    console.log('[STORAGE]    Deleted group and removed it from this extensions local storage');
    let pos = findGroupPositionByName(name);
    if (pos != null)
        groupList.splice(pos, 1);
    saveGroupsLocally();
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