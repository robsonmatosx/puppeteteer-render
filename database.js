const mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'mysql670.umbler.com',
    port: '41890',
	database : 'db_convee60504c',
	user : 'us_convee60504c',
	password : '2cb28628db'
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