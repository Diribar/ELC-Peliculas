"use strict";
const produccion = {
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	host: process.env.DB_HOST,
	dialect: "mysql",
	logging: false,
};

module.exports = {
	development: {
		username: "root",
		password: "",
		database: process.env.DB_NAME,
		host: "127.0.0.1",
		dialect: "mysql",
		logging: false,
	},
	pruebas: produccion,
	production: produccion,
};
