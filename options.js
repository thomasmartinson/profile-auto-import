let debug_mode;

// update with the synced setting
chrome.storage.sync.get("debug_mode", function(result){
    debug_mode = result.debug_mode;
    update_ui(debug_mode);
});

// toggle setting and update UI on click event
$("#toggle").click(function(element) {
    debug_mode = !debug_mode;
    chrome.storage.sync.set({"debug_mode": debug_mode});
    update_ui(debug_mode);
});

// helper function to manage all UI updates
function update_ui(debug_mode) {
    let map = {true: "ON", false: "OFF"};
    $("#status").text(map[debug_mode]);
    $("#toggle").text("TURN " + map[!debug_mode]);
}
