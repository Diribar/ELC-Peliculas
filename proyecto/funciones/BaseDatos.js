"use strict";
module.exports = {
	// Obtiene todos
	obtieneTodos: (entidad, include) => db[entidad].findAll({include}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosConOrden: (entidad, campoOrden, desc) =>
		db[entidad].findAll({order: [[campoOrden, desc ? "DESC" : "ASC"]]}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosPorCondicion: (entidad, condicion, include) =>
		db[entidad].findAll({where: condicion, include}).then((n) => n.map((m) => m.toJSON())),
	obtieneTodosPorCondicionConLimite: (entidad, condicion, limite, include) =>
		db[entidad].findAll({where: condicion, include, limit: limite}).then((n) => n.map((m) => m.toJSON())),

	// Obtiene uno
	obtienePorId: (entidad, id, include) => db[entidad].findByPk(id, {include}).then((n) => (n ? n.toJSON() : null)),
	obtienePorCondicion: (entidad, condicion, include) =>
		db[entidad].findOne({where: condicion, include}).then((n) => (n ? n.toJSON() : null)),
	obtienePorCondicionElUltimo: (entidad, condicion, campoOrden) =>
		db[entidad]
			.findAll({where: condicion, order: [[campoOrden ? campoOrden : "id", "DESC"]]})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => (n.length ? n[0] : null)),

	// ABM
	agregaRegistro: (entidad, datos) => db[entidad].create(datos).then((n) => n.toJSON()),
	agregaActualizaPorCondicion: async (entidad, condicion, datos) => {
		// Averigua si existe un registro con esa condición
		const existe = await db[entidad].findOne({where: condicion}).then((n) => (n ? n.toJSON() : null));

		// Actualiza o crea un registro - no hace falta el await
		existe
			? db[entidad].update(datos, {where: condicion}) // actualiza
			: db[entidad].create(datos).then((n) => n.toJSON()); // crea

		// Fin
		return;
	},
	agregaRegistroIdCorrel: async (entidad, datos) => {
		// Variables
		const idInicial = 11;
		const registros = await db[entidad].findAll({where: {id: {[Op.gte]: idInicial}}}).then((n) => n.map((m) => m.toJSON()));

		// Guarda el registro usando el primer 'id' disponible
		let id = idInicial;
		for (let registro of registros) {
			if (
				registro.id != id && // id sin registro
				!(await db[entidad].findByPk(id, {include}).then((n) => !!n)) // se asegura de que no se haya creado durante la rutina
			) {
				db[entidad].create({id, ...datos}).then((n) => n.toJSON()); // lo crea
				break;
			} else id++;
		}

		// Si no se guardó, lo guarda
		if (id > 11 + registros.length - 1) db[entidad].create(datos).then((n) => n.toJSON()); // crea

		// Fin
		return;
	},
	actualizaTodos: (entidad, datos) => db[entidad].update(datos, {where: {}}), // es obligatorio que figure un 'where'
	actualizaPorCondicion: (entidad, condicion, datos) => db[entidad].update(datos, {where: condicion}),
	actualizaPorId: (entidad, id, datos) => db[entidad].update(datos, {where: {id}}),
	eliminaPorId: (entidad, id) => db[entidad].destroy({where: {id}}),
	eliminaPorCondicion: (entidad, condicion) => db[entidad].destroy({where: condicion}),
	aumentaElValorDeUnCampo: (entidad, id, campo, aumento) =>
		db[entidad].increment(campo, {by: aumento ? aumento : 1, where: {id}}),

	// Lectura
	contarCasos: (entidad, condicion) => db[entidad].count({where: condicion}),
	minValorPorCondicion: (entidad, condicion, campo) => db[entidad].min(campo, {where: condicion}),
	maxValor: (entidad, campo) => db[entidad].max(campo),
	maxValorPorCondicion: (entidad, condicion, campo) => db[entidad].max(campo, {where: condicion}),
};
