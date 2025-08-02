const puppeteerExtra = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');


puppeteerExtra.use(Stealth());


//const puppeteer = require("puppeteer");
require("dotenv").config();


var moment = require('moment');

var database = require('./database');

const chatBot = async (res) =>{  


    const path = require('path')
    const fsPromises = require('fs/promises')
    const filePath = path.resolve(__dirname, './listas/etsy.json');
    const data = require(filePath);
    
    let perfis = data;

  //   const browser = await puppeteer.launch({
  //     args: [
  //         "--diable-setuid-sandbox",
  //         "--no-sandbox",
  //         "--single-process",
  //         "--no-zygote",
  //     ],
  //     executablePath: process.env.NODE_ENV === 'production' ?
  //     process.env.PUPPETEER_EXECUTABLE_PATH 
  //     : puppeteer.executablePath(),
  // });

  const browser = await puppeteerExtra.launch({headless: false});
  //const browser = await puppeteer.launch({headless: false});

try {
 // document.getElementsByTagName('body')[0].insertAdjacentHTML('afterbegin','<p> Teste 2');


 
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');


  await page.setRequestInterception(true);  
     // Array of third-party domains to block
     const blockedDomains = [
      'https://analytics.elo7.com.br/',
      'https://images.elo7.com.br/',
      'https://img.elo7.com.br/product',
      'https://www.googletagmanager.com',
      'https://adservice.google.com',
      'https://www.googleadservices.com/'
    ];
  
    page.on('request', (req) => {
      const url = req.url();
      if (blockedDomains.some((d) => url.startsWith(d))) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    await page.setDefaultNavigationTimeout(0); 

     // Set screen size
  await page.setViewport({width: 1080, height: 1024});

    //ir para pagina login
    await page.goto('https://www.elo7.com.br/login.do');

     // Type into search box
    await page.type('[name=email]', 'robsonfriendcool@gmail.com',{delay: 100});
    await page.type('[name=password]', 'Rob14553',{delay: 100});


    const btnSubmit = '#submitButton';
    await page.waitForSelector(btnSubmit);
    await page.click(btnSubmit);

    await page.waitForSelector(btnSubmit);

   
    await page.waitForSelector('.login');

    

    page.waitForNavigation(); // The promise resolves after navigation has finished

    await page.goto('https://www.elo7.com.br/t7/conversations/ALL?activityStatus=ACTIVE&readingStatus=UNREAD')

    page.waitForNavigation();


    var loop=1;
    var cc = 1;

    while (loop) {
      if (loop = 1) {
        
       // await page.waitForSelector('.conversation-list');
        await page.waitForTimeout(1000);
        //  const totalCases = await page.$eval('.maincounter-number span', element => element.innerHTML);
          //await page1.type('[class="_39LWd"]', 'Casos totais: '+ totalCases);
         // await page1.keyboard.press('Enter');]
         console.log('função rodando '+cc);
         const msg =  await page.evaluate(() =>Array.from(document.querySelectorAll('article.item.unread'), element => element.dataset.webCode));
         console.log(msg[0]);
         try {
          for (let m of msg) {
            console.log(m);
            var wcode = m;
            if (wcode=='71AD7DD') {
              const msgPage = await browser.newPage();
              await msgPage.goto(`https://www.elo7.com.br/t7/${wcode}/order/messages`);
  
            }
  
           }
          
         } catch (error) {
           console.log(error );
         }
       




          await page.waitForTimeout(2000);

          ///page.reload();
          ++cc;
          
      }
  }

  


  //res.send(`Chat Bot rodando!`);

}
catch(e) {
console.error(e);
res.send(`Something went wrong while running Pupperteer ${e}`)
}finally {
    //await browser.close();
  database.end();
  //res.send(`Processo finalizado!`);
}

}

module.exports = {chatBot}