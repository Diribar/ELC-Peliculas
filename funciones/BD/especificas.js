const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;
let BD_varias = require("./Varias");

module.exports = {
	// Productos *****************************************
	quickSearch: async (condiciones) => {
		let peliculas = db.peliculas
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "peliculas"};
				})
			);
		let colecciones = db.colecciones
			.findAll({where: condiciones, limit: 5})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "colecciones"};
				})
			);
		let capitulos = db.capitulos
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "capitulos"};
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
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},
	obtenerVersionesDeProducto: async function (entidad, prodID, userID) {
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
		let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, includes).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Obtener el producto EDITADO
		let prodEditado = {};
		if (prodOriginal) {
			// Quitarle los campos 'null'
			prodOriginal = this.quitarLosCamposSinContenido(prodOriginal);
			// Obtener los datos EDITADOS del producto
			prodEditado = await BD_varias.obtenerPor3CamposConInclude(
				"productos_edic",
				"elc_entidad",
				entidad,
				"elc_id",
				prodID,
				"editado_por_id",
				userID,
				includes.slice(0, -2)
			).then((n) => {
				return n ? n.toJSON() : "";
			});
			if (prodEditado) {
				// Quitarle el ID para que no se superponga con el del producto original
				delete prodEditado.id;
				// Quitarle los campos 'null'
				prodEditado = this.quitarLosCamposSinContenido(prodEditado);
			}
			prodEditado = {...prodOriginal, ...prodEditado};
		}
		return [prodOriginal, prodEditado];
	},
	quitarLosCamposSinContenido: (objeto) => {
		let campos = Object.keys(objeto);
		for (i = campos.length - 1; i >= 0; i--) {
			if (objeto[campos[i]] === null || objeto[campos[i]] === "") delete objeto[campos[i]];
		}
		return objeto;
	},
	quitarDeEdicionLasCoincidenciasConOriginal: (original, edicion) => {
		let campos = Object.keys(edicion);
		for (campo of campos) {
			if (edicion[campo] == original[campo]) delete edicion[campo];
		}
		return edicion;
	},
	actualizarCantCasos_RCLV: async (datos) => {
		// Definir variables
		let entidadesRCLV = ["personajes", "hechos", "valores"];
		let camposRCLV = ["personaje_id", "hecho_id", "valor_id"];
		let entidadesProd = ["peliculas", "colecciones", "capitulos"];

		// Rutina por cada campo RCLV
		for (i = 0; i < camposRCLV.length; i++) {
			campo = camposRCLV[i];
			valor = datos[campo];
			if (valor) {
				let cant_productos = 0;
				// Rutina por cada entidad de Productos
				for (entidadProd of entidadesProd) {
					cant_productos += await BD_varias.contarCasos(entidadProd, campo, valor);
				}
				// Actualizar entidad de RCLV
				id = valor;
				BD_varias.actualizarPorId("RCLV_" + entidadesRCLV[i], id, {cant_productos});
			}
		}
	},
	obtenerTodos_Revision: async function (entidad, includes, haceUnaHora) {
		let [, , aprobado_id, , , inactivado_id] = await this.obtenerStatus();
		return db[entidad]
			.findAll({
				where: {
					[Op.not]: [{status_registro_id: [aprobado_id, inactivado_id]}],
					[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
				},
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad})) : ""));
	},
	obtenerStatus: async () => {
		let status = await BD_varias.obtenerTodos("status_registro_ent", "orden").then((n) =>
			n.map((m) => m.toJSON())
		);
		let creado_id = status.find((n) => n.creado).id;
		let editado_id = status.find((n) => n.editado).id;
		let aprobado_id = status.find((n) => n.aprobado).id;
		let inactivar_id = status.find((n) => n.sugerido_inactivar).id;
		let recuperar_id = status.find((n) => n.sugerido_recuperar).id;
		let inactivado_id = status.find((n) => n.inactivado).id;
		return [creado_id, editado_id, aprobado_id, inactivar_id, recuperar_id, inactivado_id];
	},
	obtenerEdicion_Revision: async function (entidad, original) {
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
		];
		if (original.entidad == "capitulos") includes.push("coleccion");
		// Obtener el producto EDITADO
		let prodEditado = await BD_varias.obtenerPor2CamposConInclude(
			entidad,
			"elc_entidad",
			original.entidad,
			"elc_id",
			original.id,
			includes.slice(0, -2)
		).then((n) => {
			return n ? n.toJSON() : "";
		});
		// Quitarle los campos 'null'
		if (prodEditado) prodEditado = this.quitarLosCamposSinContenido(prodEditado);
		// Fin
		return prodEditado;
	},

	// Usuarios *************************************************
	obtenerUsuarioPorID: (id) => {
		return db.usuarios.findByPk(id, {
			include: ["rol_usuario", "sexo", "status_registro", "pais", "rol_iglesia"],
		});
	},
	obtenerUsuarioPorMail: (email) => {
		return db.usuarios.findOne({
			where: {email: email},
			include: ["rol_usuario", "sexo", "status_registro", "pais", "rol_iglesia"],
		});
	},
	obtenerAutorizadoFA: (id) => {
		return db.usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
};
