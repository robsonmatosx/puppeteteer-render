const express = require("express");
require("dotenv").config();
const util = require('util');

var database = require('./database');

const today = new Date()
const day = today.getDate()        // 24
const month = today.getMonth()     // 10 (Month is 0-based, so 10 means 11th Month)
const year = today.getFullYear() 

const getValue =  (req,res)=> {

    try {

    let data_res = req.body;
    console.log(`params: ${JSON.stringify(data_res)}`)
    console.log(data_res.tag)
   // res.send('Data Received: ' + JSON.stringify(data));
    if (data_res.tag =='' ) {
      throw new Error (`{error:'${error}'}`);
    }

           var query = "";           
                    
           var valor_tag = async (resultado)=> {
            query = `SELECT VALUE FROM db_convee60504c.tb_tags_app  where TAG = '${data_res.tag}'; `;

           console.log(query);
           var row ="";
           
           database.query(query, function(error, data, fields){
             if (error) throw error;
           // console.log(fields);
         
             Object.keys(data).forEach(function(key) {
                          row = data[key];
                          console.log('Row value:'+row['VALUE']) ;  
                          resultado = row['VALUE']         
                          res.json([`VALUE`,`${data_res.tag}`,`${row['VALUE']}`]);                         
                      });                               
           });
        
           return resultado;
         }
         valor_tag();
       
          // res.send(valor_tag())

  //https://linkazul-puppeteer.onrender.com
     
    } catch (e) {
        console.error(e);
        res.send(`${e}`)
    } finally {
      
    }
   
}

module.exports = {getValue}
