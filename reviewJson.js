const express = require("express");
require("dotenv").config();

var database = require('./database');

const today = new Date()
const day = today.getDate()        // 24
const month = today.getMonth()     // 10 (Month is 0-based, so 10 means 11th Month)
const year = today.getFullYear() 

const reviewJson = async (req,res)=> {

    try {

        var infores="";
        var data_corte = "";
        var resultado ='';


        const mes = (req.query.mes) ? req.query.mes : month ;
        const ano = (req.query.ano) ?  req.query.ano : year ;
        const loja = (req.query.loja) ? req.query.loja : '';
        const q = (req.query.q) ? req.query.q : '';
    
        var query = `SELECT elo.loja loja,   produto, elo.LINK_IMG imagem, (SELECT count(link_produto) total   from \`Output\` where  year (DATA_HORA) =  year(elo.DATA_HORA) and month(DATA_HORA) =  month(elo.DATA_HORA) and  LINK_PRODUTO = elo.link_produto ) total from \`Output\` elo where year (elo.DATA_HORA) = '${ano}'  and MONTH (elo.DATA_HORA) = '${mes}' `;
        if(loja) query+=` and elo.loja like lower('%${loja}%')`;
        if (q) query+=` and lower(produto) like lower('%${q}%')`;
        query+="group by elo.loja,  elo.LINK_IMG order by 4 desc";
       
       
        database.query(query, function(error, data, fields){
            if (error) throw error;
           // console.log(fields);
          
           // console.log(query);
          
           // console.log(result);

           Object.keys(data).forEach(function(key) {
            var row = data[key];
            console.log(row.loja)
          
          });

          resultado = data.map(v => Object.assign({}, v));

          res.json(resultado);
        
        });
        console.log(`params: ${req.query.q}`)
        console.log(resultado);      
      //  res.send("teste: "+resultado);
     
    } catch (e) {
        console.error(e);
        res.send(`Something went wrong while running Pupperteer ${e}`)
    } finally {

    }
   
}

module.exports = {reviewJson}
