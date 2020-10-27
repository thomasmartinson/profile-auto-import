// update UI when the item in storage changes
chrome.storage.onChanged.addListener(function(changes, areaName){
    for (let item in changes) {
        if (item === "debugging") {
            update_ui(changes[item].newValue);
        }
    }
});

// update with the synced setting on page load
chrome.storage.sync.get("debugging", function(result){
    update_ui(result.debugging);
});

// toggle setting and update UI on click event
$("#toggle").click(function(element) {
    chrome.storage.sync.get("debugging", function(result){
        chrome.storage.sync.set({"debugging": !result.debugging});
    });
});

// helper function to manage all UI updates
function update_ui(value) {
    let map = { true: "ON", false: "OFF" };
    $("#status").text(map[value]);
    $("#toggle").text("TURN " + map[!value]);
}
