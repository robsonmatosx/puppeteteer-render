
const mysql = require('mysql');
// const mysql = require('mysql2');
require("dotenv").config();

var connection = mysql.createConnection({
	host : process.env.DB_HOST,
    port:  process.env.DB_PORT,
	database : process.env.DB,
	user : process.env.DB_USER,
	password : process.env.DB_PASS
});

// const pool = mysql.createPool({
//   host : process.env.DB_HOST,
//     port:  process.env.DB_PORT,
// 	database : process.env.DB,
// 	user : process.env.DB_USER,
// 	password : process.env.DB_PASS,
//   waitForConnections: true,
//   connectionLimit: 10, // Max simultaneous connections
//   queueLimit: 0
// });

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;
// module.exports = pool.promise(); 