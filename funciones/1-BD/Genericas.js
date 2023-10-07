"use strict";
// Definir variables

module.exports = {
	// Obtiene todos
	obtieneTodos: (entidad, campoOrden, desc) =>
		db[entidad]
			.findAll({order: [[campoOrden ? campoOrden : "id", desc ? "DESC" : "ASC"]]})
			.then((n) => n.map((m) => m.toJSON())),
	obtieneTodosConInclude: (entidad, include) => db[entidad].findAll({include}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosPorCondicion: (entidad, condicion) =>
		db[entidad].findAll({where: condicion}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosPorCondicionConInclude: (entidad, condicion, include) =>
		db[entidad].findAll({where: condicion, include}).then((n) => n.map((m) => m.toJSON())),

	// Obtiene uno
	obtienePorId: (entidad, id) => db[entidad].findByPk(id).then((n) => (n ? n.toJSON() : "")),
	obtienePorIdConInclude: (entidad, id, include) => db[entidad].findByPk(id, {include}).then((n) => (n ? n.toJSON() : "")),
	obtienePorCondicion: (entidad, condicion) => db[entidad].findOne({where: condicion}).then((n) => (n ? n.toJSON() : "")),
	obtienePorCondicionConInclude: (entidad, condicion, include) =>
		db[entidad].findOne({where: condicion, include}).then((n) => (n ? n.toJSON() : "")),
	obtienePorCondicionElUltimo: (entidad, condicion) =>
		db[entidad].findOne({where: condicion, order: [["id", "DESC"]]}).then((n) => (n ? n.toJSON() : "")),

	// ABM
	agregaRegistro: (entidad, datos) => db[entidad].create(datos).then((n) => n.toJSON()),
	actualizaPorId: (entidad, id, datos) => db[entidad].update(datos, {where: {id}}).then(() => true),
	actualizaTodosPorCondicion: (entidad, condicion, datos) => db[entidad].update(datos, {where: condicion}).then(() => true),
	eliminaPorId: (entidad, id) => db[entidad].destroy({where: {id}}),
	eliminaTodosPorCondicion: (entidad, condicion) => db[entidad].destroy({where: condicion}).then(() => true),
	aumentaElValorDeUnCampo: (entidad, id, campo, aumento) => db[entidad].increment(campo, {by: aumento, where: {id}}),

	// Lectura
	contarCasos: (entidad, condicion) => db[entidad].count({where: condicion}),
	maxValor: (entidad, campo) => db[entidad].max(campo),
	maxValorPorCondicion: (entidad, condicion, campo) => db[entidad].max(campo, {where: condicion}),
};
