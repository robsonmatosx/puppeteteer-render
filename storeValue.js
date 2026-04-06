const express = require("express");
require("dotenv").config();
const util = require('util');

var database = require('./database');

const today = new Date()
const day = today.getDate()        // 24
const month = today.getMonth()     // 10 (Month is 0-based, so 10 means 11th Month)
const year = today.getFullYear() 

const storeValue = async (req,res)=> {

    try {

    let data = req.body;
    console.log(`params: ${JSON.stringify(data)}`)
    console.log(data.tag)
   // res.send('Data Received: ' + JSON.stringify(data));
    if (data.tag =='' || data.value =='' ) {
      throw new Error (`{error:'${error}'}`);
    }

            var query = "";   
            var mensagem="";        
                    
            var valor_tag = ()=> {

              return new Promise((resolve, reject) => {
                 query = `SELECT VALUE FROM db_convee60504c.tb_tags_app  where TAG = '${data.tag}' union select null value; `;

                console.log(query);
                var row ="";
                database.query(query, function(error, data, fields){
                  // if (error)
                  // {
                  //   console.log(error);
                  //   throw error
                  // }
                  return error ? reject(error) : resolve(data[0].VALUE);
              
                
              
                // Object.keys(data).forEach(function(key) {
                //    row = data[key];
                //    console.log('Row value:'+row['VALUE']) ;           
                 
                });                               
                });

            
            }
            //  console.log(util.inspect(valor_tag(), false, null, true /* enable colors */))
            //console.log('valor_tag2: '+valor_tag());]

            (async () => {
            
              const result = await valor_tag();
             // console.log(result);

             
              if (result !=null ) {
              console.log('atualizando registro')
              mensagem="Registro atualizado!";
               query = `UPDATE db_convee60504c.tb_tags_app set VALUE ='${data.value}' where TAG = '${data.tag}'; `;
  
              } else {
                console.log('inserindo registro');
                mensagem="Registro inserido!";
                query = `INSERT INTO db_convee60504c.tb_tags_app (TAG,VALUE,DATA_HORA,\`USER\`) VALUES ('${data.tag}','${data.value}',DEFAULT,'teste'); `;
  
              }
  
  
          database.query(query, function(error, data, fields){
              if (error) throw error;
             // console.log(fields);
            
             // console.log(query);
            
             //console.log(error);    
             res.send (`{error:'${error}',msg:'${mensagem}'}`)    
            
            });

              //res.send(result);
             
            })();
            

       

  
     
    } catch (e) {
        console.error(e);
        res.send(`${e}`)
    } finally {

    }
   
}

module.exports = {storeValue}
