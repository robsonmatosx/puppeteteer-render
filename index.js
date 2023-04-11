const express = require("express");

var server = app.listen();
server.setTimeout(500000);

const {scrapeLogic} =require("./scrapeLogic");
const {scrapeReview} =require("./scrapeReview");
const app = express();

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

app.listen(4000, ()=> {
    console.log(`Listening on port 4000 ${PORT}`)
});