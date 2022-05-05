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
	// PRODUCTOS ------------------------------------------------------------------
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
	// API-Agregar
	obtenerCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({
				where: {coleccion_id: coleccion_id, temporada: temporada},
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},
	// Controlador-Revisar (Producto)
	condicionesProductosARevisar: (entidad, haceUnaHora, revisar, userID) => {
		return db[entidad]
			.findAll({
				where: {
					// Con status de 'revisar'
					status_registro_id: revisar,
					[Op.or]: [
						// Que no esté capturado
						{capturado_en: null},
						// Que la captura haya sido hace más de una hora
						{capturado_en: {[Op.lt]: haceUnaHora}},
						// Que esté capturado por este usuario
						{capturado_por_id: userID},
					],
					// Que esté en condiciones de ser capturado
					creado_en: {[Op.lt]: haceUnaHora},
					// Que esté creado por otro usuario
					creado_por_id: {[Op.ne]: userID},
				},
				include: ["status_registro", "ediciones"],
			})
			.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad: entidad})) : []));
	},
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
	// Controlador-Revisar (RCLV)
	obtenerEdicsAjenasUnProd: async (producto_id, prodID, userID, haceUnaHora) => {
		// Obtener los registros que cumplan ciertas condiciones
		return db.prods_edicion
			.findAll({
				where: {
					// Que pertenezca al producto que nos interesa
					[producto_id]: prodID,
					// Que esté en condiciones de ser capturado
					editado_en: {[Op.lt]: haceUnaHora},
					// Que esté editado por otro usuario
					editado_por_id: {[Op.ne]: userID},
				},
			})
			.then((n) => n.map((m) => m.toJSON()));
	},
	// RCLVs -------------------------------------------------------------
	// Controlador-Revisar
	obtenerRCLVsARevisar: async (haceUnaHora, revisar, userID) => {
		// Obtener los registros del Producto, que cumplan ciertas condiciones
		// Declarar las variables
		let entidades = ["RCLV_personajes", "RCLV_hechos", "RCLV_valores"];
		let resultados = [];
		let indice = 0;
		// Obtener el resultado por entidad
		for (let entidad of entidades) {
			resultados[indice] = db[entidad]
				.findAll({
					where: {
						// Con status de 'revisar'
						status_registro_id: revisar,
						// Que cumpla alguno de los siguientes:
						[Op.or]: [
							// Que no esté capturado
							{capturado_en: null},
							// Que la captura haya sido hace más de una hora
							{capturado_en: {[Op.lt]: haceUnaHora}},
							// Que esté capturado por este usuario
							{capturado_por_id: userID},
						],
						// Que esté en condiciones de ser capturado
						creado_en: {[Op.lt]: haceUnaHora},
						// Que esté creado por otro usuario
						creado_por_id: {[Op.ne]: userID},
					},
					include: ["status_registro", "peliculas", "colecciones", "capitulos"],
				})
				.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad: entidad})) : []));
			indice++;
		}
		resultados = await Promise.all([...resultados]);
		// Consolidar y ordenar los resultados
		let acumulador = [];
		for (let resultado of resultados) if (resultado.length) acumulador.push(...resultado);
		acumulador.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
		// Fin
		return acumulador;
	},

	// LINKS -------------------------------------------------------------
	// Controlador-Revisar
	obtenerLinksARevisar: (haceUnaHora, revisar, userID) => {
		// Obtener todos los registros de links, excepto los que tengan status 'gr_aprobados' con 'cant_productos'
		// Declarar las variables
		let includes = ["pelicula", "coleccion", "capitulo"];
		// Obtener el resultado por entidad
		return db.links_originales
			.findAll({
				where: {
					// Con status de 'revisar'
					status_registro_id: revisar,
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
	// Middleware/RevisarUsuario
	buscaAlgunaCapturaVigenteDelUsuario: async (entidadActual, prodID, userID, haceUnaHora) => {
		// Variables
		let entidades = [
			"peliculas",
			"colecciones",
			"capitulos",
			"RCLV_personajes",
			"RCLV_hechos",
			"RCLV_valores",
		];
		// Crear el objeto literal con las condiciones a cumplirse
		let condiciones = {
			capturado_por_id: userID, // Que esté capturado por este usuario
			capturado_en: {[Op.gt]: haceUnaHora}, // Que esté capturado hace menos de una hora
			captura_activa: 1, // Que la captura sea 'activa'
		};
		// Averiguar si tiene algún producto capturado
		let lectura, entidad;
		for (entidad of entidades) {
			// Distinto al producto actual
			if (entidad == entidadActual) condiciones.id = {[Op.ne]: prodID};
			lectura = await db[entidad]
				.findOne({
					where: condiciones,
					include: "status_registro",
				})
				.then((n) => (n ? n.toJSON() : ""));
			if (condiciones.id) delete condiciones.id;
			if (lectura) break;
		}
		// Fin
		return lectura ? {...lectura, entidad} : lectura;
	},
};
