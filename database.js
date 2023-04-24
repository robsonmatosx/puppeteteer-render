
const mysql = require('mysql');
require("dotenv").config();

var connection = mysql.createConnection({
	host : process.env.DB_HOST,
    port:  process.env.DB_PORT,
	database : process.env.DB,
	user : process.env.DB_USER,
	password : process.env.DB_PASS
});

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