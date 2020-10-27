// update UI when the item in storage changes
chrome.storage.onChanged.addListener(function(changes, areaName){
    for (let item in changes) {
        if (item === "debug_mode") {
            update_ui(changes[item].newValue);
        }
    }
});

// update with the synced setting on page load
chrome.storage.sync.get("debug_mode", function(result){
    update_ui(result.debug_mode);
});

// toggle setting and update UI on click event
$("#toggle").click(function(element) {
    chrome.storage.sync.get("debug_mode", function(result){
        chrome.storage.sync.set({"debug_mode": !result.debug_mode});
    });
});

// helper function to manage all UI updates
function update_ui(value) {
    let map = { true: "ON", false: "OFF" };
    $("#status").text(map[value]);
    $("#toggle").text("TURN " + map[!value]);
}
