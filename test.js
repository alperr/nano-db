var DB = require("./nano-db.js");

var schema = 
{
	"user":
	{
		"columns": [ "name","password" ],
		"index": [ "name" ]
	}
}

DB.open("./aa.db", schema);