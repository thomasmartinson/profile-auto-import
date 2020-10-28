//
//   utility functions for import
//

// enable the extension popup
chrome.runtime.sendMessage({ "type": "activate-icon" });

const SHORT_RESUME_LENGTH = 300;

// obj with regexes useful for parsing info from resume text
var REGEXES = {
    // adapted from https://www.regular-expressions.info/email.html
    email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,

    // original
    // 3 continuous digits, 3 continuous digits, 4 continuous digits, with optional periods, dashes, and spacing between    
    phone: /\b\(?\d{3}\)?[ –.-]*\d{3}[ –.-]*\d{4}\b/,

    // mostly original, zip code portion from https://regexlib.com/REDetails.aspx?regexp_id=837
    // 1 or more digits, optional dash followed by numbers, space, any combination of alphanumeric characters and certain punctuation, two-letter all-caps state code or state, space, zip code 
    address: /\b\d+(-\d+)? [a-zA-Z0-9., #\r\n-]+[A-Z]{1}[a-zA-Z]+ ?,? +\d{5}(-\d{4})?\b/
};


// return as an object the parseable info from the given string
// log it to the console along the way
function parse_from_resume(text) {
    parsed_info = {};
    for (let item in REGEXES) {
        parsed_info[item] = ""; // default to empty string

        let matches = text.match(REGEXES[item]);
        if (matches != null) {
            let info = matches[0];
            parsed_info[item] = info;
            console.log(`Parsed ${item} : ${info}`);
        }
    }
    return parsed_info;
}


// returns a string with all whitespace replaced with " " or "\n"
function clean_whitespace(dirty_str) {
    return dirty_str
        .replace(/\r\v/g, "\n") // vertical
        .replace(/[^\S\n]/g, " "); // horizontal
}


// redirects to the notes protocol URL for the import document
function redirect_to_notes() {
    let notes_url = "notes:///8525644700814E57/C371775EAC5E88788525639E007B03A6/3A553EB348165344852585FB00783986";
    window.location.href = notes_url;
}


// escapes all html chars in a given string
function escape_html(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// reformats the given phone number string to contain only numbers
function reformat_phone(str) {
    return str.replaceAll(/[^0-9]/g, "");
}
