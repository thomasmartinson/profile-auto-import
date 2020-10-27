let debugMode;

chrome.storage.sync.get("debugging", function(result){
  debugMode = result.debugging;

  // skip the popup altogether
  if (!debugMode) {
    $("#run_btn").click();
  } else {
    $("#run_btn").show();
  }
});

let candidate_info = null;

$("#run_btn").click(function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"scrape"}, function(response){
		if (!response) {
			$("#text").text(`Encountered error parsing web page.  Please reload the page and try again.`);
			$("#text").show();
		} else {
      candidate_info = response;

			if (debugMode) {
        let html_str = ""
        for (item in response) {
          html_str += `<strong>${item}</strong>: ${response[item].replaceAll("\n", "<br>")}<br>`;
        }
        $("#text").html(`<p>${html_str}</p>`);
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
  chrome.runtime.sendMessage({type: "listen-for-download", info: candidate_info});
});
