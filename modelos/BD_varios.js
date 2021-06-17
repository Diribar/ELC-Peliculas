const db = require("../bases_de_datos/modelos");

module.exports = {
	ObtenerTodos: (entidad) => {
		return db[entidad].findAll({});
	},

	ObtenerFiltrandoPorCampo: (entidad, campoWhere, valorWhere) => {
		return db[entidad].findAll({
			where: { [campoWhere]: valorWhere },
		});
	},

	ObtenerTodosIncludeOrder: (
		entidad,
		camposInclude,
		campoOrder,
		valorOrder
	) => {
		return db[entidad].findAll({
			include: [camposInclude],
			order: [[campoOrder, valorOrder]],
		});	
	},	

	// obtenerPorId: (id, entidad, include) => {
	// 	return db[entidad].findByPk(id, {
	// 		include: [include],
	// 	});
	// },
};
