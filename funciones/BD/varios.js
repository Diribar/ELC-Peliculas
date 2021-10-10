const db = require("../../base_de_datos/modelos");

module.exports = {
	ObtenerTodos: (entidad, orden) => {
		return db[entidad].findAll({
			order: [[orden, "ASC"]],
		});
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
	ObtenerPorId: (entidad, id) => {
		return db[entidad].findByPk(id);
	},
	// Sin uso aún
	ObtenerPorIdConInclude: (entidad, id, include) => {
		return db[entidad].findByPk(id, {
			include: [include],
		});
	},
};
