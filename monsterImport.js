$(document).ready(function () {
    let candidate_info = {};

    // add all message listeners
    chrome.runtime.onMessage.addListener(
        function (message, sender, sendResponse) {
            switch (message.type) {
                case "scrape":
                    candidate_info = scrape();
                    sendResponse(candidate_info);
                    break;
                case "download":
                    download_resume();
                    break;
                case "redirect":
                    redirect_to_notes();
                    break;
            }
        }
    );
});


// downloads all candidate info and opens Notes import page
function download_resume() {
    $(".svg-icon__download").click();
}


// extracts all info from profile page
function scrape() {
    // make sure user has a candidate selected
    if ($(".candidate-profile-pane div").hasClass("candidate-profile-empty")) {
        alert("Please select a candidate before importing.");
        return {};
    }

    // make sure user is on "Resume" tab
    if ($("#candidateProfile #__tab_1").hasClass("tab--inactive")) {
        alert("Please click on the \"Resume\" tab in the candidate's profile before importing.");
        return {};
    }

    // parse the resume text
    let resume_text = "";
    // iterate across every element in resume doc
    $("#resume-frame").contents().find("*").each(function () {
        // insert linebreaks at every linebreaking element
        if (["P", "LI", "BR"].includes($(this).prop("tagName"))
            || /H[1-6]/.test($(this).prop("tagName"))) { // headings
            resume_text += "\n";
        }
        // add text of elements with no children
        if ($(this).children().length == 0) {
            resume_text += $(this).text();
        }
    });

    resume_text = clean_whitespace(resume_text);
    let short_resume_text = resume_text.substring(0, SHORT_RESUME_LENGTH);
    let parsed_info = parse_from_resume(short_resume_text);

    let info = {};

    // full name
    info["name"] = $("#candidateProfile .candidate-name").text().trim().split("Open In New Tab")[0];

    // last resume update
    info["resume_updated"] = $(".candidate-resumeupdated-text").text();

    // email address
    info["email"] = $(".has-candidate-contact-block:last-child #contact-legend-detail").text().trim();
    if (!info.email) {
        info.email = parsed_info.email;
    } else {
        if ((parsed_info.email !== "") & (parsed_info.email.toLowerCase() !== info.email.toLowerCase())) {
            info["email2"] = parsed_info.email;
        }
    }

    // phone number
    info["phone"] = reformat_phone($(".has-candidate-contact-block:first-child").text());

    if (!info.phone) {
        info.phone = reformat_phone($(".has-candidate-contact-block:nth-child(2)").text());
    }
    if (!info.phone) {
        info.phone = reformat_phone(parsed_info.phone);
    }
    // full address
    info["address"] = parsed_info.address;
    if (!info.address) {
        info["address"] = $("#candidateProfile .candidate-location").text();
    }

    // full text of resume
    info["resume_preview"] = escape_html(resume_text);

    // set the source
    info["source"] = "Monster"

    return info;
}
