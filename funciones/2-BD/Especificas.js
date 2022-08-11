"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;
const funciones = require("../3-Procesos/Compartidas");

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

	// RUD - Usuario habilitado
	registrosConStatusARevisar: async (userID, status, entidades) => {
		// Variables
		const creado_id = status.find((n) => n.creado).id;
		const inactivar_id = status.find((n) => n.inactivar).id;
		const recuperar_id = status.find((n) => n.recuperar).id;
		let contarRegistros = 0;
		// Rutina para contar
		let condiciones = {
			[Op.or]: [
				{[Op.and]: [{status_registro_id: creado_id}, {creado_por_id: userID}]},
				{[Op.and]: [{status_registro_id: inactivar_id}, {sugerido_por_id: userID}]},
				{[Op.and]: [{status_registro_id: recuperar_id}, {sugerido_por_id: userID}]},
			],
		};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condiciones});

		// Fin
		return contarRegistros;
	},
	registrosConEdicion: async (userID) => {
		// Variables
		const entidades = ["prods_edicion", "rclv_edicion", "links_edicion"];
		let contarRegistros = 0;
		// Rutina para contar
		let condicion = {editado_por_id: userID};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condicion});

		// Fin
		return contarRegistros;
	},

	// Revisar - Tablero
	tablero_obtenerRegs: (entidad, ahora, status, userID, includes, fechaRef, autor_id) => {
		const haceUnaHora = funciones.nuevoHorario(-1, ahora);
		const haceDosHoras = funciones.nuevoHorario(-2, ahora);
		return db[entidad]
			.findAll({
				where: {
					// Con status según parámetro
					status_registro_id: status,
					// Que cumpla alguno de los siguientes sobre la 'captura':
					[Op.or]: [
						// Que no esté capturado
						{capturado_en: null},
						// Que esté capturado hace más de dos horas
						{capturado_en: {[Op.lt]: haceDosHoras}},
						// Que la captura haya sido por otro usuario y hace más de una hora
						{capturado_por_id: {[Op.ne]: userID}, capturado_en: {[Op.lt]: haceUnaHora}},
						// Que la captura haya sido por otro usuario y esté inactiva
						{capturado_por_id: {[Op.ne]: userID}, captura_activa: {[Op.ne]: 1}},
						// Que esté capturado por este usuario hace menos de una hora
						{capturado_por_id: userID, capturado_en: {[Op.gt]: haceUnaHora}},
					],
					// Que esté propuesto hace más de una hora
					[fechaRef]: {[Op.lt]: haceUnaHora},
					// Que esté propuesto por otro usuario
					[autor_id]: {[Op.ne]: userID},
				},
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad: entidad})) : []));
	},
	tablero_obtenerEdicsDeProds: (userID, includes) => {
		return db.prods_edicion
			.findAll({
				where: {editado_por_id: {[Op.ne]: userID}}, // Que esté creado por otro usuario
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()) : []));
	},
	tablero_obtenerLinks_y_Edics: async (status) => {
		// Variables
		let gr_estables = status.filter((n) => !n.gr_estables).map((n) => n.id);
		let includes = ["pelicula", "coleccion", "capitulo"];
		// Obtener los links en status 'a revisar'
		let originales = db.links
			.findAll({where: {status_registro_id: gr_estables}, include: [...includes, "status_registro"]})
			.then((n) => n.map((m) => m.toJSON()));
		// Obtener todas las ediciones
		let ediciones = db.links_edicion.findAll({include: includes}).then((n) => n.map((m) => m.toJSON()));
		// Consolidarlos
		let links = await Promise.all([originales, ediciones]).then(([a, b]) => [...a, ...b]);
		return links;
	},
	// Revisar - producto/edicion
	obtenerEdicionAjena: async (entidad, producto_id, prodID, userID) => {
		const haceUnaHora = funciones.nuevoHorario(-1);
		// Obtener un registro que cumpla ciertas condiciones
		return db[entidad]
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

	// USUARIOS ---------------------------------------------------------
	// Controladora/Usuario/Login
	obtenerUsuarioPorID: (id) => {
		return db.usuarios
			.findByPk(id, {include: ["rol_usuario", "status_registro"]})
			.then((n) => (n ? n.toJSON() : ""));
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
