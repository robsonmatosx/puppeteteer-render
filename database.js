const mysql = require('mysql');
require("dotenv").config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    // ADICIONE ISSO: O Render exige SSL para conexões externas
    ssl: {
        rejectUnauthorized: false
    }
};

let connection;

function handleDisconnect() {

	 // 1. IMPORTANTE: Se já existia uma conexão, remove os ouvintes para não vazar memória
    if (connection) {
        connection.removeAllListeners();
    }
	
    connection = mysql.createConnection(dbConfig);

    // connection.connect(function(err) {
    //     if (err) {
    //         console.log('Erro ao conectar:', err);
    //         setTimeout(handleDisconnect, 5000); // Tenta reconectar em 2s
    //     } else {
    //         console.log('MySQL Conectado com Sucesso!');
    //     }
    // });

    // connection.on('error', function(err) {
    //     console.log('Erro no banco (db error):', err);
    //     if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
    //         handleDisconnect(); // Reconecta se a conexão cair
    //     } else {
    //         throw err;
    //     }
    // });


	 connection.connect(function(err) {
        if (err) {
            console.error('Erro ao conectar ao MySQL (tentando em 2s):', err.message);
             // 2. Destrói a conexão que falhou antes de tentar de novo
            connection.destroy(); 
            setTimeout(handleDisconnect, 5000); 
        } else {
            console.log('✅ MySQL Conectado com Sucesso!');
        }
    });

	   // 2. Escuta erros fatais e reconecta do zero
    connection.on('error', function(err) {
        console.error('❌ Erro no banco de dados:', err.code);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
            handleDisconnect(); // Mata a conexão atual e cria outra
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// Ajuste na função query para usar a conexão sempre "fresca"
// const query = (sql, params) => {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, params, (err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
// };
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        // Se a conexão atual estiver com erro fatal, tentamos reconectar antes da query
        connection.query(sql, params, (err, results) => {
            if (err) {
                if (err.fatal) {
                    handleDisconnect(); // Reinicia para a próxima tentativa
                }
                return reject(err);
            }
            resolve(results);
        });
    });
};

module.exports = { 
    get connection() { return connection; }, // Exporta a referência atualizada
    query 
};