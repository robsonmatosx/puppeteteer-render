process.env['REMOTE_DEBUGGING_PORT'] = '0';

const express = require("express");

const {scrapeLogic} =require("./scrapeLogic");
const {scrapeReview} =require("./scrapeReview");
const {scrapeElo7Produto} =require("./scrapeElo7Produto")
const {scrapeEtsy} =require("./scrapeEtsy");
const {scrapeML} =require("./scrapeML");
const {reviewJson} =require("./reviewJson");
const {scrapeBusca} =require("./scrapeBusca");
const {storeValue} =require("./storeValue");
const {getValue} =require("./getValue");
const {chatBot} =require("./chatBot");
const {scrapeUrl} =require("./scrapeurl");

// var cookieParser = require('cookie-parser');
var session      = require('express-session');
var flash        = require('req-flash');
var flash        = require('req-flash');


const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


// Configure session and flash middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());


app.set('view engine', 'ejs');

var server = app.listen();
server.setTimeout(500000);




app.use('/', require('./routes/login'));


// app.get("/", (req, res) => {
//     res.send("Render Puppetter server is up and running")
// })

app.get('/about', function(req, res) {
    var msg = 'teste de mensagem msg    ';
    res.render('./about', {
        msg:msg
    });
});

app.get("/chatbot", (req, res)=>{
    chatBot(res);

})

// app.get("/scrape", (req, res)=>{
//     scrapeLogic(res);
// })
app.get("/scrapereview", (req, res)=>{
    scrapeReview(res);
})

app.get("/scrapeelo7produto", (req, res)=>{
    scrapeElo7Produto(res);
})

app.get("/scrapeetsy", (req, res)=>{
    scrapeEtsy(res);
})
app.get("/scrapeml", (req, res)=>{
    scrapeML(res);
})
app.get("/scrapebusca", (req, res)=>{
    scrapeBusca(req,res);
   // console.log('scrape na busca do xml 1');

});

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

app.post('/scrapeurl', (req, res) => {
    // Access the POST data here
    const userData = req.body; 
    console.log(userData);
    //  res.render('./scrape', {
    //     msg:userData
    // });
    scrapeUrl(userData, res);
    
    
});

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server is listening on port ${PORT}`);
});