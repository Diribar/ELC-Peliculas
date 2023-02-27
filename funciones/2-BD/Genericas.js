"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");

module.exports = {
	// Obtiene
	obtieneTodos: (entidad, orden) => {
		return db[entidad].findAll({order: [[orden, "ASC"]]}).then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtieneTodosConInclude: (entidad, include) => {
		return db[entidad].findAll({include}).then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtieneTodosPorCampos: (entidad, objeto) => {
		return db[entidad].findAll({where: objeto}).then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtieneTodosPorCamposConInclude: (entidad, objeto, include) => {
		return db[entidad].findAll({where: objeto, include}).then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtienePorId: (entidad, id) => {
		return db[entidad].findByPk(id).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorIdConInclude: (entidad, id, include) => {
		return db[entidad].findByPk(id, {include}).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorCampos: (entidad, objeto) => {
		return db[entidad].findOne({where: objeto}).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorCamposConInclude: (entidad, objeto, include) => {
		return db[entidad].findOne({where: objeto, include}).then((n) => (n ? n.toJSON() : ""));
	},

	// Otras
	agregaRegistro: (entidad, datos) => {
		return db[entidad].create(datos).then((n) => n.toJSON());
	},
	actualizaPorId: (entidad, id, datos) => {
		return db[entidad].update(datos, {where: {id}});
	},
	actualizaTodosPorCampos: (entidad, objeto, datos) => {
		return db[entidad].update(datos, {where: objeto});
	},
	eliminaPorId: (entidad, id) => {
		return db[entidad].destroy({where: {id}});
	},
	eliminaTodosPorCampos: (entidad, objeto) => {
		return db[entidad].destroy({where: objeto});
	},
	aumentaElValorDeUnCampo: (entidad, id, campo, aumento) => {
		return db[entidad].increment(campo, {by: aumento, where: {id}});
	},
	contarCasos: (entidad, objeto) => {
		return db[entidad].count({where: objeto});
	},
};
