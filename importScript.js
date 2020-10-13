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
                    download(xml_str, 'profile_import.xml', 'text/xml');
                    // download resume
                    $("#button-download-resume").click();
                    // inject script into web page
                    // source: https://stackoverflow.com/a/9517879
                    var actualCode = `document.getElementsByClassName('dropdown-item')[0].click()`;
                    var script = document.createElement('script');
                    script.textContent = actualCode;
                    (document.head||document.documentElement).appendChild(script);
                    script.remove();
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
// TODO change to on button press, not page load

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
            info = elem.attr("title").split(": ")[1]; // TODO got a bug here, couldn't split
        }

        candidate_info[item] = info.trim();
    }

    // parse the resume text
    // TODO potential bug - script is run when resume is not visible or not yet loaded
    // TODO attempt to capture line breaks
    const max_length = 1000;
    let resume_text = ""
    $("div.textLayer span").each(function() {
        // approx first 10 lines of resume
        if (resume_text.length > max_length) {
            return;
        }
        
        resume_text += $(this).text() + " ";
    });

    // define regexes
    let regexes = {};

    // adapted from https://www.regular-expressions.info/email.html
    regexes["email"] = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/; 
    
    // original
    // 3 continuous digits, 3 continuous digits, 4 continuous digits, with optional periods, dashes, and spacing between    
    regexes["phone"] = /\b\(?\d{3}\)?[ –.-]*\d{3}[ –.-]*\d{4}\b/; 
    
    // mostly original, zip code portion from https://regexlib.com/REDetails.aspx?regexp_id=837
    // 1 or more digits, space, any combination of letters and certain punctuation, space, two-letter all-caps state code, space, zip code 
    regexes["address"] = /\b\d+ [a-zA-Z., -]+ [A-Z]{2} +\d{5}(-\d{4})?\b/; 
    
    // parse email, phone number, and address fom resume text
    for (let item in regexes) {
        let matches = resume_text.match(regexes[item]);
        if (matches != null) {
            let info = matches[0];
            if (item == "phone") {
                info = info.replaceAll(/[^0-9]/g, "");
            }
            candidate_info[item] = info;
            // TODO prioritize original for phone and email
        }
    }

    // add resume text and resume filename
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
    candidate_info["resume_preview"] = escapeHtml(resume_text);
    candidate_info["resume_file"] = `Dice_Resume_CV_${candidate_info["name"].replaceAll(" ", "_")}.pdf`

    // log candidate info
    // build xml string
    let xml_str = "";
    for (let item in candidate_info) {
        console.log(`${item}: ${candidate_info[item]}`);
        xml_str += `<${item}>${candidate_info[item]}</${item}>\n`
    }
    xml_str = `<data>\n${xml_str}</data>`  

    console.log(resume_text);

    // redirect
    // let notes_url = "notes:///8525644700814E57/C371775EAC5E88788525639E007B03A6/3A553EB348165344852585FB00783986";
    // window.location.href = notes_url;
    return xml_str;
}
