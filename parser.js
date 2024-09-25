import { jumpComment, readName, readProperties, findClose } from "./functions.js";

export class Document {
    constructor(plainHtml) {
        const html = plainHtml.replace("<!DOCTYPE html>", "");
        this.plainHtml = plainHtml;
        this.mainElement = new Element(html, 0);
    }

    getElementsByProperty(key, value) {
        let foundElements = [];

        const traverseElements = (elements) => {
            for (const element of elements) {
                if (element.properties.get(key) === value) {
                    foundElements.push(element);
                }
                if (element.elements.length) {
                    traverseElements(element.elements);
                }
            }
        };

        traverseElements([this.mainElement]);
        return foundElements;
    }

    getElementByProperty(key, value) {
        return this.getElementsByProperty(key, value)[0] || null;
    }
}

export class Element {
    constructor(html, index) {
        index = jumpComment(html, index);
        const [nameString, nameIndex, elementEnded] = readName(html, index);
        this.index = nameIndex;
        
        this.type = nameString;
        this.closing = nameString.startsWith('/');
        this.properties = new Map();
        this.elements = [];
        this.content = "";

        if (!this.closing) {
            if (!elementEnded) {
                const [properties, propertyIndex] = readProperties(html, nameIndex);
                this.properties = properties;
                this.index = propertyIndex;
            }

            if (!['img', 'input', 'br', 'hr', 'meta', 'link'].includes(this.type)) {
                let [inside, closeElements, closeIndex] = findClose(html, this.index);
    
                this.content = inside;
                this.elements = closeElements;
                this.index = closeIndex;
            }
        }
    }

    getChildByProperty(key, value) {
        return this.elements.find(element => element.properties.get(key) === value) || null;
    }

    getChildWhoHasProperty(key) {
        return this.elements.find(element => element.properties.has(key)) || null;
    }

    getProperty(key) {
        return this.properties.get(key);
    }
}