# Amazon Reviews Scraper

This project harnesses the power of Node.js, Puppeteer, and the Bright Data Proxy Browser to scrape thousands of product reviews of different products from Amazon. The inspiration and initial code template for this project was sourced from https://www.youtube.com/watch?v=qo_fUjb02ns

The scraper will start scraping Amazon for reviews of the desired product, and the scraped data will be saved in a JSON file in the project directory. The script will create new directories for new products or acces existing ones. The outputs of this web scraper essentially create a custom API for Amazon reviews.

![Example Output](screenshot.png "Example output")


The subsequent data is stored in a postgres instance using the special JSONB object type and will be used to perform a detailed sentiment analysis on various wearable technology products for market research, revealing which features are most frequently praised and which ones could use some improvement. More use cases for the data including a type of vector database are being workshopped. 

## Solved Issues
- Rudimentary solution to locally tracking progress in scraping by using a JSON file that is updated at each new page and product.
- Restarting can be easily done by simply selecting the directory of the product you want to continue scraping. 


## Issues
- Looking to automate the restarting process to remove the user interaction with page.
- Looking to find a way to run the process on a web socket so someone interested can simply travel to a webapge, enter in their bright data information and scrape without needing to clone the repository. 
- Will myself to care about improving the dreaded front end even though I don't care about front end.
- I made every attempt to maximize the amount of reviews scraped which included getting reviews from different languages. In some instances the 'innerText' was undefined. If this appears restarting the script will work, however in the event the HTML format on the page has changed you may need to manually modify the HTML element. Usually this error is related to the 'textElement' or 'titleElement'. You may also circumvent this issue by changing my '||' to '&&' in the 'scrapeCurrentPageReviews' function


## Features

- Efficiently scrapes thousands of reviews with the use of Bright Data Proxy Browser.
- Uses Puppeteer, a powerful browser automation tool, to interact with the Amazon website just like a human user would.

## Coming Soon
- Performs sentiment analysis on the collected reviews to identify commonly praised and criticized product features.
- Streamlined process that allows users to select their product of interest and allow the script to run in the background without user interaction.

------
