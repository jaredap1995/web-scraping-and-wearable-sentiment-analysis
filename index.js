import puppeteer from "puppeteer-core";
import fs from "fs";
import { config } from "dotenv";
config();

async function run() {
    let browser;
    try {
        const auth = `${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}`;
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://${auth}@zproxy.lum-superproxy.io:9222`,
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(2*60*1000);
        let pageNum = 1;
        let baseUrl = 'https://www.amazon.com/product-reviews/B09BXQ4HMB/ref=cm_cr_arp_d_viewopt_srt?sortBy=recent&pageNumber=';

        await page.goto(baseUrl + pageNum);

        const reviews = await scrapeReviews(page, baseUrl);
    }
    catch (e) {
        console.error('scrape failed', e);
    }
    finally{
        if (browser) {
            await browser.close();
        }
    }
}


async function scrapeReviews(page, baseUrl) {
    let reviews = [];

    if (fs.existsSync('all_reviews.json')) {
        reviews=JSON.parse(fs.readFileSync('all_reviews.json'));
    }

    let keepScraping = true;
    const reviewCounts = {};
    let pageNum = 1;

    while (keepScraping) {
        console.log(`Scraping page ${pageNum}`);
        // scrape reviews
        const newReviews = await scrapeCurrentPageReviews(page);
        console.log(newReviews)
        for (let i = 0; i < newReviews.length; i++) {
            const review = newReviews[i];
            console.log(`Scraped review ${i + 1} of page ${pageNum}`);
            reviews.push(review);
        }

        // write reviews to file
        fs.writeFileSync(`all_reviews.json`, JSON.stringify(reviews));

        // Check if the 'next page' button is disabled
        const isNextPageDisabled = await page.evaluate(() => {
            const nextPageButton = document.querySelector('li.a-last');
            return nextPageButton.classList.contains('a-disabled');
        });

        if (!isNextPageDisabled) {
            console.log('Going to next page');
            pageNum++;
            // Wait for navigation and then go to the next page
            const [response] = await Promise.all([
            page.waitForNavigation(), 
            page.goto(baseUrl + pageNum),
            ]);
            await page.waitForTimeout(3000);
        } else {
            keepScraping = false;
            console.log('Done scraping');
    }
    }

    return reviews;
}

async function scrapeCurrentPageReviews(page) {
    await page.waitForSelector('.a-section.review.aok-relative')
    page.on('console', consoleObj => console.log(consoleObj.text()));
    await page.waitForTimeout(3000);
    let translateButton = await page.$('[data-hook="cr-translate-these-reviews-link"]');
        if (translateButton) {
            await page.waitForTimeout(3000);
            await translateButton.evaluate(b => b.click());
            }
    await page.waitForTimeout(3000);
    return page.evaluate(() => {
        const translateButton = document.querySelector('[data-hook="cr-translate-these-reviews-link"]');
        const reviewElements = document.querySelectorAll('.a-section.review.aok-relative');
        const reviews = [];
        for (let reviewElement of reviewElements) {
            let titleElement;
            const starsElement = reviewElement.querySelector('i.review-rating');
            const dateElement = reviewElement.querySelector('span.review-date');
            let textElement;
            const translatedReviewContent = reviewElement.querySelector('span.cr-translated-review-content.aok-hidden');
        
            try {
                // Attempt to find 'a.review-title'
                titleElement = reviewElement.querySelector('a.review-title');
                if (!titleElement) throw new Error('No element with a.review-title found');
            } catch (error) {
                // If 'a.review-title' is not found, fall back to 'span.review-title'
                console.log(error); // Optional: log the error message
                titleElement = reviewElement.querySelector('span.review-title');
            }


            // Check if 'span.cr-translated-review-content.aok-hidden' exists...would mean that button was not clicked
            if (!translatedReviewContent) {
                textElement = reviewElement.querySelector('span.review-text-content');
            } else {
                let nodes = reviewElement.querySelectorAll('span.cr-translated-review-content.aok-hidden');
                if (nodes.length > 2) {
                    titleElement = nodes[1]; // nodes[1] is the translated title element
                    textElement = nodes[2]; // nodes[2] is the translated text element
                }
            }
            


            
            if (dateElement || titleElement || starsElement || textElement) {
                const title = titleElement.innerText;
                const stars = starsElement.getAttribute('class').split(' ')[2].slice(-1);
                const text = textElement.innerText;
                const date = dateElement.innerText;
                
                reviews.push({
                    title: title,
                    stars: stars,
                    text: text,
                    date: date
                });
            }
        }
        return reviews;
    });
}

run().catch(console.error);
