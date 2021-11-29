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
		let peliculas = await db.peliculas
			.findAll({
				where: condiciones,
			})
			.then((n) =>
				n.map((m) => {
					return {
						...m,
						entidad: "peliculas",
					};
				})
			);
		// let colecciones = db.colecciones
		// 	.findAll({
		// 		where: condiciones,
		// 	})
		// 	.then((n) =>
		// 		n.map((m) => {
		// 			return {
		// 				...m,
		// 				entidad: "colecciones",
		// 			};
		// 		})
		// 	);
		// let capitulos = db.capitulos
		// 	.findAll({
		// 		where: condiciones,
		// 	})
		// 	.then((n) =>
		// 		n.map((m) => {
		// 			return {
		// 				...m,
		// 				entidad: "capitulos",
		// 			};
		// 		})
		// 	);
		// let resultado = await Promise.all([peliculas, colecciones, capitulos]).then(([a, b, c]) => {
		// 	return {...a, ...b, ...c};
		// });
		console.log("linea 96", peliculas.length);
		console.log("linea 97", peliculas[0].dataValues.nombre_original);
		if (peliculas.length > 1) console.log("linea 98", peliculas[1].dataValues.nombre_original);
		return peliculas;
	},

	// Usuarios *************************************************
	obtenerUsuarioPorID: (id) => {
		return usuarios.findByPk(id, {
			include: ["rol_usuario", "sexo", "status_registro", "pais", "estado_eclesial"],
		});
	},

	obtenerUsuarioPorMail: (email) => {
		return usuarios.findOne({
			where: {email: email},
			include: ["rol_usuario", "sexo", "status_registro", "pais", "estado_eclesial"],
		});
	},

	obtenerAutorizadoFA: (id) => {
		return usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
};
