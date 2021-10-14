const db = require("../../base_de_datos/modelos");

module.exports = {
	ObtenerTodos: (entidad, orden) => {
		return db[entidad].findAll({
			order: [[orden, "ASC"]],
		});
	},

	ObtenerPorParametro: (entidad, parametro, valor) => {
		return db[entidad].findOne({
			where: { [parametro]: valor },
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
	paises: async function (pais_id) {
		let resultado = "";
		if (pais_id.length) {
			BD_paises = await this.ObtenerTodos("paises", "nombre");
			aux = pais_id.split(", ");
			for (pais of aux) {
				pais != aux[0] ? (resultado += ", ") : "";
				resultado += BD_paises.find((n) => n.id == pais).nombre;
			}
		}
		return resultado;
	},
};
