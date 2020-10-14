$(document).ready(function(){ 
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse){
            switch(message.type) {
                case "scrape":
                    let xml_str = scrape();
                    sendResponse(xml_str);
                    break;
                case "import":
                    break;
            }
        }
    );
});


// extracts all info from profile page
function scrape() {
    // make sure user has a candidate selected
    if ($(".candidate-profile-pane div").hasClass("candidate-profile-empty")) {
        alert("Please select a candidate before importing.");
        return "";
    }
    
    // make sure user is on "Resume" tab
    if ($("#candidateProfile #__tab_1").hasClass("tab--inactive")) {
        alert("Please click on the \"Resume\" tab in the candidate's profile before importing.");
        return "";
    }

    // TODO parse the resume text
    
    let info = {};
    
    // full name
    info["name"] = $("#candidateProfile .candidate-name div span:first").text();

    // last activity
    info["last_activity"] = "";

    // last resume update
    info["resume_updated"] = $(".candidate-resumeupdated-text").text();
    
    // email address
    info["email"] = $(".has-candidate-contact-block:last-child #contact-legend-detail").text().trim();

    // phone number
    info["phone"] = reformat_phone($(".has-candidate-contact-block:first-child").text());
    
    // full address
    info["address"] = "";

    // work documents
    info["work_docs"] = "";

    // approx first 10 lines of resume
    info["resume_preview"] = "";

    // name of the resume file
    info["resume_file"] = "";

    // build XML string
    let xml_str = obj_to_xml(info);

    return xml_str;
}