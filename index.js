const https = require('node:https');
const fs = require('node:fs');
require('dotenv').config();
const puppeteer = require('puppeteer');

(async function() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(process.env.SEARCH_URL);

    await page.waitForSelector('.serp-item__link');
    await page.click('.serp-item__link');

    await page.setViewport({
        width: 1200,
        height: 800
    });

    await page.waitForSelector('.MMImage-Origin');
    await page.screenshot({path: 'screen.png'});

    let images = await page.evaluate(() => {
        let imgElements = document.querySelectorAll('.serp-item__thumb');
        let URLsElements = Object.values(imgElements).map(
            imgElement => ({
                src: imgElement.src,
                alt: imgElement.alt,
            })
        )
        return URLsElements;
    })

    console.log(images);
    fs.writeFile('result.json', JSON.stringify(images, null, ''), err => {
        if(err) return err;
        console.log('images > result.json');
    })

    images.forEach(
        (image, index) => {
            const file = fs.createWriteStream(`images/${index}.webp`);
            const request = https.get(image.src, response => {
                response.pipe(file);
            })
        }
    )

    await browser.close();
})();