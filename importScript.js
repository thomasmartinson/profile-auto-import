$(document).ready(function(){

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
        "location": { // TODO: handle multiple locations
            "sel": "a[data-cy='location']",
            "info": "text"
        }
    };

    // store candidate info into new object
    let candidate_info = {};

    for (let item in selectors) {
        let elem = $(selectors[item].sel);
        
        if (selectors[item].info === "text") {
            elem = elem.text();
        } else if (selectors[item].info === "title") {
            elem = elem.attr("title").split(": ")[1];
        }

        candidate_info[item] = elem;
    }

    // parse the resume text
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
    regexes["location"] = /\b\d+ [a-zA-Z., -]+ [A-Z]{2} +\d{5}(-\d{4})?\b/; 
    
    // parse email, phone number, and address fom resume text
    for (let item in regexes) {
        let matches = resume_text.match(regexes[item])
        if (matches != null) {
            candidate_info[item] = matches[0]; 
        }
    }

    // log candidate info
    for (let item in candidate_info) {
        console.log(`${item}: ${candidate_info[item]}`);
    }

    // get resume file
    // TODO

    // package all info into HTTP POST request using "multipart/form-data" body
    // TODO

});

