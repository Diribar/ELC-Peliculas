let db = require("../../base_de_datos/modelos");
let peliculas = db.peliculas;
let colecciones = db.colecciones;
let usuarios = db.usuarios;
//const { Op } = require("sequelize");

module.exports = {
	obtenerTodos_Peli: () => {
		return peliculas.findAll({
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
			where: { borrado: false },
		});
	},

	obtenerTodos_Colec: () => {
		return colecciones.findAll({
			include: ["colecciones_partes"],
			where: { borrado: false },
		});
	},

	obtenerPorId_Peli: (id) => {
		return peliculas.findByPk(id, {
			include: ["coleccion_pelicula", "categoria", "subcategoria"],
		});
	},

	obtenerPorId_Colec: (id) => {
		return colecciones.findByPk(id, {
			include: ["colecciones_partes"],
		});
	},

	obtenerPorId_Usuario: (id) => {
		return usuarios.findByPk(id, {
			include: [
				"rol_usuario",
				"sexo",
				"status_registro",
				"pais",
				"estado_eclesial",
			],
		});
	},

	obtenerPorMail: (email) => {
		return usuarios.findOne({
			where: { email: email },
			include: [
				"rol_usuario",
				"sexo",
				"status_registro",
				"pais",
				"estado_eclesial",
			],
		});
	},

	obtenerAutorizadoFA: (id) => {
		return usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
};
