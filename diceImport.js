let CURR_URL;

$(document).ready(function(){ 
    let candidate_info = {};
    
    // update current URL
    chrome.runtime.sendMessage({type:"url-request"}, function(response){
        CURR_URL = response;
    });

    // handle messages
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse){
            switch(message.type) {
                case "scrape":
                    candidate_info = scrape();     
                    sendResponse(candidate_info);
                    break;
                case "download":
                    download_resume();
                    break;
                case "filename":
                    candidate_info["resume-file"] = message.filename;
                    import_profile(candidate_info);
                    break;
            }
        }  
    );
});


// downloads candidate info as XML and redirects to import link
function import_profile(candidate_info) {
    // download xml
    download_xml(obj_to_xml(candidate_info));

    // redirect
    let notes_url = "notes:///8525644700814E57/C371775EAC5E88788525639E007B03A6/3A553EB348165344852585FB00783986";
    window.location.href = notes_url;    
}


// downloads the resume file
function download_resume() {
    $("#button-download-resume").click();
    // inject script into web page
    // source: https://stackoverflow.com/a/9517879
    var actualCode = `document.getElementsByClassName('dropdown-item')[1].click()`;
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
}


// extracts all info from candidate profile page, returned in an object
function scrape() {
    // object containing all jQuery selectors of basic profile elements we care about
    // sel: text of the jQuery selector for the desired element
    // info: where the desired information is stored
    //      - "text": within the text of the element 
    //      - "title": within title attribute
    let selectors = {
        "name": {
            "sel": "#profile-page-info-name",
            "info": "text"
        },
        "last_activity": {
            "sel": "div[data-cy='profile-activity-date-last-active']", 
            "info": "title"
        },
        "resume_updated": {
            "sel": "div[data-cy='profile-activity-resume-updated']", 
            "info": "title"
        },
        "email": {
            "sel": "li[data-cy='profile-actions-email-contact-link'] div.media-body", 
            "info": "text"
        },
        "phone": {
            "sel": "li[data-cy='profile-actions-phone-contact-link'] div.media-body", 
            "info": "text"
        },
        "address": { // TODO: handle multiple locations
            "sel": "a[data-cy='location']",
            "info": "text"
        },
        "work_docs": {
            "sel": "span[data-cy='work-permit-document']",
            "info": "text"
        }
    };

    // store candidate info into new object
    let candidate_info = {};

    for (let item in selectors) {
        let elem = $(selectors[item].sel);
        
        let info = ""
        if (selectors[item].info === "text") {
            info = elem.text();
        } else if (selectors[item].info === "title") {
            info = elem.attr("title").split(": ")[1];
        }

        candidate_info[item] = info.trim();
    }

    // parse the resume text
    const max_length = 250;
    let resume_text = "";
	let short_resume_text = "";
    let max_px_height = 0;
    let px_buffer = 8;
    $("div.textLayer span").each(function() {

        let this_px_height = parseFloat($(this).css("top").replace("px", ""));
		
		if (max_px_height > this_px_height) {
			// new page
			max_px_height = 0;}
		
        if (max_px_height + px_buffer < this_px_height) {
            max_px_height = this_px_height;
            resume_text += "\n";
        }

        resume_text += $(this).text() + " ";
		// approx first few lines of resume
        if (resume_text.length < max_length) {
            short_resume_text += $(this).text() + " ";
        }
    });

    // parse email, phone number, and address fom resume text
    for (let item in REGEXES) {
        let matches = short_resume_text.match(REGEXES[item]);
		
        if (matches != null) {
            let info = matches[0];
            if (item == "phone") {
                info = reformat_phone(info);
            }
            candidate_info[item] = info;
            // TODO prioritize original for phone and email
        }
    }

    // add resume text and resume filename
    candidate_info["resume_preview"] = escape_html(resume_text);
    candidate_info["resume_file"] = `Dice_Resume_CV_${candidate_info["name"].replaceAll(" ", "_")}.pdf`

    // get profile ID from the current URL
    candidate_info["profile_id"] = CURR_URL.split("profile/")[1].split("?")[0];

    return candidate_info;
}
