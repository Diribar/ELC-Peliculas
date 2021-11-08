const db = require("../../base_de_datos/modelos");

module.exports = {
	obtenerTodos: (entidad, orden) => {
		return db[entidad].findAll({
			order: [[orden, "ASC"]],
		});
	},

	obtenerPorParametro: (entidad, parametro, valor) => {
		return db[entidad].findOne({
			where: { [parametro]: valor },
		});
	},

	obtenerTodosIncludeOrder: (
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

	obtenerPorId: (entidad, id) => {
		return db[entidad].findByPk(id);
	},

	obtenerELC_id: (datos) => {
		return db[datos.entidad]
			.findOne({ where: { [datos.campo]: datos.id } })
			.then((n) => {
				return n ? n.id : false;
			});
	},

	pais_idToNombre: async function (pais_id) {
		// Función para convertir 'string de ID' en  'string de nombres'
		let resultado = [];
		if (pais_id.length) {
			BD_paises = await this.obtenerTodos("paises", "nombre");
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
			BD_paises = await this.obtenerTodos("paises", "nombre");
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

	agregarPorEntidad: (entidad, datos) => {
		return db[entidad].create(datos);
	},

	actualizarPorEntidad: (entidad, datos, ID) => {
		return db[entidad].update(datos, { where: { id: ID } });
	},

	// Sin uso aún
	obtenerPorIdConInclude: (entidad, id, include) => {
		return db[entidad].findByPk(id, {
			include: [include],
		});
	},
};
