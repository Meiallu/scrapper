import { Document } from "./parser.js";
import express from 'express';

const app = express();
const port = 3000;

class Laptop {
    constructor(price, link, title, description, reviewAmount, reviewPoints) {
        this.price = price;
        this.link = link;
        this.title = title;
        this.description = description;
        this.reviewAmount = reviewAmount;
        this.reviewPoints = reviewPoints;
    }
}

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        const notebooks = await scrapePage(1, []);
        res.json(notebooks);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`O servidor está rodando em: ${port}`);
});

async function scrapePage(page, notebooks) {
    try {
        const response = await fetch(`https://webscraper.io/test-sites/e-commerce/static/computers/laptops?page=${page}`);
        const html = await response.text();
        
        const doc = new Document(html);
        const cards = doc.getElementsByProperty("class", "product-wrapper card-body");

        if (cards.length == 0) {
            return notebooks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        }

        for (const container of cards) {
            const caption = container.getChildByProperty("class", "caption");
            const ratings = container.getChildByProperty("class", "ratings");

            const titleContainer = caption.elements[1];
            const titleElement = titleContainer.getChildByProperty("class", "title");

            const reviewAmount = ratings.getChildByProperty("class", "review-count float-end").content;
            const reviewPoints = ratings.getChildWhoHasProperty("data-rating").getProperty("data-rating");
            const price = caption.getChildByProperty("class", "price float-end card-title pull-right").content.replace("$", "");
            const link = titleElement.getProperty("href");
            const title = titleElement.getProperty("title");
            const description = caption.getChildByProperty("class", "description card-text").content;

            if (title.startsWith("ThinkPad") || title.startsWith("Lenovo")) {
                const laptop = new Laptop(price, link, title, description, reviewAmount, reviewPoints);
                notebooks.push(laptop);
            }
        }

        return scrapePage(page + 1, notebooks);
    } catch (error) {
        console.error('Error:', error);
    }
}
