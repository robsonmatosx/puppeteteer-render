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
    connection = mysql.createConnection(dbConfig);

    connection.connect(function(err) {
        if (err) {
            console.log('Erro ao conectar:', err);
            setTimeout(handleDisconnect, 2000); // Tenta reconectar em 2s
        } else {
            console.log('MySQL Conectado com Sucesso!');
        }
    });

    connection.on('error', function(err) {
        console.log('Erro no banco (db error):', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
            handleDisconnect(); // Reconecta se a conexão cair
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// Ajuste na função query para usar a conexão sempre "fresca"
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = { 
    get connection() { return connection; }, // Exporta a referência atualizada
    query 
};