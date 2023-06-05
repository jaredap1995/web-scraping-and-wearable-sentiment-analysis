# Amazon Wearable Tech Reviews Scraper

This project harnesses the power of Node.js, Puppeteer, and the Bright Data Proxy Browser to scrape thousands of product reviews of different wearable technologies from Amazon. This large data collection enables us to perform a detailed sentiment analysis on various wearable technology products for market research, revealing which features are most frequently praised and which ones could use some improvement.

## Table of Contents

- [Getting Started](#getting-started)
- [Usage](#usage)
- [Features](#features)

## Getting Started

You need Node.js installed on your system to run this project. If you haven't installed it yet, you can download it from [here](https://nodejs.org/).

### Prerequisites

- Node.js
- NPM (comes bundled with Node.js)

### Installing

After installing Node.js, clone this repository and install the dependencies with the following commands:

```sh
git clone https://github.com/jaredap1995/web-scraping-and-wearable-sentiment-analysis.git
cd web-scraping-and-wearable-sentiment-analysis
npm install
```

## Usage

You can run the scraper with the following command:

```sh
npm start
```

The scraper will start scraping Amazon for reviews of wearable technology products, and the scraped data will be saved in a JSON file in the project directory.

## Features

- Efficiently scrapes thousands of reviews with the use of Bright Data Proxy Browser.
- Uses Puppeteer, a powerful browser automation tool, to interact with the Amazon website just like a human user would.
- Performs sentiment analysis on the collected reviews to identify commonly praised and criticized product features.

## Contact

If you have any questions, feel free to open an issue or submit a pull request. Enjoy scraping!

------
