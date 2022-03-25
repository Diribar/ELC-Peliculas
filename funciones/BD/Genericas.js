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
	obtenerTodosPorCampo: (entidad, campo, valor) => {
		return db[entidad]
			.findAll({
				where: {[campo]: valor},
			})
			.then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerTodosPorCampoConInclude: (entidad, campo, valor, includes) => {
		return db[entidad]
			.findAll({
				where: {[campo]: valor},
				include: includes,
			})
			.then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerTodosPor2Campos: (entidad, campo1, valor1, campo2, valor2) => {
		return db[entidad]
			.findAll({
				where: {[campo1]: valor1, [campo2]: valor2},
			})
			.then((n) => n.map((m) => m.toJSON()));
		// .then((n) => (n.length ? n.map((m) => m.toJSON()) : ""));
	},
	obtenerPorId: (entidad, id) => {
		return db[entidad].findByPk(id).then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPorIdConInclude: (entidad, id, includes) => {
		return db[entidad].findByPk(id, {include: includes}).then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPorCampo: (entidad, campo, valor) => {
		return db[entidad]
			.findOne({
				where: {[campo]: valor},
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPor2Campos: (entidad, campo1, valor1, campo2, valor2) => {
		return db[entidad]
			.findOne({
				where: {[campo1]: valor1, [campo2]: valor2},
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPor2CamposConInclude: (entidad, campo1, valor1, campo2, valor2, includes) => {
		return db[entidad]
			.findOne({
				where: {[campo1]: valor1, [campo2]: valor2},
				include: includes,
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPor3Campos: (entidad, campo1, valor1, campo2, valor2, campo3, valor3) => {
		return db[entidad]
			.findOne({
				where: {[campo1]: valor1, [campo2]: valor2, [campo3]: valor3},
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	obtenerPor3CamposConInclude: (entidad, campo1, valor1, campo2, valor2, campo3, valor3, includes) => {
		return db[entidad]
			.findOne({
				where: {[campo1]: valor1, [campo2]: valor2, [campo3]: valor3},
				include: includes,
			})
			.then((n) => (n ? n.toJSON() : ""));
	},

	// Otras
	agregarRegistro: (datos) => {
		return db[datos.entidad].create(datos);
	},
	actualizarPorId: (entidad, id, datos) => {
		return db[entidad].update(datos, {where: {id: id}});
	},
	actualizarPorCampo: (entidad, campo, valor, datos) => {
		return db[entidad].update(datos, {where: {[campo]: valor}});
	},
	eliminarRegistro: (entidad, id) => {
		return db[entidad].destroy({where: {id: id}});
	},
	aumentarElValorDeUnCampo: (entidad, id, campo) => {
		return db[entidad].increment(campo, {by: 1, where: {id: id}});
	},
	contarCasos: (entidad, campo, valor) => {
		return db[entidad].count({
			where: {[campo]: valor},
		});
	},
};
