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

	obtenerCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({
				where: {coleccion_id: coleccion_id, temporada: temporada},
			})
			.then((n) => n.map((m) => m.dataValues))
			.then((n) => n.map((m) => m.capitulo));
	},

	obtenerVersionesDeProducto: async (entidad, prodID, userID) => {
		// Definir los campos include
		let includes = [
			"idioma_original",
			"en_castellano",
			"en_color",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"status_registro",
			"editado_por",
			// A partir de acá, van los campos exclusivos de 'Original'
			"creado_por",
		];
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener el producto ORIGINAL
		let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, includes).then(
			(n) => {
				return n ? n.toJSON() : "";
			}
		);
		// Obtener el producto EDITADO
		let prodEditado = {};
		if (prodOriginal) {
			// Quitarle los campos 'null'
			let campos = Object.keys(prodOriginal);
			for (i = campos.length - 1; i >= 0; i--) {
				if (prodOriginal[campos[i]] === null) delete prodOriginal[campos[i]];
			}
			// Obtener los datos EDITADOS del producto
			prodEditado = await BD_varias.obtenerPor3CamposConInclude(
				"productos_edic",
				"ELC_entidad",
				entidad,
				"ELC_id",
				prodID,
				"editado_por_id",
				userID,
				includes.slice(0, -2)
			).then((n) => {
				return n ? n.toJSON() : "";
			});
			if (!prodEditado) prodEditado = {} 
			else {
				// Quitarle el ID para que no se superponga con el del producto original
				delete prodEditado.id;
				// Quitarle los campos 'null'
				let campos = Object.keys(prodEditado);
				for (i = campos.length - 1; i >= 0; i--) {
					if (prodEditado[campos[i]] === null) delete prodEditado[campos[i]];
				}
			}
		}
		return [prodOriginal, prodEditado];
	},

	actualizarRCLV: async (datos) => {
		// Definir variables
		let camposRCLV = ["personaje_id", "hecho_id", "valor_id"];
		let entidadesRCLV = ["personajes", "hechos", "valores"];
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
