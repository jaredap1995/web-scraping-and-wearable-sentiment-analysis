# Amazon Reviews Scraper

This project harnesses the power of Node.js, Puppeteer, and the Bright Data Proxy Browser to scrape thousands of product reviews of different products from Amazon. The inspiration and initial code template for this project was sourced from https://www.youtube.com/watch?v=qo_fUjb02ns

The scraper will start scraping Amazon for reviews of the desired product, and the scraped data will be saved in a JSON file in the project directory. The script will create new directories for new products or acces existing ones. The outputs of this web scraper essentially create a custom API for Amazon reviews.

![Example Output](screenshot.png "Example output")


The subsequent data is stored in a postgres instance using the special JSONB object type and will be used to perform a detailed sentiment analysis on various wearable technology products for market research, revealing which features are most frequently praised and which ones could use some improvement. More use cases for the data including a type of vector database are being workshopped. 

## Installation and Setup Instructions

This project uses Node.js and Puppeteer. Follow these steps to set up and run the project on your local machine:
1. **Clone the Repository:**
    ```bash
    mkdir scrpaing_directory
    cd scraping_directory
    git clone https://github.com/jaredap1995/web-scraping-and-wearable-sentiment-analysis.git
    ```
    Because the application will create and access directories it is best to use an empty directory to minimize clutter. 

2. **Install Dependencies:**
    Install the necessary dependencies by running `npm install` in your terminal.

3. **Environment Variables:**
    This project uses environment variables to handle sensitive data. Create a `.env` file in the root directory and fill it with your own information:
    This project uses the bright_data proxy browser so that could be replaced with a different proxy browser or any individual strategy for IP rotation. 

    ```env
    BRIGHT_DATA_USERNAME=your_username
    BRIGHT_DATA_PASSWORD=your_password
    ```

4. **Running the Project:**
    After following the above steps, you should now be ready to run the project using the command: 

    ```bash
    node app.js
    ```

    Once the application starts, navigate to `http://localhost:3000/` in your web browser.

5. **Scraping:**
    - To scrape a new product, fill in the 'Product' field with the name of the product you wish to scrape and optionally specify the number of products (defaults to 1 though it is reccomended to do more than 1 as the products are not always returned in the order of most reviews first) and pages to scrape (defaults to 1000).
    - To scrape an existing product, select the product from the dropdown list and the scraper will continue from where it left off.
    - Perhaps make the HTML look pretty while the scraper runs so you dont have to sart at such a horrible layout.

---


## Solved Issues
- Rudimentary solution to locally tracking progress in scraping by using a JSON file that is updated at each new page and product.
- Recursive call to run within error catch block allows scraping to continue when it fails.
- If max attempts of recursion are reached then restarting can be easily done by simply selecting the directory of the product you want to continue scraping. 


## Issues
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
