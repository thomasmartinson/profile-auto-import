$(document).ready(function(){ 
    let xml_str = "";
    
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse){
            switch(message.type) {
                case "scrape":
                    xml_str = import_profile();     
                    sendResponse(xml_str);
                    break;
                case "import":
                    // download xml
                    download(xml_str, 'profile_import.xml', 'text/xml');
                    
                    // download resume
                    $("#button-download-resume").click();
                    // inject script into web page
                    // source: https://stackoverflow.com/a/9517879
                    var actualCode = `document.getElementsByClassName('dropdown-item')[1].click()`;
                    var script = document.createElement('script');
                    script.textContent = actualCode;
                    (document.head||document.documentElement).appendChild(script);
                    script.remove();
                    
                    // redirect
                    let notes_url = "notes:///8525644700814E57/C371775EAC5E88788525639E007B03A6/3A553EB348165344852585FB00783986";
                    window.location.href = notes_url;
                    break;
            }
            
    });
});


// Function to download data to a file
// Adapted from https://stackoverflow.com/a/30832210 
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


function import_profile() {
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
    const max_length = 1000;
    let resume_text = "";
    let max_px_height = 0;
    let px_buffer = 8;
    $("div.textLayer span").each(function() {
        // approx first 10 lines of resume
        if (resume_text.length > max_length) {
            return;
        }
        
        let this_px_height = parseFloat($(this).css("top").replace("px", ""));
        if (max_px_height + px_buffer < this_px_height) {
            max_px_height = this_px_height;
            resume_text += "\n";
        }

        resume_text += $(this).text() + " ";
    });

    // parse email, phone number, and address fom resume text
    for (let item in REGEXES) {
        let matches = resume_text.match(REGEXES[item]);
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

    // build xml string
    let xml_str = obj_to_xml(candidate_info);

    return xml_str;
}
