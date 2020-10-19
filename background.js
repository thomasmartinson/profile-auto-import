let curr_url = "ayy";
let last_download = "lmao";

// listen for change in URL and update variable
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        curr_url = tabs[0].url;
    });
});

// capture the name of the resume as it is being downloaded
// TODO triggers on all downloads, which is problematic when not downloading a resume
chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    last_download = downloadItem.filename;

    // uncomment below to rename the downloaded file
    // suggest({filename: "ayy lmao", conflictAction: "overwrite"});

    if (!/profile_import/.test(last_download)) { // on downloaded resume, not import file
        // send message to all tabs
        // cannot simply send message to the active tab
        // downloaded resume often opens a new tab
        chrome.tabs.query({}, function(tabs) {
            let message = {type: "filename", filename: last_download}
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        });
    }
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