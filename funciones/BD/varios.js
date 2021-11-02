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

	pais_idToNombre: async function (pais_id) {
		// Función para convertir 'string de ID' en  'string de nombres'
		let resultado = [];
		if (pais_id.length) {
			BD_paises = await this.ObtenerTodos("paises", "nombre");
			pais_idArray = pais_id.split(", ");
			// Convertir 'array de ID' en 'string de nombres"
			for (pais_id of pais_idArray) {
				aux = BD_paises.find((n) => n.id == pais_id);
				aux ? resultado.push(aux.nombre) : "";
			}
		}
		resultado = resultado.length ? resultado.join(", ") : "";
		return resultado;
	},

	paisNombreToId: async function (pais_nombre) {
		// Función para convertir 'string de nombre' en  'string de ID'
		let resultado = [];
		if (pais_nombre.length) {
			BD_paises = await this.ObtenerTodos("paises", "nombre");
			pais_nombreArray = pais_nombre.split(", ");
			// Convertir 'array de nombres' en 'string de ID"
			for (pais_nombre of pais_nombreArray) {
				aux = BD_paises.find((n) => n.nombre == pais_nombre);
				aux ? resultado.push(aux.id) : "";
			}
		}
		resultado = resultado.length ? resultado.join(", ") : "";
		return resultado;
	},

	agregarPersonajeHistorico: (datos) => {
		entidad = "historicos_personajes";
		return db[entidad].create({ ...datos })
	},

	// Sin uso aún
	ObtenerPorIdConInclude: (entidad, id, include) => {
		return db[entidad].findByPk(id, {
			include: [include],
		});
	},
};
