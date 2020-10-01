$(document).ready(function(){

    let selectors = {
        "name": {
            "sel": "#profile-page-info-name",
            "attr": "text"
        },
        "last_activity": {
            "sel": "div[data-cy='profile-activity-date-last-active']", 
            "attr": "title"
        },
        "resume_updated": {
            "sel": "div[data-cy='profile-activity-resume-updated']", 
            "attr": "title"
        },
        "email": {
            "sel": "li[data-cy='profile-actions-email-contact-link'] div.media-body", 
            "attr": "text"
        },
        "phone": {
            "sel": "li[data-cy='profile-actions-phone-contact-link'] div.media-body", 
            "attr": "text"
        }
    };

    alert($(selectors.phone.sel).text());
    
});

