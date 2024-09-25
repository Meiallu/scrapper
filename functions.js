import { Element } from "./parser.js";

export function readName(html, index) {
    let reading = false;
    let nameString = "";

    while (index < html.length) {
        const char = html[index++];

        if (char == '<') {
            reading = true;
            continue;
        }
        
        if (reading) {
            if (char == '>' || char == ' ') {
                return [nameString, index, char === '>'];
            }

            nameString += char;
        }
    }

    return [nameString, index, false];
}

export function findClose(html, index) {
    let elementsInBetween = [];
    let string = "";

    for (index; index < html.length; index++) {
        const char = html[index];

        if (char == '<') {
            let element = new Element(html, index);
            index = element.index;

            if (element.closing) {
                break;
            }

            elementsInBetween.push(element);
            continue;
        }

        if (char != '>') {
            string += char;
        }
    }

    return [elementsInBetween.length == 0 ? string : "", elementsInBetween, index];
}

export function jumpComment(html, index) {
    const [nameString, nameIndex] = readName(html, index);
    
    if (nameString === "!--") {
        const endIndex = html.indexOf('>', nameIndex);
        return endIndex !== -1 ? endIndex + 1 : index;
    }

    return index;
}

export function readProperties(html, index) {
    let properties = new Map();
    let reading = false;
    let key = "", value = "";

    while (index < html.length) {
        const char = html[index++];

        if (!reading) {
            if (char == '>') {
                break;
            }

            if (char == ' ' || char == '\n' || char == '	') {
                continue;
            }
            
            if (char == '=') {
                reading = true;
                index++;
                continue;
            }

            key += char;
        }

        if (reading) {
            if (char == '"') {
                reading = false;
                properties.set(key, value)
                key = "";
                value = "";
                continue;
            }

            value += char;
        }
    }

    return [properties, index];
}