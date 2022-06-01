"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;

module.exports = {
	// Varios
	obtenerELC_id: (entidad, objeto) => {
		return db[entidad].findOne({where: objeto}).then((n) => (n ? n.id : ""));
	},
	validarRepetidos: (campos, datos) => {
		// El mismo valor para los campos
		let objeto = {};
		for (let campo of campos) objeto[campo] = datos[campo];
		// Distinto ID
		if (datos.id) objeto = {...objeto, id: {[Op.ne]: datos.id}};
		return db[datos.entidad].findOne({where: objeto}).then((n) => (n ? n.id : false));
	},
	// Header
	quickSearchCondiciones: (palabras) => {
		palabras = palabras.split(" ");
		// Definir los campos en los cuales buscar
		let campos = ["nombre_original", "nombre_castellano"];
		// Crear el objeto literal con los valores a buscar
		let valoresOR = [];
		for (let campo of campos) {
			let CondicionesDeCampo = [];
			for (let palabra of palabras) {
				let CondiciondePalabra = {
					[Op.or]: [
						{[campo]: {[Op.like]: "% " + palabra + "%"}},
						{[campo]: {[Op.like]: palabra + "%"}},
					],
				};
				CondicionesDeCampo.push(CondiciondePalabra);
			}
			let ResumenDeCampo = {[Op.and]: CondicionesDeCampo};
			valoresOR.push(ResumenDeCampo);
		}
		let condiciones = {[Op.or]: valoresOR};
		return condiciones;
	},
	quickSearchProductos: async (condiciones) => {
		// Obtener las películas
		let peliculas = db.peliculas
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "peliculas"};
				})
			);
		// Obtener las colecciones
		let colecciones = db.colecciones
			.findAll({where: condiciones, limit: 5})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "colecciones"};
				})
			);
		// Obtener los capítulos
		let capitulos = db.capitulos
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "capitulos"};
				})
			);
		// Consolidar los hallazgos
		let resultado = await Promise.all([peliculas, colecciones, capitulos]).then(([a, b, c]) => {
			return [...a, ...b, ...c];
		});
		// Ordenar el resultado
		resultado.sort((a, b) => {
			return a.nombre_castellano < b.nombre_castellano
				? -1
				: a.nombre_castellano > b.nombre_castellano
				? 1
				: 0;
		});
		// Enviar el resultado
		return resultado;
	},

	// AgregarProductos - ControladorAPI
	obtenerCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({
				where: {coleccion_id: coleccion_id, temporada: temporada},
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},

	// Revisar - Procesar Producto
	// Revisar - Procesar RCLV
	condicRegistro_ARevisar: (entidad, haceUnaHora, revisar, userID, includes) => {
		return db[entidad]
			.findAll({
				where: {
					// Con status de 'revisar'
					status_registro_id: revisar,
					// Que cumpla alguno de los siguientes sobre la 'captura':
					[Op.or]: [
						// Que no esté capturado
						{capturado_en: null},
						// Que la captura haya sido hace más de una hora
						{capturado_en: {[Op.lt]: haceUnaHora}},
						// Que la captura esté inactiva
						{captura_activa: {[Op.ne]: 1}},
						// Que esté capturado por este usuario
						{capturado_por_id: userID},
					],
					// Que esté creado hace más de una hora
					creado_en: {[Op.lt]: haceUnaHora},
					// Que esté creado por otro usuario
					creado_por_id: {[Op.ne]: userID},
				},
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad: entidad})) : []));
	},
	// Revisar - Procesar Producto (Edición)
	condicEdicProd_ARevisar: (haceUnaHora, userID) => {
		return db.prods_edicion
			.findAll({
				where: {
					// Que esté creado por otro usuario
					editado_por_id: {[Op.ne]: userID},
					// Que esté creado hace más de una hora
					editado_en: {[Op.lt]: haceUnaHora},
				},
				include: ["pelicula", "coleccion", "capitulo"],
			})
			.then((n) => (n ? n.map((m) => m.toJSON()) : []));
	},
	// Revisar - ControladorVista => redireccionar
	obtenerEdicionAjena: async (producto_id, prodID, userID, haceUnaHora) => {
		// Obtener un registro que cumpla ciertas condiciones
		return db.prods_edicion
			.findOne({
				where: {
					// Que pertenezca al producto que nos interesa
					[producto_id]: prodID,
					// Que esté en condiciones de ser capturado
					editado_en: {[Op.lt]: haceUnaHora},
					// Que esté editado por otro usuario
					editado_por_id: {[Op.ne]: userID},
				},
			})
			.then((n) => (n ? n.toJSON().id : ""));
	},
	// Revisar - Procesar => links_ObtenerARevisar
	obtenerLinksARevisar: async (revisar) => {
		// Variables
		let includes = ["pelicula", "coleccion", "capitulo"];
		// Obtener los links en status 'a revisar'
		let originales = db.links_originales
			.findAll({where: {status_registro_id: revisar}, include: [...includes, "status_registro"]})
			.then((n) => n.map((m) => m.toJSON()));
		// Obtener todas las ediciones
		let ediciones = db.links_edicion.findAll({include: includes}).then((n) => n.map((m) => m.toJSON()));
		// Consolidarlos
		let links = await Promise.all([originales, ediciones]).then(([a, b]) => {
			return [...a, ...b];
		});
		return links;
	},

	// USUARIOS ---------------------------------------------------------
	// Controladora/Usuario/Login
	obtenerUsuarioPorID: (id) => {
		return db.usuarios.findByPk(id, {
			include: ["rol_usuario", "status_registro"],
		});
	},
	// Middleware/Usuario/loginConCookie - Controladora/Usuario/Login
	obtenerUsuarioPorMail: (email) => {
		return db.usuarios
			.findOne({
				where: {email: email},
				include: ["rol_usuario", "status_registro"],
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	// Middleware/Usuario/autorizadoFA
	obtenerAutorizadoFA: (id) => {
		return db.usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
};
