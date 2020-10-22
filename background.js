let curr_url = "ayy";
let candidate_name = null;

// listen for change in URL and update URL string variable
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        curr_url = tabs[0].url;
    });
});

// capture the name of the resume as it is being downloaded
// TODO triggers on all downloads, which is problematic when not downloading a resume
chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    // triggers only when the candidate name variable is not null
    if (candidate_name !== null) { 
        // rename the file
        let split_name = downloadItem.filename.split(".");
        let file_extension = split_name[split_name.length - 1]; 
        let new_filename = `${candidate_name.replace(" ", "_")}_resume.${file_extension}`;
        suggest({filename: new_filename, conflictAction: "uniquify"});

        // send message to all tabs
        // cannot simply send message to the active tab since 
        // downloaded resume often opens a new tab.
		// send along the candidate name to make sure that the message is processed
		// only by the content script for the intended tab
		let candidate_name_copy = candidate_name.slice();
        chrome.tabs.query({}, function(tabs) {
            let message = {type: "filename", filename: new_filename, candidate_name: candidate_name_copy}
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        });

        // reset trigger
        candidate_name = null;
    }
});

// receive messages
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
        case "url-request":
            sendResponse(curr_url);
            break;
        case "listen-for-download":
            candidate_name = message.name;
            // send message to content script to download
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type:"download"});
            });
            break;
    }
});
