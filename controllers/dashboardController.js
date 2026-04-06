const db =  require('../database'); // Importa a conexão
const { query } = require('../database'); // Importa a função de query para usar com async/await    

const dashboardView = async (req, res) => {
    // try {
    //     // 1. Executa a consulta SQL
    //     // const [rows] = await db.query("select count(1) total, status from lojas l where  ATIVA = 'S' order by l.ULTIMA_DATA DESC;");
    //     // console.log("Dados do banco:", rows); // Log para verificar os dados retornados
        
    //         // Refatorado para Callback
    //         db.query('select count(1) total , status, ativa from lojas l group by status, ativa order by l.ULTIMA_DATA DESC', 
    //             function(err, results, fields) {
    //             if (err) {
    //             console.error('Erro na consulta:', err.message);
    //             return;
    //             }

    //             // No modelo de callback do mysql2:
    //             // 'results' contém diretamente as linhas (rows)
    //             const rows = results; 
                
              
                
    //             // Se for um script único, feche a conexão aqui
    //             // db.end(); 

    //             // 2. Passa os resultados (rows) para o arquivo EJS
    //             res.render('dashboard', { 
    //                 produtos: rows, 
    //                 user: req.session.user 
    //             }); 
                
    //         }
    //         );
        

    // } catch (error) {
    //     console.error("Erro no banco:", error);
    //     res.render('dashboard', { produtos: [], error: "Erro ao carregar dados" });
    // }

    // Roda as duas queries AO MESMO TEMPO e espera ambas

    try {

          // Definindo as queries
        const sqlStatus = "select count(1) total , status, ativa from lojas l group by status, ativa order by l.ULTIMA_DATA DESC";
        const sqlLojas = "SELECT REPLACE(REPLACE(l.loja, 'https://www.elo7.com.br/', ''), '/avaliacoes', '') AS loja, l.loja loja_url, historico.total ,(SELECT COUNT(LOJA) as total FROM `Output` WHERE DATA_HORA between DATE_FORMAT(CURDATE(), '%Y-%m-01') and LAST_DAY(CURDATE())) total_30, DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'),'%d/%m') dt_ini, DATE_FORMAT(LAST_DAY(CURDATE() ) ,'%d/%m') dt_fim FROM lojas l left JOIN ( SELECT LOJA, COUNT(LOJA) as total FROM `Output` WHERE DATA_HORA between DATE_FORMAT(CURDATE(), '%Y-%m-01') and LAST_DAY(CURDATE() ) GROUP BY LOJA ) historico ON historico.LOJA = l.loja where historico.total > 0 order by historico.total desc limit 15;";
        

         // Executando ambas ao mesmo tempo
        const [resStatus, resTop15] = await Promise.all([
            query(sqlStatus),
            query(sqlLojas)
        ]);

        res.render('dashboard', { 
            produtos: resStatus, 
            top15: resTop15 
        });
        
     } catch (error) {
        console.error("Erro no Banco:", error);
        // res.status(500).send("Erro interno ao carregar dashboard");

        res.render('dashboard', { 
            produtos:[], 
            top15: [] 
        });
    }
};

module.exports = { dashboardView };