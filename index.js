process.env['REMOTE_DEBUGGING_PORT'] = '0';

const express = require("express");

const {scrapeLogic} =require("./scrapeLogic");
const {scrapeReview} =require("./scrapeReview");
const {scrapeElo7Produto} =require("./scrapeElo7Produto")
const {scrapeEtsy} =require("./scrapeEtsy");
const {reviewJson} =require("./reviewJson");
const {scrapeBusca} =require("./scrapeBusca");
const {storeValue} =require("./storeValue");
const {getValue} =require("./getValue");
const {chatBot} =require("./chatBot");
const {scrapeUrl} =require("./scrapeurl");
const {scrapeML} =require("./scrapeml");

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
    secret: 'linkazul-br-2026',
    resave: false,
    saveUninitialized: true,
     cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production    
}));
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var server = app.listen();
server.setTimeout(500000);




app.use('/', require('./routes/login'));

const dashboardRoutes = require('./routes/dashboard'); // ajuste o caminho

app.use('/', dashboardRoutes); // Isso registra as rotas do arquivo

// app.get("/", (req, res) => {
//     res.send("Render Puppetter server is up and running")
// })

app.get('/about',isAuthenticated, function(req, res) {
    var msg = 'teste de mensagem msg    ';
    res.render('./about', {
        msg:msg
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // Usuário logado, pode prosseguir
    }
    res.redirect('/login'); // Não logado, volta para o login
}

// Aplicando na rota protegida
// app.get('/dashboard',  (req, res) => {
//     res.render('dashboard', { user: req.session.user });

// });

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


app.get("/scrapeml", (req,res)=> {
    res.send("scrapeml endpoint is working");
    });

app.post('/scrapeml', (req, res) => {
    // Access the POST data here
    const userData = req.body; 
    console.log(userData);
    //  res.render('./scrape', {
    //     msg:userData
    // });
    scrapeML(userData, res);
    
    
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Exemplo simples: substitua por uma busca no seu banco de dados
    if (username === 'linkazul' && password === 'Rob14553') {
        // Se estiver correto, salva o usuário na sessão
        req.session.user = { nome: 'Admin' };
        return res.redirect('/dashboard');
    } else {
        // Se estiver errado, manda de volta para o login
        return res.render('login', { error: 'Usuário ou senha inválidos' });
    }
});

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server is listening on port ${PORT}`);
});