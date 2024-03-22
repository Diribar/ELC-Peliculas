"use strict";

// Variables
const config = require(__dirname + "/../config/config.js")[nodeEnv];
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const basename = path.basename(__filename);
const aux = {};

// Agrega cada tabla a 'aux'
fs.readdirSync(__dirname)
	.filter((file) => file !== basename && file.indexOf(".") !== 0 && file.slice(-3) === ".js") // archivo distinto a éste y con terminación '.js'
	.map((file) => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		aux[model.name] = model;
	});

// Agrega las asociaciones
for (let modelName in aux) if (aux[modelName].associate) aux[modelName].associate(aux);

// Agrega las funciones
aux.Sequelize = Sequelize;
aux.sequelize = sequelize;

// Fin
module.exports = aux;
