async function search(productName, numberOfProducts, page) {
    console.log(`Searching with productName=${productName}, numberOfProducts=${numberOfProducts}`); // New line
    let browser;
    try {
        let baseUrl = 'https://www.amazon.com/s?k=' + encodeURIComponent(productName);

        await page.goto(baseUrl);

        // Get the productIDs from the page
        const productIDs = await page.evaluate((numberOfProducts) => {
            return Array.from(document.querySelectorAll("div[data-asin]"), e => e.getAttribute("data-asin"))
                .filter(e => e) // filter out empty strings because not every data-asin is a product
                .slice(0, numberOfProducts); // get up to the user-selected number of items
        }, numberOfProducts);  // Passing numberOfProducts here
        

       // Create review URLs
       const reviewUrls = productIDs.map(id => `https://www.amazon.com/product-reviews/${id}/ref=cm_cr_arp_d_viewopt_srt?sortBy=recent&pageNumber=`);

       fs.writeFileSync(`${productName}_urls.txt`, reviewUrls.join('\n'));

       return reviewUrls;


    } catch (error) {
        console.error(error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}