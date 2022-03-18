const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;
let BD_varias = require("./Varias");

module.exports = {
	// Productos *****************************************
	// Header
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
	// API-Agregar
	obtenerCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({
				where: {coleccion_id: coleccion_id, temporada: temporada},
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},
	// Controladora-Agregar
	quitarDeEdicionLasCoincidenciasConOriginal: (original, edicion) => {
		let campos = Object.keys(edicion);
		for (campo of campos) {
			if (edicion[campo] == original[campo]) delete edicion[campo];
		}
		return edicion;
	},
	// API-RUD
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
	// API-RUD
	quitarLosCamposSinContenido: (objeto) => {
		let campos = Object.keys(objeto);
		for (i = campos.length - 1; i >= 0; i--) {
			if (objeto[campos[i]] === null || objeto[campos[i]] === "") delete objeto[campos[i]];
		}
		return objeto;
	},
	// Controlador-Revisar
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
		return {creado_id, editado_id, aprobado_id, inactivar_id, recuperar_id, inactivado_id};
	},
	// Controlador-Revisar
	obtenerProductos: async (haceUnaHora, status, userID) => {
		// Obtener los registros del Producto, que cumplan ciertas condiciones
		// Entidades
		let entidades = ["peliculas", "colecciones"];
		let resultados = [];
		for (let i = 0; i < entidades.length; i++) {
			resultados.push();
			resultados[i] = db[entidades[i]]
				.findAll({
					where: {
						// 	Con registro distinto a 'aprobado' e 'inactivado'
						[Op.not]: [{status_registro_id: status}],
						// Que no esté capturado
						[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
						// Que esté en condiciones de ser capturado
						creado_en: {[Op.lt]: haceUnaHora},
						// Que esté creado por otro usuario
						creado_por_id: {[Op.ne]: userID},
					},
					include: "status_registro",
				})
				.then((n) =>
					n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad: entidades[i]})) : []
				);
		}
		let resultado = await Promise.all([resultados[0], resultados[1]]).then(([a, b]) => {
			return [...a, ...b];
		});
		return resultado;
	},
	// Controlador-Revisar
	obtenerRCLV: (entidad, includes, haceUnaHora, status, userID) => {
		// Obtener todos los registros de RCLV, excepto los que tengan status 'aprobado' con 'cant_productos'
		return db[entidad]
			.findAll({
				where: {
					// Con registro distinto a 'aprobado' e 'inactivado'
					[Op.not]: [{status_registro_id: status}],
					// Que no esté capturado
					[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
					// Que esté en condiciones de ser capturado
					creado_en: {[Op.lt]: haceUnaHora},
					// Que esté creado por otro usuario
					creado_por_id: {[Op.ne]: userID},
					// Cuyo 'id' sea mayor que 10
					id: {[Op.gt]: 20},
				},
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad})) : []));
	},
	// Controlador-Revisar
	obtenerLinks: (haceUnaHora, status, userID) => {
		// Obtener todos los registros de RCLV, excepto los que tengan status 'aprobado' con 'cant_productos'
		includes = ["pelicula", "coleccion", "capitulo"];
		return db.links_originales
			.findAll({
				where: {
					// Con registro distinto a 'aprobado' e 'inactivado'
					[Op.not]: [{status_registro_id: status}],
					// Que no esté capturado
					[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
					// Que esté en condiciones de ser capturado
					fecha_referencia: {[Op.lt]: haceUnaHora},
					// Que esté creado por otro usuario
					creado_por_id: {[Op.ne]: userID},
				},
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()) : []));
	},
	// Nadie
	actualizarCantCasos_RCLV: async (datos, status_id) => {
		// Definir variables
		let entidadesRCLV = ["personajes", "hechos", "valores"];
		let camposRCLV = ["personaje_id", "hecho_id", "valor_id"];
		let entidadesProd = ["peliculas", "colecciones", "capitulos", "productos_edic"];
		// Rutina por cada campo RCLV
		for (i = 0; i < camposRCLV.length; i++) {
			campo = camposRCLV[i];
			valor = datos[campo];
			if (valor) {
				let cant_productos = await BD_varias.contarCasos(entidadProd, campo, valor, status_id);
				// Actualizar entidad de RCLV
				await BD_varias.actualizarPorId("RCLV_" + entidadesRCLV[i], valor, {cant_productos});
			}
		}
	},
	// Nadie
	contarProductos: async (entidadProd, campo, valor, status_id) => {
		let cant_productos = 0;
		// Rutina por cada entidad de Productos
		for (entidadProd of entidadesProd) {
			cant_productos += await db[entidadProd].count({
				where: {
					[campo]: valor,
					status_registro_id: status_id,
				},
			});
		}
		return cant_productos;
	},
	// Nadie
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
