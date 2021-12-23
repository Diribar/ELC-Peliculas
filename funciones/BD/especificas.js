let db = require("../../base_de_datos/modelos");
let usuarios = db.usuarios;

module.exports = {
	// Productos *****************************************
	obtenerProductos: (entidad, orden) => {
		return db[entidad].findAll({
			where: {borrado: false},
			order: [[orden, "ASC"]],
		});
	},

	obtenerProductosConInclude: (entidad, orden, includes) => {
		return db[entidad].findAll({
			where: {borrado: false},
			include: includes,
			order: [[orden, "ASC"]],
		});
	},

	obtenerProductoPorIdConInclude: (entidad, id, includes) => {
		return db[entidad].findByPk(id, {
			include: includes,
		});
	},

	quickSearch: async (condiciones) => {
		let peliculas = db.peliculas.findAll({where: condiciones, limit: 10}).then((n) =>
			n.map((m) => {
				m.dataValues.entidad = "peliculas";
				return m;
			})
		);
		let colecciones = db.colecciones.findAll({where: condiciones, limit: 5}).then((n) =>
			n.map((m) => {
				m.dataValues.entidad = "colecciones";
				return m;
			})
		);
		let capitulos = db.capitulos.findAll({where: condiciones, limit: 10}).then((n) =>
			n.map((m) => {
				m.dataValues.entidad = "capitulos";
				return m;
			})
		);
		let resultado = await Promise.all([peliculas, colecciones, capitulos]).then(([a, b, c]) => {
			return [...a, ...b, ...c];
		});
		return resultado;
	},

	// Usuarios *************************************************
	obtenerUsuarioPorID: (id) => {
		return usuarios.findByPk(id, {
			include: ["rol_usuario", "sexo", "status_registro", "pais", "rol_iglesia"],
		});
	},

	obtenerUsuarioPorMail: (email) => {
		return usuarios.findOne({
			where: {email: email},
			include: ["rol_usuario", "sexo", "status_registro", "pais", "rol_iglesia"],
		});
	},

	obtenerAutorizadoFA: (id) => {
		return usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},

	filtrarCapitulos: (coleccion_id, temporada) => {
		return db.capitulos.findAll({
			where: {coleccion_id: coleccion_id, temporada: temporada},
		});
	},


};
