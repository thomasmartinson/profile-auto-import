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
				case "redirect":
                    redirect_to_notes();
                    break;
            }
        }  
    );
});


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
    // make sure the resume preview is loaded
    if ($(".textLayer span").length < 1) {
        alert("Please wait for the resume preview to load before importing.");
        return {};
    }

    // parse the resume text
    const px_buffer = 8;
    let resume_text = "";
	let short_resume_text = "";
    $("div.page div.textLayer").each(function(){ // iterate over each page
        // sort by "top" css value, and then by "left"
        let sorted_elems = $(this).children().sort(function(a, b) {
            let diff = a.offsetTop - b.offsetTop;
            if (diff == 0) {
                diff = a.offsetLeft - b.offsetLeft;
            }
            return diff;
        });

        let max_px_height = 0;
        sorted_elems.each(function() {
            let this_px_height = this.offsetTop;
            
            if (max_px_height + px_buffer < this_px_height) {
                max_px_height = this_px_height;
                resume_text += "\n";
            }
    
            resume_text += $(this).text() + " ";
            // approx first few lines of resume
            if (resume_text.length < SHORT_RESUME_LENGTH) {
                short_resume_text += $(this).text() + " ";
            }
        });
    });

    resume_text = clean_whitespace(resume_text);
    short_resume_text = clean_whitespace(resume_text);

    // extract details from resume text
    let parsed_info = parse_from_resume(short_resume_text);

    let info = {};

    // full name
    info["name"] = $("#profile-page-info-name").text().trim();

    // last user activity on the site
    info["last_activity"] = $("div[data-cy='profile-activity-date-last-active']").attr("title").split(": ")[1];
    
    // last time the resume was updated
    info["resume_updated"] = $("div[data-cy='profile-activity-resume-updated']").attr("title").split(": ")[1];
        
    // email address
    let scraped_email = $("li[data-cy='profile-actions-email-contact-link']:first div.media-body").text();
    // use parsed email first, and the scraped mail second, unless it is a Dice private email
    if (parsed_info.email) {
		info["email"] = parsed_info.email;
        if (!(/@mail\.dice\.com/.test(scraped_email)) 
            && (scraped_email.toLowerCase() !== parsed_info.email.toLowerCase()))  {
			info["email2"] = scraped_email;
		}
	} else {
		info["email"] = scraped_email;
	}
	
    // phone number
    info["phone"] = $("li[data-cy='profile-actions-phone-contact-link']:first div.media-body").text();
    if (!info.phone) {
        info.phone = parsed_info.phone;
    }
    info.phone = reformat_phone(info.phone);

    // home adress, or city of residence
    info["address"] = parsed_info.address;
    if (!info.address) {
        info.address = $("a[data-cy='location']:first").text().trim();
    }

    // work documents
    info["work_docs"] = $("span[data-cy='work-permit-document']").text().trim();
    
    // add resume text
    info["resume_preview"] = escape_html(resume_text);

    // get profile ID from the current URL
    info["profile_id"] = CURR_URL.split("profile/")[1].split("?")[0];
	
	// set the source
	info["source"] = "Dice"

    return info;
}
