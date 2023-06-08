import puppeteer from "puppeteer-core";
import fs from "fs";
import { config } from "dotenv";
config();

export async function run(productName, numberOfProducts, numberOfPages, attempt = 1) {
//Creates a new directory for the product if it does not already exist
    try { fs.mkdirSync(`./${productName}`);
    console.log(`Creating directory ${productName}, Running with productName=${productName}, numberOfProducts=${numberOfProducts}`), `numberOfPages=${numberOfPages}`; 
        }
    catch (err) {if (err.code!=='EEXIST') throw err;
        else console.log(`${productName} Directory already exists, continuing with existing progress and url files`);}

    //Setting a cap on number of restarts
    if (attempt > 3) {
        console.log('Scraping failed after 3 attempts. Exiting...');
        return;
    }
        

    let browser;
    try {
        const auth = `${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}`;
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://${auth}@zproxy.lum-superproxy.io:9222`,
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(2*60*1000);

        let progress = {productName, productIndex: 0, reviewUrl: "", pageNum: 1, maxPages: numberOfPages}
        let reviewUrls;
        if (fs.existsSync(`./${productName}/progress.json`)) {
        progress=JSON.parse(fs.readFileSync(`./${productName}/progress.json`));
        reviewUrls= fs.readFileSync(`./${productName}/${productName}_urls.txt`, 'utf8').split('\n');
        } else {
        reviewUrls = await search(productName, numberOfProducts, page);
        } 

        for (let productIndex = progress.productIndex; productIndex < reviewUrls.length; productIndex++) {	
            console.log(`Scraping product ${productIndex + 1} of ${reviewUrls.length}`);	
            let reviewUrl = reviewUrls[productIndex];	
            progress.reviewUrl = reviewUrl;	
            progress.productIndex = productIndex; // Update productIndex in progress object


            fs.writeFileSync(`./${productName}/progress.json`, JSON.stringify(progress));

            await page.goto(reviewUrl + progress.pageNum);
            await scrapeReviews(page, reviewUrl, productName, progress);
        }
        

    }
    catch (e) {
        console.error('scrape failed', e);
        // wait for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
        // then try to rerun
        console.log('Restarting the scraping (attempt ' + (attempt + 1) + ' of 3)');
        run(productName, numberOfProducts, numberOfPages, attempt + 1);
    }
    finally{
        if (browser) {
            await browser.close();
        }
    }
}

async function search(productName, numberOfProducts, page) {
    console.log(`Searching with productName=${productName}, numberOfProducts=${numberOfProducts}`); // New line
    let browser;
    try {
        let baseUrl = 'https://www.amazon.com/s?k=' + encodeURIComponent(productName);

        await page.goto(baseUrl);

        const productIDs = await page.evaluate((numberOfProducts) => {
            return Array.from(
                document.querySelectorAll("div[data-asin][data-cel-widget^='search_result_']"),
                e => {
                    const isSponsored = e.querySelector("a.puis-sponsored-label-text") !== null;
                    return isSponsored ? null : e.getAttribute("data-asin");
                }).filter(e => e).slice(0,numberOfProducts); // filter out null values and empty strings because not every data-asin is a product
        }, numberOfProducts);
        

       // Create review URLs
       const reviewUrls = productIDs.map(id => `https://www.amazon.com/product-reviews/${id}/ref=cm_cr_arp_d_viewopt_srt?sortBy=recent&pageNumber=`);

       fs.writeFileSync(`./${productName}/${productName}_urls.txt`, reviewUrls.join('\n'));

       return reviewUrls;


    } catch (error) {
        console.error(error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}


async function scrapeReviews(page, baseUrl, productName, progress) {
    let reviews = [];

    console.log(`Writing file for product: ${productName}`);
    if (fs.existsSync(`./${productName}/${productName}_reviews.json`)) {
        reviews = JSON.parse(fs.readFileSync(`./${productName}/${productName}_reviews.json`));
    }

    let keepScraping = true;
    let pageNum = progress.pageNum; // Start from where we left off

    while (keepScraping && pageNum <= progress.maxPages) {
        console.log(`Scraping page ${pageNum}`);
        // scrape reviews
        const newReviews = await scrapeCurrentPageReviews(page);
        for (let i = 0; i < newReviews.length; i++) {
            const review = newReviews[i];
            console.log(`Scraped review ${i + 1} of page ${pageNum}`);
            reviews.push(review);
        }

// write reviews to file
        fs.writeFileSync(`./${productName}/${productName}_reviews.json`, JSON.stringify(reviews));

        // Check if the 'next page' button is disabled
        const isNextPageDisabled = await page.evaluate(() => {
            const nextPageButton = document.querySelector('li.a-last');
            return nextPageButton.classList.contains('a-disabled');
        });

        if (!isNextPageDisabled) {
            console.log('Going to next page');
            pageNum++;
            progress.pageNum = pageNum; // Update pageNum in progress object
            fs.writeFileSync(`./${productName}/progress.json`, JSON.stringify(progress));
            // Wait for navigation and then go to the next page
            const [response] = await Promise.all([
                page.waitForNavigation(), 
                page.goto(baseUrl + pageNum),
            ]);
            await page.waitForTimeout(3000);
        } else {
            keepScraping = false;
            console.log('Done scraping');
            progress.pageNum = 1;
            fs.writeFileSync(`./${productName}/progress.json`, JSON.stringify(progress));
        }
    }

    // Reset pageNum to 1 if we've reached the maxPages and exit the while loop
    if (pageNum > progress.maxPages) {
        progress.pageNum = 1;
        fs.writeFileSync(`./${productName}/progress.json`, JSON.stringify(progress));
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

// run('apple watch', 3).catch(console.error);
