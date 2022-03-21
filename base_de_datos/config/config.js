"use strict";

module.exports = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "mysql",
		logging: false,
	},
	test: {
		username: "root",
		password: null,
		database: "elc_peliculas_test",
		host: "127.0.0.1",
		dialect: "mysql",
	},
	production: {
		username: "root",
		password: null,
		database: "elc_peliculas_live",
		host: "127.0.0.1",
		dialect: "mysql",
		logging: false,
	},
};
