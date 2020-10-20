let candidate_name = null;

$("#run_btn").click(function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"scrape"}, function(response){
      candidate_name = response.name;
      $("#text").text(response);
      $("#run_btn").text("Try again");
      $("#import_btn").show();
      $("#text").show();
    });
  });
});

$("#import_btn").click(function(element) {
  // send message to background
  chrome.runtime.sendMessage({type: "listen-for-download", name: candidate_name});
});