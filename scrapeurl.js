const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeUrl = async (userData, res) =>{  

var database = require('./database');

    const path = require('path')
    const fsPromises = require('fs/promises')
    const filePath = path.resolve(__dirname, './listas/lojas.json');
    const data = require(filePath);    

    console.log(userData.url);

    let perfis =[userData.url];

//PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

// const browser = await puppeteer.launch({
//      args: [
//     '--no-sandbox',
//     '--disable-setuid-sandbox',
//     '--disable-dev-shm-usage',
//     '--disable-gpu',
//     '--no-zygote',
//     '--single-process',
//     '--disable-dev-tools',         // Optional
//     '--remote-debugging-port=0'    // Avoids opening a visible port
//   ],
//     executablePath: process.env.NODE_ENV === 'production' ?
//     process.env.PUPPETEER_EXECUTABLE_PATH 
//     : puppeteer.executablePath(),
// });

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--single-process',
    '--disable-dev-tools',
    '--remote-debugging-port=0'
  ]
});

try {

    var infores="";
    var data_corte = "";

    var query = 'SELECT  CASE WHEN  MAX(DATA_HORA) IS NULL THEN  DATE_FORMAT(DATE_FORMAT(now(),"%Y-%m-01"),"%Y-%m-%d %H:%i:%s") ELSE DATE_FORMAT(date_add( MAX(DATA_HORA) , INTERVAL -25 DAY),"%Y-%m-%d %H:%i:%s") END DATA_HORA FROM `Output` o;';
    
    if (database.state === 'disconnected') {
        database.connect(function(error){
            if(error) {
                throw error;
            } else {
                console.log('MySQL Database is connected Successfully');
                 database.query(query, function(error, data){
                if (error) throw error;
                console.log('data de corte definida: '+data[0]["DATA_HORA"]);
                data_corte = data[0]["DATA_HORA"];
                    });
            }
    
   
    });
  } else {
     database.query(query, function(error, data){
                if (error) throw error;
                console.log('data de corte definida: '+data[0]["DATA_HORA"]);
                data_corte = data[0]["DATA_HORA"];
                    });
  }
   

    for (let x = 0; x < perfis.length; x++) {
  
        const page = await browser.newPage();
      
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
      
      
          await page.goto(perfis[x]);
        //await page.screenshot({ path: 'perfil_'+x+'.png' });
       
       // const data_corte = '2023-04-01 00:00:00';
        var pageNum=0;
        var data_post = '';
        do  {
        
          var pageNum = pageNum+1;
      
          try {
            await page.goto(perfis[x]+"?pageNum="+pageNum);
          } catch (error) {
            console.log(`Página ${ perfis[x]} não existe ou trocou de nome`);
            //console.log(error + perfis[x])
            
          }
         
          try {
      
            await page.waitForSelector('div.description',{
              timeout: 3000
              });
              const text = await page.evaluate(() => {
              const uiElement = document.querySelector('div.description');
              return uiElement.textContent;
            });
      
            
          } catch (error) {
            console.log('fim da página');
            break;
          }
      
          
          //console.log(text);
          // if (text=='Agora não'){
          //     await page.click('div.cmbtv>button');
      
          // }
          await page.waitForTimeout(500);
      
          const produto = await page.evaluate(() => Array.from(document.querySelectorAll('div.description>h3.title>a:nth-child(2n)'), element => element.innerText));
          const data_hora = await page.evaluate(() => Array.from(document.querySelectorAll('div.description>time'), element => element.dateTime));
          const imagem = await page.evaluate(() => Array.from(document.querySelectorAll('article.feedback>section.carousel li.card:nth-child(1) img'), element => element.src));
          const link_produto = await page.evaluate(() => Array.from(document.querySelectorAll('article.feedback>section.carousel li.card:nth-child(1) a.hack-pnt'), element => element.href));
          const avaliacao_lnk = await page.evaluate(() =>  Array.from(document.querySelectorAll('a.more'), element => element.href));
          const produto_id = await page.evaluate(() => Array.from(document.querySelectorAll('article.feedback>section.carousel li.card a.hack-pnt'), element => element.href));
          
          function at(n) {
            // ToInteger() abstract op
            n = Math.trunc(n) || 0;
            // Allow negative indexing from the end
            if (n < 0) n += this.length;
            // OOB access is guaranteed to return undefined
            if (n < 0 || n >= this.length) return undefined;
            // Otherwise, this is just normal property access
            return this[n];
        }
        
        const TypedArray = Reflect.getPrototypeOf(Int8Array);
        for (const C of [Array, String, TypedArray]) {
            Object.defineProperty(C.prototype, "at",
                                  { value: at,
                                    writable: true,
                                    enumerable: false,
                                    configurable: true });
        }
      
          //console.log(data_hora.length);
          //'Loja, Produto, Data, Link_IMG, Link_produto
      
          console.log('status :'+ x +' de ' + perfis.length);
        
          infores+=`<p>Loja avaliada: '+${perfis[x]}</p>`;

          data_hora.forEach(  
              function(element, index, array) {
              data_post = data_hora[index];
              
              if (data_post>=data_corte) {
      
                console.log('Loja avaliada: '+perfis[x]);
                
             if (produto[index].toLowerCase().search('convite digital')>=0 || produto[index].toLowerCase().indexOf('convite virtual')>=0 || produto[index].toLowerCase().indexOf('convite individual')>=0 || produto[index].toLowerCase().indexOf('arte digital')>=0 || produto[index].toLowerCase().search('convite animado')>=0){
           
              const produtoArray = produto[index].split("-");
              var codigo_produto = produto_id[index].split('/');
            
              //infores+=`<img src="${imagem[index]}" alt="${produto[index]}" />`;
              console.log(perfis[x]+'|'+produto[index]+'|'+element+'|'+imagem[index]+'|'+link_produto[index]);
              
              var query =  "INSERT INTO `Output` (LOJA,PRODUTO,DATA_HORA,LINK_IMG,PRODUTO_ID,LINK_PRODUTO,LINK_AVALIACAO)";
              query= query +` VALUES ('${perfis[x]}','${produtoArray[0].replace(","," ")}','${data_hora[index]}','${imagem[index]}','${codigo_produto.at(-1)}','${link_produto[index]}','${avaliacao_lnk[index]}');`
      
              database.query(query, function(error, data){
              if (error) { 
                //throw error;
                console.log(error);
              }else {
             console.log(data.affectedRows + " record inserted");
              }
              });
      
            } else {
      
            console.log(" \u001b[1;31m descartado: "+produto[index]);
            }
            
          } else {
      
            console.log(" \u001b[1;31m Data menor do que a data de corte: "+data_post+"<"+data_corte);
          }
         
         });

         infores+="<br>";
      
      //console.log('carregando '+x+'/'+perfis.length);
      
          console.log('data_hora:'+data_post );       
            
              perfis.length
              console.log('Pág: '+ pageNum+'/ 51 - '+ Math.round((pageNum/51)*100)+'%');
              console.log('Lojas : '+ x+'/'+(perfis.length-1) + ' - ' +  Math.round((x/(perfis.length-1))*100)+'%');
            if (pageNum>50) {
              console.log('Saindo forçado de loop infinito');
      
              break;
             
            }        
      
          } while(data_post>= data_corte && data_post<='2030-12-31 00:00:00')
          pageNum=0;
          //await page.goto('about:blank')
         // await page.close();
      }

  // Print the full title
  //const logStatement = `The title of this blog post is ${fullTitle}`
  //console.log(logStatement);

  res.send (JSON.stringify({ message: 'Scraping completed successfully', data: infores , status: 'success' }));
}
catch(e) {
console.error(e);
res.send (JSON.stringify({ message: 'Scraping failed with error', error: e, status: 'error' }));
}finally {
    await browser.close();
    // database.end(); // Removed to keep connection open

}

}

module.exports = {scrapeUrl}