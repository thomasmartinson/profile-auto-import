// obj with regexes useful for parsing info from resume text
var REGEXES = {
    // adapted from https://www.regular-expressions.info/email.html
    "email": /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, 

    // original
    // 3 continuous digits, 3 continuous digits, 4 continuous digits, with optional periods, dashes, and spacing between    
    "phone": /\b\(?\d{3}\)?[ –.-]*\d{3}[ –.-]*\d{4}\b/,
    
    // mostly original, zip code portion from https://regexlib.com/REDetails.aspx?regexp_id=837
    // 1 or more digits, space, any combination of letters and certain punctuation, space, two-letter all-caps state code, space, zip code 
    "address": /\b\d+ [a-zA-Z., -]+ [A-Z]{2} +\d{5}(-\d{4})?\b/
};


// converts the given javascript object to an xml string
// logs all items in the object onto the console
function obj_to_xml(obj) {
    let xml_str = "";
    for (let item in obj) {
        console.log(`${item}: ${obj[item]}`);
        xml_str += `<${item}>${obj[item]}</${item}>\n`
    }
    xml_str = `<data>\n${xml_str}</data>`
    return xml_str;
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