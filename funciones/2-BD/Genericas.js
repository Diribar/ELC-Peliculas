"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");

module.exports = {
	// Obtener
	obtenerTodos: (entidad, orden) => {
		return db[entidad]
			.findAll({
				order: [[orden, "ASC"]],
			})
			.then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerTodosConInclude: (entidad, includes) => {
		return db[entidad]
			.findAll({
				include: includes,
			})
			.then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerTodosPorCampos: (entidad, objeto) => {
		return db[entidad].findAll({where: objeto}).then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerTodosPorCamposConInclude: (entidad, objeto, includes) => {
		return db[entidad].findAll({where: objeto, include: includes}).then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerPorId: (entidad, id) => {
		return db[entidad].findByPk(id).then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPorIdConInclude: (entidad, id, includes) => {
		return db[entidad].findByPk(id, {include: includes}).then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPorCampos: (entidad, objeto) => {
		return db[entidad].findOne({where: objeto}).then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPorCamposConInclude: (entidad, objeto, includes) => {
		return db[entidad].findOne({where: objeto, include: includes}).then((n) => (n ? n.toJSON() : ""));
	},

	// Otras
	agregarRegistro: (entidad, datos) => {
		return db[entidad].create(datos);
	},
	actualizarPorId: (entidad, id, datos) => {
		return db[entidad].update(datos, {where: {id: id}});
	},
	actualizarPorCampos: (entidad, objeto, datos) => {
		return db[entidad].update(datos, {where: objeto});
	},
	eliminarPorId: (entidad, id) => {
		return db[entidad].destroy({where: {id: id}});
	},
	aumentarElValorDeUnCampo: (entidad, id, campo, aumento) => {
		return db[entidad].increment(campo, {by: aumento, where: {id: id}});
	},
	contarCasos: (entidad, objeto) => {
		return db[entidad].count({where: objeto});
	},
};
