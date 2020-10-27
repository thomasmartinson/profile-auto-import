let curr_url = "";
let candidate_name = null;
let state = "awaiting resume";
let active_tab_id = null;
let xml_str = null;

// default storage settings
chrome.runtime.onInstalled.addListener(function(details){
    chrome.storage.sync.set({debug_mode: false}, function(){
      console.log("Debug mode is OFF");  
    });
});

// enable toggling debug via right-click of extension icon
chrome.contextMenus.create({
 title: "Toggle debug mode",
 id: "toggle",
 contexts:["page_action"]
});
chrome.contextMenus.onClicked.addListener(function(info, tab){
    if (info.menuItemId === "toggle") {
        chrome.storage.sync.get("debug_mode", function(result){
            chrome.storage.sync.set({debug_mode: !result.debug_mode});
        });
    }
});

// listen for change in URL and update URL string variable
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        curr_url = tabs[0].url;
    });
});

// capture the name of the resume as it is being downloaded
chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
	
    // handle XML being downloaded
	if (xml_str !== null && state === "awaiting XML") {
		
        // intercept the XML file download, since filename seems to be ignored
        // https://bugs.chromium.org/p/chromium/issues/detail?id=579563
        suggest({filename: "notes_import/profile_import.xml", conflictAction: "uniquify"});
		
		// send message to content script to redirect to notes
            
        chrome.tabs.sendMessage(active_tab_id, {type:"redirect"});
		
		// avoid a loop
		xml_str = null;
		state = "awaiting resume"; // ready for the next export
    }
    
    // handle resume being downloaded
    if (xml_str !== null && state === "awaiting resume") { 

			
        // rename the file
		candidate_name = xml_str.match(/(?<=<name>).*(?=<\/name>)/)[0];
        let split_name = downloadItem.filename.split(".");
        let file_extension = split_name[split_name.length - 1]; 
		let new_filename = `${candidate_name.replaceAll(" ", "_")}_resume.${file_extension}`;
        let new_pathed_filename = `notes_import/${new_filename}`;
        suggest({filename: new_pathed_filename, conflictAction: "uniquify"});


        // download xml file
        xml_str = `${xml_str.split("</data>")[0]}<resume_file>${new_filename}</resume_file>\n</data>`;
        let doc = URL.createObjectURL( new Blob([xml_str], {type: "text/xml"}) );
        chrome.downloads.download({ url: doc, filename: "ayy_lmao.xml"});
		
		// avoid a loop
		state = "awaiting XML";
	} 
});

// receive messages
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
        case "activate-icon":
            chrome.pageAction.show(sender.tab.id);
            break;
        case "url-request":
            sendResponse(curr_url);
            break;
        case "listen-for-download":
		    xml_str = obj_to_xml(message.info);

            // send message to content script to download
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type:"download"});
				active_tab_id = tabs[0].id;
            });
            break;
    }
});

// converts the given javascript object to an xml string
// logs all items in the object onto the console
function obj_to_xml(obj) {
    let xml_str = "";
    for (let item in obj) {
        console.log(`${item}: ${obj[item]}`);
        xml_str += `<${item}>${obj[item]}</${item}>\n`
    }
    xml_str = `<data>\n${xml_str}</data>`
    return xml_str;
}
