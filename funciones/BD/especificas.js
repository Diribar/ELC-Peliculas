let db = require("../../base_de_datos/modelos");
let usuarios = db.usuarios;
let BD_varias = require("./varias");

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

	filtrarCapitulos: (coleccion_id, temporada) => {
		return db.capitulos.findAll({
			where: {coleccion_id: coleccion_id, temporada: temporada},
		});
	},

	actualizarRCLV: async (datos) => {
		// Definir variables
		let camposRCLV = ["personaje_historico_id", "hecho_historico_id", "valor_id"];
		let entidadesRCLV = ["personajes_historicos", "hechos_historicos", "valores"];
		let entidadesProd = ["peliculas", "colecciones", "capitulos"];

		// Rutina por cada campo RCLV
		for (i = 0; i < camposRCLV.length; i++) {
			campo = camposRCLV[i];
			valor = datos[campo];
			if (valor) {
				cantidad = 0;
				// Rutina por cada entidad de Productos
				for (j = 0; j < entidadesProd.length; j++) {
					cant_productos += await BD_varias.contarCasos(entidadesProd[j], campo, valor);
				}
				// Actualizar entidad de RCLV
				id = valor;
				BD_varias.actualizarRegistro("RCLV_" + entidadesRCLV[i], {cant_productos}, id);
			}
		}
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
};
