const express = require("express");

const {scrapeLogic} =require("./scrapeLogic");
const {scrapeReview} =require("./scrapeReview");
const {scrapeEtsy} =require("./scrapeEtsy");
const {reviewJson} =require("./reviewJson");
const {storeValue} =require("./storeValue");
const {getValue} =require("./getValue");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var server = app.listen();
server.setTimeout(500000);

const PORT  = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Render Puppetter server is up and running")
})

app.get("/scrape", (req, res)=>{
    scrapeLogic(res);
})
app.get("/scrapereview", (req, res)=>{
    scrapeReview(res);
})

app.get("/scrapeetsy", (req, res)=>{
    scrapeEtsy(res);
})

app.get("/reviewjson", (req, res)=>{
    //console.log(`params: ${req.query.q}`)
   // res.send(`params: ${req.query.q}`);
    reviewJson(req,res);

});

app.post("/storevalue", (req,res)=> {
storeValue(req,res);
});

app.post("/getvalue", (req,res)=> {
    getValue(req,res);
    });

app.listen(4000, ()=> {
    console.log(`Listening on port 4000 ${PORT}`)
});