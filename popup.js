$("#run_btn").click(function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"scrape"}, function(response){
      $("#text").text(response);
      $("#run_btn").text("Try again");
      $("#import_btn").show();
      $("#text").show();
    });
  });
});

$("#import_btn").click(function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"import"}, function(response){
    });
  });
});