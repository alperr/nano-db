const SQLITE3 = require("better-sqlite3");
const FS = require("fs");

function create_db(path, schema)
{
	if (FS.existsSync(path))
		return;

	var db = SQLITE3(path);
	var sqls = generate_schema_sql(schema);
	for (var i=0;i<sqls.length;i++)
	{
		var s = sqls[i]
		db.prepare(s).run();
	}

	console.log("db created ", path);
	return true;
}


function generate_table_sql(schema, table, sqls)
{
	var cols = schema[table]["columns"];
	var indices = schema[table]["index"];
	if (typeof indices == "undefined")
		indices = [];

	var col_string = "";
	for (var i=0;i<cols.length;i++)
	{
		if (typeof cols[i] == "string")
			cols[i] = [cols[i], "TEXT"];

		col_string += `"${cols[i][0]}" ${cols[i][1]}`;
		if (i != cols.length -1)
			col_string += ", ";
	}

	sqls.push(`CREATE TABLE "${table}" (${col_string})`)

	for (var i=0;i<indices.length;i++)
	{
		if (typeof indices[i] == "string")
			indices[i] = [indices[i]];

		var ind = indices[i];
		var name = `${table}_idx`;
		var fields = "";
		for (var j=0;j<ind.length;j++)
		{
			name += `_${ind[j]}`;
			fields += `'${ind[j]}'`;

			if (j != ind.length -1)
				fields += ", ";
		}

		sqls.push(`CREATE INDEX '${name}' ON '${table}' (${fields})`);
	}
}


/*
{
	"user":
	{
		"columns":
		[
			"name","password","role",
			["registration_time","INTEGER"],
		],
		"index": [ "name", ["name", "registration_time"] ]
	},
	"media":
	{
		"columns":
		[
			"name", "url", ["width", "INTEGER"],
			["file_size", "INTEGER"], ["height", "INTEGER"],
		],
		"index": 
		[ 
			"name", "url", "file_size", 
			["width", "height"] 
		]
	}
}
*/

function generate_schema_sql(schema)
{
	var sqls = ["BEGIN TRANSACTION"];
	for(var table in schema)
		generate_table_sql(schema, table, sqls);

	sqls.push("COMMIT");
	return sqls;
}

function generate_qmarks(l)
{
	var a = new Array(l);
	for (var i=0;i<l;i++)
		a[i] = "?";
	return a.join(",");
}

function open_db(path, schema)
{
	create_db(path, schema);
	return SQLITE3(path);
}

exports.open = open_db;

