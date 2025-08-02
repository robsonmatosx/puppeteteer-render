const express = require("express");
require("dotenv").config();

var database = require('./database');

var https = require('https');
var parseString = require('xml2js').parseString;

var termo_str="";

const today = new Date()
const day = today.getDate()        // 24
const month = today.getMonth()     // 10 (Month is 0-based, so 10 means 11th Month)
const year = today.getFullYear() 

const scrapeBusca = async (req,res)=> {


  var xml = '';

  function xmlToJson(url, callback) {
    var req = https.get(url, function(res) {
      var xml = '';
      var retorno="";
  
      res.on('data', function(chunk) {
        xml += chunk;
      });
  
      res.on('error', function(e) {
        callback(e, null);
      }); 
  
      res.on('timeout', function(e) {
        callback(e, null);
      }); 
  
      res.on('end', function() {
        parseString(xml, function(err, result) {
          callback(null, result);
        });
      });
    });
  }

    try {



var url = "https://www.elo7.com.br/sitemap-search-terms-index.xml"

xmlToJson(url, function(err, data) {
    if (err) {
    // Handle this however you like
    return console.err(err);
  }

  // Do whatever you want with the data here
  // Following just pretty-prints the object
 // console.log(JSON.stringify(data, null, 2));


  retorno = data; 
  console.log(retorno.sitemapindex.sitemap );  

  for (let i of retorno.sitemapindex.sitemap) {
    xmlToJson(i.loc[0], function(err, data) {
      if (err) {
      // Handle this however you like
      return console.err(err);
    }
     //console.log(JSON.stringify(data, null, 2));
    //console.log(data.urlset.url);

    var cc=0;
    var total = Object.keys(data.urlset.url).length;
  
        // limpa base para novos termos
      database.query('delete from tb_termosbuscados', function(error, data){
      console.log(error);
    });

   
    for (let i of data.urlset.url) {
     // console.log (i.loc[0]);
      try {
        var termo = i.loc[0];
        
        termo_str+=termo+'<br>';

        var query =  "INSERT INTO `tb_termosbuscados` (termo)";
        query= query +` VALUES ('${termo}');`

      
        database.query(query, function(error, data){
          console.log(error);
          });


        if (termo.toLowerCase().search('convite')>=0 || termo.toLowerCase().search('arte digital')>=0  ) {
          // database.query(query, function(error, data){
          //   console.log(error);       

         
        } else {
          //console.log(`termo não inserido: ${termo}`);
        }
       
        ++cc;
        console.log('% carga: '+cc/total);

      } catch (error) {
        console.log(error);
      }

     }

    });
    }

  });

      console.log('pag scrapeBusca rodando...');
     // res.send(`pag scrapeBusca rodando...`+termo_str);
     
     
    } catch (e) {
        console.error(e);
        res.send(`Something went wrong while running Pupperteer ${e}`)
    } finally {
     
      
      //database.end();
      res.send(`pag scrapeBusca rodando...`+termo_str);
   
    }
   
}

module.exports = {scrapeBusca}
