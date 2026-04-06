const puppeteer = require("puppeteer");
require("dotenv").config();


var moment = require('moment');

// var database = require('./database');

const scrapeML = async (userData, res) =>{  

    var database = require('./database');
    console.log('link para rodar:'+userData.url);
    let perfis =[userData.url];
   // const data_corte = [userData.data_corte];

  //  curl -X POST http://localhost:4000/scrapeml \
  // -H "Content-Type: application/json" \
  // -d '{"url":"https://lista.mercadolivre.com.br/_CustId_139023013"}'

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
    var pendingQueries = [];

    // var query = 'SELECT  CASE WHEN  MAX(DATA_HORA) IS NULL THEN  DATE_FORMAT(DATE_FORMAT(now(),"%Y-%m-01"),"%Y-%m-%d %H:%i:%s") ELSE DATE_FORMAT(date_add( MAX(DATA_HORA) , INTERVAL -60 DAY),"%Y-%m-%d %H:%i:%s") END DATA_HORA FROM `Output` o;';
    // database.query(query, function(error, data){
    //     if (error) throw error;
    //     console.log('data de corte definida: '+data[0]["DATA_HORA"]);
    //     data_corte = data[0]["DATA_HORA"]
    // });
  
   data_corte = '2025-07-26 00:00:00';

    for (let x = 0; x < perfis.length; x++) {
      
      console.log(`Navegando para ${perfis[x]}`);

  
        const page = await browser.newPage();

      await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/120.0.0.0 Safari/537.36'
        );
  
        await page.setViewport({
          width: 1366,
          height: 768,
          deviceScaleFactor: 1
        });

       
        await page.setRequestInterception(true);  
           // Array of third-party domains to block
           const blockedDomains = [
            'https://www.google.com',
            'https://www.google.com.br/',
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com/',
            'https://siteintercept.qualtrics.com/',
            'https://znefi6i3nkl8bgcta-mercadolibre.siteintercept.qualtrics.com/',
            'https://adservice.google.com',
            'https://www.googleadservices.com/',
            'https://www.facebook.com/',
            'https://connect.facebook.net',
            'https://ct.pinterest.com/',
            'https://http2.mlstatic.com/',
            'https://js-agent.newrelic.com/'
                    ];
        
          page.on('request', (req) => {
            const url = req.url();
            if (blockedDomains.some((d) => url.startsWith(d))) {
              req.abort();
            } else {
              req.continue();
            }
          });
          
        await page.setDefaultNavigationTimeout(); 
  
        await page.goto(perfis[x], 
          // waitUntil: 'domcontentloaded'},
            {waitUntil: 'networkidle2'}
        );
        await page.waitForFunction(() => document.readyState === "complete");

       // const data_corte = '2023-04-01 00:00:00';
        var pageNum=1;
        var maxpage=0;
        var data_post = '';
        var paginaAtual=perfis[x];

        var id_loja = perfis[x].split('_CustId_')[1];

        console.log(`Iniciando coleta de dados da loja: ${id_loja} a partir da data: ${data_corte}`);
          
        do  {         
      
          // await page.screenshot({ path: 'perfil_'+pageNum+'.png', fullPage: true });

         

          maxpage = await page.evaluate(() => {
            const pageElements = document.querySelector('.ui-search-search-result__quantity-results');
            return Math.ceil(parseInt(pageElements.textContent.trim().split(' ')[0]) / 48);
          }
          );
        
         if (pageNum>=1) {
           // await page.waitForNavigation({waitUntil: 'domcontentloaded'});
          // const next = await page.evaluate(() => Array.from(document.querySelectorAll('span.andes-pagination__arrow-title'), element => element.parentElement.href));
          

          try {
            
            // var next = document.getElementsByClassName('andes-pagination__arrow-title');

            // _Desde_49
            
            //paginaAtual = (next.length==1 && pageNum==1)? next[0]:next[1] ;
            if (pageNum==1) {
              paginaAtual = 'https://lista.mercadolivre.com.br/' + '_CustId_' + id_loja;
               console.log(` Abrindo pagina ${pageNum} -  ${paginaAtual}`);

           
            } else {
                paginaAtual = 'https://lista.mercadolivre.com.br/' + '_Desde_' + ((pageNum-1)*48+1) + '_CustId_' + id_loja;
               console.log(` Abrindo pagina ${pageNum} -  ${paginaAtual}`);
          
            }
          
            
            await page.goto(paginaAtual);
            infores+=`<p>paginaAtual: '+${paginaAtual}</p>`;
            console.log(`Abrindo pagina: ${pageNum} - ${paginaAtual}`);
            
             var nome_id  = (pageNum==1) ? '_CustId_' + id_loja : '_Desde_' + ((pageNum-1)*48+1) + '_CustId_' + id_loja;

          await page.screenshot({
             path: `screenshots/${nome_id}.png`,
              fullPage: true
            });

            
          } catch (error) {
            console.log(`Não foi localizado mais página de produto. Saindo para outra loja`);
            console.log(error + perfis[x])
            break;
          }
        
        }         
          // try {
      
          //   await page.waitForSelector('div.content',{
          //     timeout: 3000
          //     });
          //     const text = await page.evaluate(() => {
          //     const uiElement = document.querySelector('div.content');
          //     return uiElement.textContent;
          //   });
            
          // } catch (error) {
          //   console.log('fim da página');
          //   break;
          // }
          
          //console.log(text);
          // if (text=='Agora não'){
          //     await page.click('div.cmbtv>button');
      
          // }
          await page.waitForTimeout(500);

         
 
           const el = await page.$$('.ui-search-layout > li');
           console.log(`Número de produtos na página: ${el.length}`);

          for (let i = 0; i < el.length; i++) {
            const element = el[i];
            const produtoTitle = await element.$eval('h3 > a', node => node.textContent.trim());
            console.log(`Produto ${i + 1}: ${produtoTitle}`);
            
            const produtoImage = await element.$eval('img'  , node => node.src);
            console.log(`Produto ${i + 1}: ${produtoImage}`);

            const produtoLink = await element.$eval('h3 > a'  , node => node.href);
            console.log(`Produto ${i + 1}: ${produtoLink}`);

            const produtoSold = await element.$eval('.poly-component__review-compacted > span', node => node);
           produtoSold =  produtoSold.length ==2 ? element.querySelectorAll('.poly-component__review-compacted > span')[1].textContent : 
            element.querySelector('.poly-component__review-compacted > span').textContent

            console.log(`Produto ${i + 1} vendido: ${produtoSold}`);
          }


          await page.waitForTimeout(1000);


          const produto = await page.evaluate(() => Array.from(document.querySelectorAll('.ui-search-layout > li h3 > a'), element => element.textContent.trim()));
          const data_hora = await page.evaluate(() => Array.from(document.querySelectorAll('p.shop2-review-attribution'), element => element.lastChild.textContent.trim().replace('a ','').replaceAll(' de ','-')));
          const imagem = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a img.listing-image'), element => element.src));
          const link_produto = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a'), element => element.href));
          const avaliacao_lnk = await page.evaluate(() =>  Array.from(document.querySelectorAll('a.more'), element => element.href));
          const produto_id = await page.evaluate(() => Array.from(document.querySelectorAll('div[data-region="listing"]>div>div>div>a'), element => element.href.replace('https://www.etsy.com/listing/','').split('/')[0]));
          const pag = await page.evaluate(() => Array.from(document.querySelectorAll('div.reviews-total'), element => element.children[2].textContent));
          
          // console.log('Titulo: '+produto);

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
      
              // Wrap query in a promise and add to pending queries array
              const queryPromise = new Promise((resolve, reject) => {
                database.query(query, function(error, data){
                  if (error) {
                    console.log('Database error:', error);
                    reject(error);
                  } else {
                    resolve(data);
                  }
                });
              });
              pendingQueries.push(queryPromise);
      
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
            if (pageNum>50 || paginaAtual=='' || pageNum>maxpage) {
              console.log('Saindo forçado de loop infinito');
      
              break;
             
            } else
            {
              pageNum+=1;
            }
            
            
            console.log(paginaAtual!='' );
          } while(pageNum<=maxpage && paginaAtual!='');
          //pageNum=0;
          await page.goto('about:blank')
          await page.close();
      }

  // Print the full title
  //const logStatement = `The title of this blog post is ${fullTitle}`
  //console.log(logStatement);
  // res.send (infores);   
}
catch(e) {
console.error(e);
res.send(`Something went wrong while running Pupperteer ${e}`)
}finally {
    await browser.close();
    // Wait for all pending database queries to complete before closing connection
    try {
      if (pendingQueries.length > 0) {
        await Promise.all(pendingQueries);
      }
    } catch (error) {
      console.error('Error waiting for pending queries:', error);
    }
    
    // Close database connection only after all queries are done
    database.end((err) => {
      if (err) {
        console.error('Error closing database connection:', err);
      }
    });
    
  // res.send(`Processo finalizado!`);
  res.status(200).json({message: 'Processo finalizado', status: 200});  
}

}

module.exports = {scrapeML}