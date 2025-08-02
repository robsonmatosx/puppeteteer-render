const puppeteer = require("puppeteer");
require("dotenv").config();

var database = require('./database');

const scrapeElo7Produto = async (res) =>{  


    const path = require('path')
    const fsPromises = require('fs/promises')
    const filePath = path.resolve(__dirname, './listas/produtos.json');
    const data = require(filePath);
    
    let perfis = data;


// const browser = await puppeteer.launch({
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

const browser = await puppeteer.launch();

try {

  var infores="";

    // var data_corte = "";

    // var query = 'SELECT  CASE WHEN  MAX(DATA_HORA) IS NULL THEN  DATE_FORMAT(DATE_FORMAT(now(),"%Y-%m-01"),"%Y-%m-%d %H:%i:%s") ELSE DATE_FORMAT(date_add( MAX(DATA_HORA) , INTERVAL -25 DAY),"%Y-%m-%d %H:%i:%s") END DATA_HORA FROM `Output` o;';
    // database.query(query, function(error, data){
    //     if (error) throw error;
    //     console.log('data de corte definida: '+data[0]["DATA_HORA"]);
    //     data_corte = data[0]["DATA_HORA"]
    // });


    function wait(ms){
      var start = new Date().getTime();
      var end = start;
      while(end < start + ms) {
        end = new Date().getTime();
     }
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
        var pageNum=28;
        var data_post = '';
          
        var total_pagina=0;

        do  {       
          pageNum = pageNum+1;
      
          try {
            await page.goto(perfis[x]+"?pageNum="+pageNum);
          } catch (error) {
            console.log(`Página ${ perfis[x]} não existe ou trocou de nome`);
            //console.log(error + perfis[x])
            
          }
         
          try {
      
            await page.waitForSelector('span.product-count',{
              timeout: 3000
              });
            
          } catch (error) {
            console.log(error);
            console.log('fim da página');
            break;
          }

          const text = await page.evaluate(() => {
            const uiElement = document.querySelector('span.product-count');
            return uiElement.innerText;      
           });
          
          total_pagina = Math.ceil(text/20);
          console.log('total de paginas:'+total_pagina);
          
          //console.log(text);
          // if (text=='Agora não'){
          //     await page.click('div.cmbtv>button');
      
          // }
          await page.waitForTimeout(500);
          // var nome = document.querySelectorAll('li.product figcaption h2 a[title]');
          // var preco = document.querySelectorAll('li.product figcaption span.price');
          // var preco_old = document.querySelectorAll('li.product figcaption span.old-price');
          // var img  = document.querySelectorAll('li.product figure span a img')

          const produto = await page.evaluate(() => Array.from(document.querySelectorAll('li.product figcaption h2 a[title]'), element => element.innerText));
          const preco = await page.evaluate(() => Array.from(document.querySelectorAll('li.product figcaption span.price'), element => element.innerText));
          const imagem = await page.evaluate(() => Array.from(document.querySelectorAll('li.product figure span a img'), element => element.src));
          const preco_old = await page.evaluate(() => Array.from(document.querySelectorAll('li.product figcaption span.old-price'), element => element.innerText));
          // const avaliacao_lnk = await page.evaluate(() =>  Array.from(document.querySelectorAll('a.more'), element => element.href));
          const produto_id = await page.evaluate(() => Array.from(document.querySelectorAll('li.product figure span a'), element => element.href));
          
           const regex = /(?:\/dp\/)\w+/;

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

          console.log('total produto:'+produto.length);
          
          produto.forEach(
              function(element, index, array) {                        
      
                console.log('Loja avaliada: '+perfis[x]);
                
                var  result = produto[index].replace(regex, '');

             
                  const produtoArray = produto[index].split("-");

                  var  str =/(?:\/dp\/)\w+/.exec(produto_id[index]);

                  var codigo_produto =str[0].split('/')[2];
                  //console.log(codigo_produto);
                  
                  var preco_tratado = preco[index].replace('R$ ','');
                  preco_tratado= preco_tratado.replace(' ','');
                  preco_tratado = preco_tratado.replace(',','.');

                  var preco_old_tratado = preco_old[index].replace('R$ ','');
                  preco_old_tratado= preco_old_tratado.replace(' ','');
                  preco_old_tratado = preco_old_tratado.replace(',','.');
                
                  //infores+=`<img src="${imagem[index]}" alt="${produto[index]}" />`;
                 // console.log(perfis[x]+'|'+element+'|'+imagem[index]+'|'+preco_tratado+'|'+preco_old_tratado+'|'+codigo_produto);

                     console.log(perfis[x]+'|'+element+'|'+codigo_produto);


                    // const esecuzione = async function() {
                    // try {
                 
                    //      await new Promise((res, rej) => {
                          
                    //     });

                    //       }
                    //       catch (err) {
                    //         console.log(err)
                    //     }

                    // }
                    // esecuzione.call();

                    console.log('before');
                       var query =  "INSERT INTO tb_produto (loja,nome_produto,link_img,preco,preco_old,produto_id)";
                          query= query +` VALUES ('${perfis[x]}','${element}','${imagem[index]}','${preco_tratado}','${preco_old_tratado}','${codigo_produto}');`;
        
                            database.query(query, function(error, data){
                            if (error) { 
                              //throw error;
                              //console.log(error);
                            }else {
                           console.log(data.affectedRows + " record inserted");
                            }
        
                          });
                  
                  
                 
                    console.log('after');
         
          });

           wait(5000);  //7 seconds in milliseconds

         infores+="<br>";
      
      //console.log('carregando '+x+'/'+perfis.length);
      
            
              console.log('Pág: '+ pageNum+'/'+total_pagina+'-'+ Math.round((pageNum/total_pagina)*100)+'%');
              console.log('Lojas : '+ x+'/'+(perfis.length-1) + ' - ' +  Math.round((x/(perfis.length-1))*100)+'%');

            if (pageNum>50) {
              console.log('Saindo forçado de loop infinito');
      
              break;
             
            }        
            
        
          } while(pageNum<total_pagina+2)
          pageNum=0;
          //await page.goto('about:blank')
         // await page.close();
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
    database.end(); //like this

}

}

module.exports = {scrapeElo7Produto}