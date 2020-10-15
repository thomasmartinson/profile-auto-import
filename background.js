let curr_url = "ayy";
let last_download = "lmao";

// listen for change in URL and update variable
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        curr_url = tabs[0].url;
    });
});

chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    last_download = downloadItem.filename;
    // suggest({filename: "ayy lmao", conflictAction: "overwrite"}); // renames the downloaded file
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        // send message back to contents script
        // this doesn't work right now... I suspect due to a new tab being opened when the download is initiated
        chrome.tabs.sendMessage(tabs[0].id, {type: "filename"}, function(response) {});  
    });
});

// receive messages
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
        case "url-request":
            sendResponse(curr_url);
            break;
        case "download_listener":
            sendResponse();
            break;
    }
});