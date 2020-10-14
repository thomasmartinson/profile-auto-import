// converts the given javascript object to an xml string
function obj_to_xml(obj) {
    let xml_str = "";
    for (let item in obj) {
        console.log(`${item}: ${obj[item]}`);
        xml_str += `<${item}>${obj[item]}</${item}>\n`
    }
    xml_str = `<data>\n${xml_str}</data>`
    return xml_str;
}