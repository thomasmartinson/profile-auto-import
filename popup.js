let candidate_name = null;

$("#run_btn").click(function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"scrape"}, function(response){
      candidate_name = response.name;
      let html_str = ""
      for (item in response) {
        html_str += `<strong>${item}</strong>: ${response[item].replaceAll("\n", "<br>")}<br>`;
      }
      $("#text").html(`<p>${html_str}</p>`);
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