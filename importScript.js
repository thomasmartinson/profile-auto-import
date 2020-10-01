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

    // log all information
    for (let item in selectors) {
        let elem = $(selectors[item].sel);
        if (selectors[item].info === "text") {
            elem = elem.text();
        } else if (selectors[item].info === "title") {
            elem = elem.attr("title").split(": ")[1];
        }
        console.log(`${item}: ${elem}`)
    }

    // get first 10 lines of resume
    // TODO

    // parse email, phone, full address from resume
    // TODO

    // get resume file
    // TODO

    // package all info into HTTP POST request using "multipart/form-data" body

});

