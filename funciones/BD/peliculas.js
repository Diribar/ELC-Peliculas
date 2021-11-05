const db = require("../../base_de_datos/modelos");
const entidad = db.peliculas;
//const { Op } = require("sequelize");

module.exports = {
	ObtenerTodos: () => {
		return entidad.findAll({
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
			where: { borrado: false },
		});
	},

	ObtenerPorParametro: (parametro, valor) => {
		return entidad.findOne({
			where: { [parametro]: valor },
		});
	},

	ObtenerELC_id: (parametro, valor) => {
		return entidad.findOne({ where: { [parametro]: valor } }).then((n) => {
			return n ? n.id : false;
		});
	},

	ObtenerPorID: (ID) => {
		return entidad.findByPk(ID, {
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
		});
	},

	NombreOriginalYaExistente: (nombre_original) => {
		return entidad.findOne({
			where: { nombre_original: nombre_original },
		});
	},

	agregarPelicula: async (datos) => {
		//return datos
		return await entidad.create({ ...datos });
	},
};
