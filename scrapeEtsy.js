const puppeteer = require("puppeteer");
require("dotenv").config();


var moment = require('moment');

var database = require('./database');

const scrapeEtsy = async (res) =>{  


    const path = require('path')
    const fsPromises = require('fs/promises')
    const filePath = path.resolve(__dirname, './listas/etsy.json');
    const data = require(filePath);
    
    let perfis = data;

const browser = await puppeteer.launch({
      headless: false,
      args: ['--use-gl=egl'],
    executablePath: process.env.NODE_ENV === 'production' ?
    process.env.PUPPETEER_EXECUTABLE_PATH 
    : puppeteer.executablePath(),
});
try {

    var infores="";
    var data_corte = "";

    var query = 'SELECT  CASE WHEN  MAX(DATA_HORA) IS NULL THEN  DATE_FORMAT(DATE_FORMAT(now(),"%Y-%m-01"),"%Y-%m-%d %H:%i:%s") ELSE DATE_FORMAT(date_add( MAX(DATA_HORA) , INTERVAL -60 DAY),"%Y-%m-%d %H:%i:%s") END DATA_HORA FROM `Output` o;';
    database.query(query, function(error, data){
        if (error) throw error;
        console.log('data de corte definida: '+data[0]["DATA_HORA"]);
        data_corte = data[0]["DATA_HORA"]
    });
  
   

    for (let x = 0; x < perfis.length; x++) {
  
        const page = await browser.newPage();
      
        await page.setRequestInterception(true);  
           // Array of third-party domains to block
           const blockedDomains = [
            'https://analytics.elo7.com.br/',
            'https://www.google-analytics.com',
            'https://bat.bing.com/',
            'https://www.googletagmanager.com',
            'https://adservice.google.com',
            'https://www.googleadservices.com/',
            'https://www.facebook.com/',
            'https://ct.pinterest.com/',
            'https://www.etsy.com/ac/evergreenVendor'

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
        var maxpage=0;
        var data_post = '';

          
        do  {
        
          var pageNum = pageNum+1;

          
      
          try {
            await page.goto(perfis[x]+"?ref=pagination&page="+pageNum);
          } catch (error) {
            console.log(`Página ${ perfis[x]} não existe ou trocou de nome`);
            //console.log(error + perfis[x])
          }
         
          try {
      
            await page.waitForSelector('div.content',{
              timeout: 3000
              });
              const text = await page.evaluate(() => {
              const uiElement = document.querySelector('div.content');
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
      
          const produto = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a'), element => element.ariaLabel));
          const data_hora = await page.evaluate(() => Array.from(document.querySelectorAll('p.shop2-review-attribution'), element => element.lastChild.textContent.trim().replace('a ','').replaceAll(' de ','-')));
          const imagem = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a img.listing-image'), element => element.src));
          const link_produto = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a'), element => element.href));
          const avaliacao_lnk = await page.evaluate(() =>  Array.from(document.querySelectorAll('a.more'), element => element.href));
          const produto_id = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a'), element => element.href.replace('https://www.etsy.com/listing/','').split('/')[0]));
          const pag = await page.evaluate(() => Array.from(document.querySelectorAll('div.reviews-total'), element => element.children[2].textContent));
          

      

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

          var dt_month = {"Jan":1,"Fev":2,"Mar":3,"Abr":4,"Mai":5,"Jun":6,"Jul":7,"Ago":8,"Set":9,"Out":10,"Nov":11,"Dec":12}

          data_hora.forEach(
              function(element, index, array) {


              data_post = data_hora[index].split('-');
              var event = new Date(Date.UTC(data_post[2], dt_month[data_post[1]]-1, data_post[0], 3, 0, 0));
              data_post = moment(event).format('YYYY-MM-DD hh:mm:ss');
              
              if (data_post>=data_corte) {
      
                console.log('Loja avaliada: '+perfis[x]);
                
             if (produto[index].toLowerCase().search('invitation')>=0 || produto[index].toLowerCase().indexOf('birthday invitation')>=0 || produto[index].toLowerCase().indexOf('invite')>=0 || produto[index].toLowerCase().indexOf('party invite')>=0 ){
           
              const produtoArray =  produto[index] ;//produto[index].split("-");
              var codigo_produto = produto[index]; //produto_id[index].split('/');
            
              //infores+=`<img src="${imagem[index]}" alt="${produto[index]}" />`;
              console.log(perfis[x]+'|'+produto[index]+'|'+element+'|'+imagem[index]+'|'+link_produto[index]);
              
              var query =  "INSERT INTO `Output` (LOJA,PRODUTO,DATA_HORA,LINK_IMG,PRODUTO_ID,LINK_PRODUTO,LINK_AVALIACAO)";
              query= query +` VALUES ('${perfis[x]}','${produtoArray}','${data_post}','${imagem[index]}','${produto_id[index]}','${link_produto[index]}','');`
      
                     
              database.query(query, function(error, data){
                    console.log(error);

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

            console.dir (pag);
            var maxpage = Math.ceil(pag[0].substring(1,3)/15);
            
            if (pageNum>maxpage) {
              console.log(`Sainda da ${perfis[x]} - PagNum > MaxPage`);
              break;
            }
  

            
      
          } while(data_post>= data_corte && data_post<='2030-12-31 00:00:00')
          pageNum=0;
          await page.goto('about:blank')
          await page.close();
      }

  // Print the full title
  //const logStatement = `The title of this blog post is ${fullTitle}`
  //console.log(logStatement);
  res.send (infores);   
}
catch(e) {
console.error(e);
res.send(`Something went wrong while running Pupperteer ${e}`)
}finally {
    await browser.close();
  database.end();
  res.send(`Processo finalizado!`);
}

}

module.exports = {scrapeEtsy}