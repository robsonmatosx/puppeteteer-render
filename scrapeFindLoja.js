const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeFindLoja = async (userData, res) =>{  

    var database = require('./database');

    const path = require('path')
    const fsPromises = require('fs/promises')
    const filePath = path.resolve(__dirname, './listas/lojas.json');
    const data = require(filePath);    

    console.log(userData.url);

    let perfis =[userData.url];
    const data_corte = [userData.data_corte];

    if (data_corte == '' || data_corte == undefined || data_corte == null) {
        data_corte = new Date();
        data_corte.setDate(data_corte.getDate() - 30);
        data_corte = data_corte.toISOString().slice(0, 19).replace('T', ' '); 
    }

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
  

    // var query = 'SELECT  CASE WHEN  MAX(DATA_HORA) IS NULL THEN  DATE_FORMAT(DATE_FORMAT(now(),"%Y-%m-01"),"%Y-%m-%d %H:%i:%s") ELSE DATE_FORMAT(date_add( MAX(DATA_HORA) , INTERVAL -25 DAY),"%Y-%m-%d %H:%i:%s") END DATA_HORA FROM `Output` o;';
    
    // if (database.state === 'disconnected') {
    //         database.connect(function(error){
    //             if(error) {
    //                 throw error;
    //             } else {
    //                 console.log('MySQL Database is connected Successfully');
    //                 database.query(query, function(error, data){
    //                 if (error) throw error;
    //                 console.log('data de corte definida: '+data[0]["DATA_HORA"]);
    //                 data_corte = data[0]["DATA_HORA"];
    //                     });
    //             }
        
      
    //     });
    //   } else {
    //     database.query(query, function(error, data){
    //                 if (error) throw error;
    //                 console.log('data de corte definida: '+data[0]["DATA_HORA"]);
    //                 data_corte = data[0]["DATA_HORA"];
    //                     });
    //   }
      

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
            await page.goto(perfis[x]+"?pgn="+pageNum+"&sort=relevance");
          } catch (error) {
            console.log(`Página ${ perfis[x]} não existe ou trocou de nome`);
            //console.log(error + perfis[x])
            
          }
         
          try {
      
            await page.waitForSelector('#products-module-title-main',{
              timeout: 3000
              });
              const text = await page.evaluate(() => {
              const uiElement = document.querySelector('#products-module-title-main');
              return uiElement.textContent;
            });

            console.log('Texto encontrado: ' + text);
      
            
          } catch (error) {
            console.log('fim da página');
            break;
          }

          // 1. Define o tamanho da "janela" do navegador
            await page.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 1, // 1 para resolução padrão, 2 para "Retina" (mais nítido)
            });
          
        //   await page.screenshot({ path: 'debug.png' ,  fullPage: true });
          
          //console.log(text);
          // if (text=='Agora não'){
          //     await page.click('div.cmbtv>button');
      
          // }
          await page.waitForTimeout(500);
      
          const produto = await page.evaluate(() => Array.from(document.querySelectorAll('ul>li.cards'), element => element.innerText));
          const data_hora = await page.evaluate(() => Array.from(document.querySelectorAll('div.description>time'), element => element.dateTime));
          const imagem = await page.evaluate(() => Array.from(document.querySelectorAll('article.feedback>section.carousel li.card:nth-child(1) img'), element => element.src));
          const link_produto = await page.evaluate(() => Array.from(document.querySelectorAll('ul>li.cards a'), element => element.href));
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

          let shouldBreak = false;
          produto.forEach(  
              async function(element, index, array) {
              data_post = data_hora[index];             

      
              console.log('Loja avaliada: '+perfis[x]);

              var texto = produto[index].toLowerCase();

              // 1. Crie uma versão minúscula para fazer as comparações
              let textoMinusculo = texto.toLowerCase();


            let temConvite = textoMinusculo.includes('convite') || 
                 textoMinusculo.includes('arte') || 
                 textoMinusculo.includes('kit') || 
                 textoMinusculo.includes('save the date');

          const temDigitalOuVirtual = textoMinusculo.includes('digital') || 
                            textoMinusculo.includes('virtual') || 
                            textoMinusculo.includes('animado') ||
                            textoMinusculo.includes('interativo') || 
                            textoMinusculo.includes('caneca');

            if (temConvite && temDigitalOuVirtual) {
            //   const produtoArray = produto[index].split("-");
            //   var codigo_produto = produto_id[index].split('/');

            console.log('Produto aceito: '+link_produto[index]);
            
              //infores+=`<img src="${imagem[index]}" alt="${produto[index]}" />`;
            //   console.log(perfis[x]+'|'+produto[index]+'|'+element+'|'+imagem[index]+'|'+link_produto[index]);
              
            const productPage = await browser.newPage();
            try {
                   
                    
                    // Configure um timeout maior e espere a rede ficar ociosa
                    await productPage.goto(link_produto[index], { 
                        waitUntil: 'networkidle2', 
                        timeout: 30000 
                    });

                    const lojalink = await productPage.evaluate(() => {
                        // Seletores baseados em índice [4] são frágeis. 
                        // Tente buscar pelo texto ou classe específica se falhar.
                        const elements = document.querySelectorAll('.surface-secondary');
                        if (elements[4]) {
                            const link = elements[4].querySelector('a');
                            return link ? link.href : '';
                        }
                        return '';
                    });

                    console.log(`Link da Loja [${index}]: ${lojalink}`);
                    
                    await productPage.close();
                } catch (error) {
                    console.error(`Erro ao processar produto ${index}:`, error.message);
                    if (productPage) await productPage.close();
                }

            //   var query =  "INSERT INTO `Output` (LOJA,PRODUTO,DATA_HORA,LINK_IMG,PRODUTO_ID,LINK_PRODUTO,LINK_AVALIACAO)";
            //   query= query +` VALUES ('${perfis[x]}','${produtoArray[0].replace(","," ")}','${data_hora[index]}','${imagem[index]}','${codigo_produto.at(-1)}','${link_produto[index]}','${avaliacao_lnk[index]}');`

            //    console.log(query);

              // sent this to flow webhook to trigger flow
            //   await fetch('https://flow.linkazul.space/webhook/salvalinha', {
            //     method: 'POST',  
            //     headers: {
            //       'Content-Type': 'application/json'
            //     }, 
            //     body: JSON.stringify({ query })
            //   });
      

              // database.query(query, function(error, data){
              // if (error) { 
              //   //throw error;
              //     console.log(error);
              // }else {
              //     console.log(data.affectedRows + " record inserted");
              // }
              // });
      
            } else {
      
            console.log(" \u001b[1;31m descartado: "+produto[index]);

            // query = `INSERT INTO descartados (LOJA,PRODUTO,DATA_HORA,MOTIVO) VALUES ('${perfis[x]}','${produto[index]}','${data_hora[index]}','Produto não é convite digital');`

           

             // sent this to flow webhook to trigger flow
            //   await fetch('https://flow.linkazul.space/webhook/salvalinha', {
            //     method: 'POST',  
            //     headers: {
            //       'Content-Type': 'application/json'
            //     }, 
            //     body: JSON.stringify({ query })
            //   });
            }
            
      
         
         });
       

         infores+="<br>";
      

            
          if (shouldBreak) {
            break;
          }
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

  res.json({
  message: 'Scraping completed successfully',
  data: infores,
  status: 'success'
}); 

}
catch(e) {
console.error(e);
res.send (JSON.stringify({ message: 'Scraping failed with error', error: e, status: 'error' }));

//   res.json({
//   message: 'Scraping failed with error',
//   error: e,
//   status: 'error'
// }); 
}finally {
    await browser.close();
    // database.end(); // Removed to keep connection open

}

}

module.exports = {scrapeFindLoja}