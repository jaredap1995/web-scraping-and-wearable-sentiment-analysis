import express from 'express';
import { run } from './index.js';
const app = express();
import fs from "fs";
import path from 'path';
const port = 3000;
const router = express.Router();

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true })); // to handle form data

app.get('/', function(req, res, next) {
// Grabs your directories for continuing scraping on a previous product
    const directories = fs.readdirSync('./', { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    res.render('index', { title: 'Scraping', directories });
  });

app.post('/scrape', async (req, res) => {
    let newProductName = req.body.newProductName;
    let existingProductName = req.body.existingProductName;
    let numberOfProducts = req.body.numberOfProducts;
    let numberOfPages = req.body.numberOfPages;

    if (existingProductName) {
        numberOfPages = 0; // Does not matter because values will be set by progress.json
        numberOfProducts = 0; // Does not matter because values will be set by progress.json
        try{
            await run (existingProductName, numberOfProducts, numberOfPages);
            res.redirect('/');
        } catch (err) {
            console.error('scrape failed', err);
            res.status(500).send({'Error Occurred During Scraping': err});
        }
    } else {
        let productName = newProductName;
        if (isNaN(numberOfPages)|| numberOfPages ===''){
//Set to a high number to maximize reviews. Most products have less than 1000 pages of reviews.
            numberOfPages = 1000; 
        }
        if (isNaN(numberOfProducts)|| numberOfProducts ===''){
//Assumed to be a single product, though this number should be adjusted because sometimes the product that gets returned by the array is not the most reviewed product.
            numberOfProducts = 1; 
        }
        try{
            await run (productName, numberOfProducts, numberOfPages);
            res.redirect('/');
        } catch (err) {
            console.error('scrape failed', err);
            res.status(500).send({'Error Occurred During Scraping': err});
        }
    }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));