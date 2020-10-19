$(document).ready(function(){ 
    let candidate_info = {};
    
    // add all message listeners
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse){
            switch(message.type) {
                case "scrape":
                    candidate_info = scrape();
                    sendResponse(obj_to_xml(candidate_info));
                    break;
                case "import":
                    download_resume();
                    break;
                case "filename":
                    candidate_info["resume_file"] = message.filename
                    import_profile(candidate_info);
                    break;
            }
        }
    );
});


// downloads all candidate info and opens Notes import page
function download_resume() {
    //chrome.runtime.sendMessage({type:"download-listener"}, function(response) {
        // download resume
        $(".svg-icon__download").click();
    //});
}


// downloads candidate info as XML and redirects to import link
function import_profile(candidate_info) {
    // download xml
    download_xml(obj_to_xml(candidate_info));
        
    // TODO redirect
}



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

    // parse the resume text
    const max_length = 1000;
    let resume_text = "";
    $("#resume-frame").contents().find("p").each(function() {
        // approx first 10 lines of resume
        if (resume_text.length > max_length) {
            return;
        }

        resume_text += $(this).text() + "\n";
    });
    
    let info = {};
    
    // full name
    info["name"] = $("#candidateProfile .candidate-name div span:first").text();

    // last activity
    info["last_activity"] = "";

    // last resume update
    info["resume_updated"] = $(".candidate-resumeupdated-text").text();
    
    // email address
    info["email"] = $(".has-candidate-contact-block:last-child #contact-legend-detail").text().trim();
    if (!info.email && REGEXES.email.test(resume_text)) {
        info.email = resume_text.match(REGEXES.email)[0];
    }

    // phone number
    info["phone"] = reformat_phone($(".has-candidate-contact-block:first-child").text());
    if (!info.phone) {
        info.phone = reformat_phone($(".has-candidate-contact-block:nth-child(2)").text());
    }
    if (!info.phone && REGEXES.phone.test(resume_text)) {
        info.phone = reformat_phone(resume_text.match(REGEXES.phone)[0]);
    }
    
    // full address
    if (REGEXES.address.test(resume_text)) {
        info["address"] = resume_text.match(REGEXES.address)[0];
    } else {
        info["address"] = $("#candidateProfile .candidate-location").text();
    }

    // work documents
    info["work_docs"] = "";

    // approx first 10 lines of resume
    info["resume_preview"] = escape_html(resume_text);

    // name of the resume file
    // TODO access with downloads API
    info["resume_file"] = "";

    return info;
}