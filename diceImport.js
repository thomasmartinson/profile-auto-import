let CURR_URL;
let OVERRIDE = false;

$(document).ready(function () {
    let candidate_info = {};

    // update current URL
    chrome.runtime.sendMessage({ type: "url-request" }, function (response) {
        CURR_URL = response;
    });

    // handle messages
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
                case "override":
                    OVERRIDE = true;
                    sendResponse();
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
    let actualCode = `document.getElementsByClassName('dropdown-item')[1].click()`;
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}


// extracts all info from candidate profile page, returned in an object
function scrape() {
    // make sure the resume preview is loaded
    if ($(".textLayer span").length < 1 && !OVERRIDE) {
        OVERRIDE = false;
        return "Please wait for the resume preview to load before importing.";
    }

    // parse the resume text
    let resume_text = "";
    let unsorted_resume_text = "";
    $("div.page div.textLayer").each(function () { // iterate over each page
        // sort by "top" css value, and then by "left"
        let sorted_elems = $(this).children().sort(function (a, b) {
            let diff = a.offsetTop - b.offsetTop;
            if (diff == 0) {
                diff = a.offsetLeft - b.offsetLeft;
            }
            return diff;
        });
        let unsorted_elems = $(this).children();

        resume_text += capture_resume_text(sorted_elems);
        unsorted_resume_text += capture_resume_text(unsorted_elems);
    });

    resume_text = clean_whitespace(resume_text);
    unsorted_resume_text = clean_whitespace(unsorted_resume_text);

    let short_resume_text = resume_text.substring(0, SHORT_RESUME_LENGTH);
    let short_unsorted_resume_text = unsorted_resume_text.substring(0, SHORT_RESUME_LENGTH + 50);
    
    // extract details from resume text
    let parsed_info = parse_from_resume(short_resume_text);
    console.log("Parsing unsorted text...");
    let parsed_info_unsorted = parse_from_resume(short_unsorted_resume_text);
    for (item in parsed_info) {
        if (!parsed_info[item] && parsed_info_unsorted[item]) {
            parsed_info[item] = parsed_info_unsorted[item];
        }
    }
    console.log(`Unsorted resume short text :\n${short_unsorted_resume_text}`);

    let info = {};

    // full name
    info.name = $("#profile-page-info-name").text().trim();

    // last user activity on the site
    info.last_activity = $("div[data-cy='profile-activity-date-last-active']").attr("title").split(": ")[1];

    // last time the resume was updated
    info.resume_updated = $("div[data-cy='profile-activity-resume-updated']").attr("title").split(": ")[1];

    // email address
    let scraped_email = $("li[data-cy='profile-actions-email-contact-link']:first div.media-body").text().toLowerCase();
    let scraped_email_2 = $("li[data-cy='profile-actions-email-contact-link']:last div.media-body").text().toLowerCase();
    // assign first email, giving priority to parsed email
    if (parsed_info.email) {
        info.email = parsed_info.email;
    } else {
        info.email = scraped_email;
    }
    // assign second email, checking for no duplicates or Dice private emails
    if (scraped_email !== info.email && !is_private(scraped_email)) {
        info.email2 = scraped_email;
    } else if (scraped_email_2 !== info.email && !is_private(scraped_email_2)) {
        info.email2 = scraped_email_2;
    }

    // phone number, prioritizing scraped numbers over parsed number
    let scraped_phone = reformat_phone($("li[data-cy='profile-actions-phone-contact-link']:first div.media-body").text());
    let scraped_phone_2 = reformat_phone($("li[data-cy='profile-actions-phone-contact-link']:last div.media-body").text());
    let parsed_phone = reformat_phone(parsed_info.phone);
    // first number
    if (scraped_phone) {
        info.phone = scraped_phone;
    } else if (scraped_phone_2) {
        info.phone = scraped_phone_2;
    } else {
        info.phone = parsed_phone;
    }
    // second number
    if (scraped_phone_2 && scraped_phone_2 !== info.phone) {
        info.phone2 = scraped_phone_2;
    } else if (parsed_phone && parsed_phone !== info.phone) {
        info.phone2 = parsed_phone;
    }

    // home adress, or city of residence
    info.address = parsed_info.address;
    if (!info.address) {
        info.address = $("a[data-cy='location']:first").text().trim();
    }

    // work documents
    info.work_docs = $("span[data-cy='work-permit-document']").text().trim();

    // add resume text
    info.resume_preview = escape_html(resume_text);

    // get profile ID from the current URL
    info.profile_id = CURR_URL.split("profile/")[1].split("?")[0];

    // set the source
    info.source = "Dice";

    return info;
}


// capture the resume text from the given resume elements
function capture_resume_text(elems) {
    const px_buffer = 8;

    let resume_text = "";
    let max_px_height = 0;
    elems.each(function () {
        let this_px_height = this.offsetTop;

        if (Math.abs(this_px_height - max_px_height) > px_buffer) {
            max_px_height = this_px_height;
            resume_text += "\n";
        }

        resume_text += $(this).text() + " ";
    });

    return resume_text;
}


// returns true if the given string is a Dice private email
function is_private(str) {
    return /@mail\.dice\.com/.test(str);
}
