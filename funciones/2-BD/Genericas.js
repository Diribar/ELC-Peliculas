"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");

module.exports = {
	// Obtiene todos
	obtieneTodos: (entidad, orden) => {
		return db[entidad].findAll({order: [[orden, "ASC"]]}).then((n) => n.map((m) => m.toJSON()));
	},
	obtieneTodosConInclude: (entidad, include) => {
		return db[entidad].findAll({include}).then((n) => n.map((m) => m.toJSON()));
	},
	obtieneTodosPorCondicion: (entidad, condicion) => {
		return db[entidad].findAll({where: condicion}).then((n) => n.map((m) => m.toJSON()));
	},
	obtieneTodosPorCondicionConInclude: (entidad, condicion, include) => {
		return db[entidad].findAll({where: condicion, include}).then((n) => n.map((m) => m.toJSON()));
	},

	// Obtiene uno
	obtienePorId: (entidad, id) => {
		return db[entidad].findByPk(id).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorIdConInclude: (entidad, id, include) => {
		return db[entidad].findByPk(id, {include}).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorCondicion: (entidad, condicion) => {
		return db[entidad].findOne({where: condicion}).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorCondicionConInclude: (entidad, condicion, include) => {
		return db[entidad].findOne({where: condicion, include}).then((n) => (n ? n.toJSON() : ""));
	},
	obtienePorCondicionElUltimo: (entidad, condicion) => {
		return db[entidad].findOne({where: condicion, order: [["id", "DESC"]]}).then((n) => (n ? n.toJSON() : ""));
	},

	// ABM
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

	// Lectura
	contarCasos: (entidad, objeto) => {
		return db[entidad].count({where: objeto});
	},
	maxValor: (entidad, campo) => {
		return db[entidad].max(campo);
	},
	maxValorPorCampos: (entidad, objeto, campo) => {
		return db[entidad].max(campo, {where: objeto});
	},
};
