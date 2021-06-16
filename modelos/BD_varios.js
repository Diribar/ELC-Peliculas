const db = require("../bases_de_datos/modelos");

module.exports = {
	ObtenerTodos: (entidad, camposInclude, campoOrder, valorOrder) => {
		return db[entidad].findAll({
			include: [camposInclude],
			order: [[campoOrder, valorOrder]],
		});
	},

	ObtenerPorParametro: (entidad, camposInclude, campoOrder, valorOrder, campoWhere, valorWhere) => {
		return entidad.findOne({
			include: [camposInclude],
			order: [[campoOrder, valorOrder]],
			where: { [campoWhere]: valorWhere },
		});
	},

	// obtenerPorId: (id, entidad, include) => {
	// 	return db[entidad].findByPk(id, {
	// 		include: [include],
	// 	});
	// },
};