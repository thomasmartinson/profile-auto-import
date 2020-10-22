let curr_url = "ayy";
let candidate_name = null;
let xml_str = null;

// listen for change in URL and update URL string variable
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        curr_url = tabs[0].url;
    });
});

// capture the name of the resume as it is being downloaded
chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    
    
    // triggers only when the candidate name variable is not null
    if (candidate_name !== null) { 
        // rename the file
        let split_name = downloadItem.filename.split(".");
        let file_extension = split_name[split_name.length - 1]; 
        let new_filename = `notes-import/${candidate_name.replaceAll(" ", "_")}_resume.${file_extension}`;
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

        // download xml file
        xml_str = `${xml_str.split("</data>")[0]}<resume_file>${new_filename}</resume_file>\n</data>`
        let doc = URL.createObjectURL( new Blob([xml_str], {type: "text/xml"}) );
        chrome.downloads.download({ url: doc, filename: "ayy_lmao.xml"});
    } else if (xml_str !== null) {
        // intercept the XML file download, since filename seems to be ignored
        // https://bugs.chromium.org/p/chromium/issues/detail?id=579563
        suggest({filename: "notes-import/profile_import.xml", conflictAction: "uniquify"});

        // reset trigger
        xml_str = null;
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
            xml_str = message.xml;
            // send message to content script to download
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type:"download"});
            });
            break;
    }
});
