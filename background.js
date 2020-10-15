let curr_url = "ayy lmao";

// listen for change in URL and update variable
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        curr_url = tabs[0].url;
    });
});

// receive messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "url-request") {
        sendResponse(curr_url);
    }
});