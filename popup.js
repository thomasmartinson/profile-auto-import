let debugMode = false;

let candidate_name = null;

$("#run_btn").click(function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"scrape"}, function(response){
		if (!response) {
			$("#text").text(`Encountered error parsing web page.  Please reload the page and try again.`);
			$("#text").show();
		} else {
			candidate_name = response.match(/(?<=<name>).*(?=<\/name>)/)[0];
			if (debugMode) {
				$("#text").text(response);
				$("#run_btn").text("Try again");
				$("#import_btn").show();
				$("#text").show();
			} else {
				$("#text").hide();
				$("#import_btn").click(); 
			}
		}	
    });
  });
});

$("#import_btn").click(function(element) {
  // send message to background
  chrome.runtime.sendMessage({type: "listen-for-download", name: candidate_name});
});