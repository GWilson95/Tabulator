/* Array of tab groups */
var groupList = [];

var callingWindow;

/* Context Menus */
var mainMenu = chrome.contextMenus.create({
    "title": "Tabulator", 
    "contexts":["page"]
});
var subMenu = chrome.contextMenus.create({
    "title": "Group all tabs in Window", 
    "contexts":["page"],
    "parentId": mainMenu,
    "onclick": openGroupCreateWindow
});



// On start load the local persistant data
chrome.runtime.onStartup.addListener(() => {
    // Get local persistant data
    chrome.storage.local.get(['groupList'], function(result) {
        if (result.groupList) {
            console.log('[LOADED] Groups loaded from persistant local storage');
            groupList = result.groupList;
        }
    });
});

// On creation of a new Chrome Window
chrome.windows.onCreated.addListener((window) => {
    console.log('NEW WINDOW: ' + window.id);
    check = 1;
});

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[RECIEVED] ' + (sender.tab ? "Message from content script:" + sender.tab.url : "Message from the extension"));
    if (request.greeting == "newGroup"){
        console.log("[CREATING] Adding new tab group");
        //addGroup();
    } else if (request.greeting == "getAllGroups"){
        console.log(JSON.stringify(groupList));
        sendResponse({groupList: groupList});
    } else if (request.greeting.startsWith("getGroupTabs_")){
        let id = request.greeting.split("_").pop();
        let matchingGroup = findGroupByID(id);
        sendResponse({group: matchingGroup});
    } else if (request.greeting.startsWith("deleteGroup_")){
        let id = request.greeting.split("_").pop();
        deleteGroup(id);
        sendResponse({id: id});
    } else if (request.greeting.startsWith("clearGroups")){
        clearLocalStorage();
        sendResponse({test: 'test'});
    } else if  (request.greeting.startsWith("newGroup_")){
        let data = JSON.parse(request.greeting.split("_").pop());
        console.log('[CREATE] Forming new group: ' + JSON.stringify(data));
        groupWindowTabs(data.groupName, data.groupColour, data.fontColour);
        sendResponse({test: 'test2P'});
    }
});

// Uses 'id' param to find the group with matching id from groupList
function findGroupByID(id) {
    for (var i = 0 ; i < groupList.length ; i++){
        if (groupList[i]['id'] == id)
            return groupList[i];
    }
    return null;
}

// Uses 'id' param to find the group with matching id from groupList and returns its position
function findGroupPositionByID(id) {
    for (var i = 0 ; i < groupList.length ; i++){
        if (groupList[i]['id'] == id)
            return i;
    }
    return null;
}

// Gets all tabs from selected window and creates a group with them
function groupWindowTabs(/*info, tab*/name, colour, fontColour) {
    //console.log("item " + info.menuItemId + " was clicked");
    //console.log("info: " + JSON.stringify(info));
    //console.log("tab: " + JSON.stringify(tab));
    var tabURLs = [];
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

function openGroupCreateWindow(){
    chrome.windows.getCurrent((win) => {
        var width = 250;
        var height = 250;
        var left = ((screen.width / 2) - (width / 2)) + win.left;
        var top = ((screen.height / 2) - (height / 2)) + win.top;

        callingWindow = win.id;

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

// USED IN UNFINISHED FUNCTIONALITY
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

function newGroup(id, name, colour, fontColour, tabs) {
    var group = {
        "id": id,
        "name": name,
        "colour": colour,
        "fontColour": fontColour,
        "icon": "on.png",
        "tabs": tabs
    }

    groupList.push(group);
    console.log('group: ' + JSON.stringify(group));
    console.log('list: ' +JSON.stringify(groupList));

    saveGroupsLocally();
}

function saveGroupsLocally() {
    chrome.storage.local.set({groupList: groupList}, () => {
        console.log('[SAVING] Group data Saved');
    });
}

function clearLocalStorage() {
    chrome.storage.local.clear(() => {
        console.log('clear');
        groupList = [];
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

function deleteGroup(id) {
    let pos = findGroupPositionByID(id);
    if (pos != null)
        groupList.splice(pos, 1);
    saveGroupsLocally();
}