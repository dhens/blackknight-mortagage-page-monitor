require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');
const puppeteer = require('puppeteer');
const expressTools = require('./express-tools')
const { body, validationResult } = require('express-validator');
const API_PORT = process.env.API_PORT;

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES
app.get('/', (req, res) => {
    res.send('Welcome!');
});

// convert url to DOM data and send back to client
app.post('/page', [
    body('message').isURL(),    // Validate that the data submitted is a URL
    body('notifyOnReply').toBoolean()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    // If there are errors, return a 400 with the errors to the client
        console.log('/page POST validation failed: ' + req.body.message)
        return res.send('Error');
    }
    else {
        axios.get(req.body.message) // Grab the DOM data of the user submitted URL
            .then(function (response) {
                if (response.name) { // If response has a .name value, it means an error was returned from axios
                    res.send('Error');
                    return;
                }
                else {
                    res.send(response.data);
                    // Take screenshot of site
                    // let url = String(req.body.message);
                    // let fileName = removeSubstring(url, 'https://') + '.jpg';
                    (async () => {
                        const browser = await puppeteer.launch();
                        const page = await browser.newPage();
                        await page.goto(req.body.message);
                        await page.screenshot({path: 'test2.jpg'});
                        await browser.close();
                    })();
                }
            })
            .catch(function (err) {
                res.send(err);
            })
    }
});

// START SERVER LISTEN
app.listen(API_PORT, () => {
    console.log(`API Server listening on ${API_PORT}`);
});