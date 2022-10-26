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
	quickSearchCondics: (palabras, dato, userID) => {
		// Convierte las palabras en un array
		palabras = palabras.split(" ");
		// Crea el objeto literal con los valores a buscar
		let valoresOR = [];
		// Almacena la condición en una matriz
		for (let campo of dato.campos) {
			let condicionesDeCampo = [];
			for (let palabra of palabras) {
				// Que encuentre la palabra en el campo
				let condicionDePalabra = {
					[Op.or]: [
						{[campo]: {[Op.like]: "% " + palabra + "%"}},
						{[campo]: {[Op.like]: palabra + "%"}},
					],
				};
				// Se fija que la palabra esté en el campo
				condicionesDeCampo.push(condicionDePalabra);
			}
			// Condición: se fija que cada palabra esté en el campo
			let resumenDeCampo = {[Op.and]: condicionesDeCampo};
			// Consolida el resultado
			valoresOR.push(resumenDeCampo);
		}
		// Se fija que la condición de palabras se cumpla en alguno de los campos
		let condicionPalabra = {[Op.or]: valoresOR};
		// Se fija que el registro esté en statusAprobado, o statusCreado por el usuario
		let stGrCreadoID = status_registro.filter((n) => n.gr_creado).map((n) => n.id);
		let stAprobadoID = status_registro.find((n) => n.aprobado).id;
		let condicionStatus = {
			[Op.or]: [
				{status_registro_id: stAprobadoID},
				{[Op.and]: [{status_registro_id: stGrCreadoID}, {creado_por_id: userID}]},
			],
		};
		// Consolidado
		let condiciones = {[Op.and]: [condicionPalabra, condicionStatus]};
		// Fin
		return condiciones;
	},
	quickSearchRegistros: async (condiciones, dato) => {
		// Variables
		let hallazgos = [];
		let resultado = [];
		// Obtiene los registros
		let registros = await db[dato.entidad]
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {
						id: m.id,
						ano: m.ano_estreno,
						nombre: m[dato.campos[0]],
						entidad:dato.entidad,
						familia: dato.familia,
					};
				})
			);
		// Enviar el resultado
		return registros;
	},

	// CRUD
	obtenerCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({
				where: {coleccion_id: coleccion_id, temporada: temporada},
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},

	// RUD - Usuario habilitado
	registrosConStatusARevisar: async (userID, entidades) => {
		// Variables
		const creado_id = status_registro.find((n) => n.creado).id;
		const inactivar_id = status_registro.find((n) => n.inactivar).id;
		const recuperar_id = status_registro.find((n) => n.recuperar).id;
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
		const entidades = ["prods_edicion", "rclvs_edicion", "links_edicion"];
		let contarRegistros = 0;
		// Rutina para contar
		let condicion = {editado_por_id: userID};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condicion});

		// Fin
		return contarRegistros;
	},

	// Revisar - Tablero
	TC_obtenerRegs: (entidad, ahora, status, userID, includes, fechaRef, autor_id) => {
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
	TC_obtenerEdicsAjenas: (entidad, userID, includes) => {
		return db[entidad]
			.findAll({
				where: {editado_por_id: {[Op.ne]: userID}}, // Que esté creada por otro usuario
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()) : []));
	},
	TC_obtenerLinks_y_Edics: async () => {
		// Variables
		let gr_estables = status_registro.filter((n) => !n.gr_estables).map((n) => n.id);
		let includes = ["pelicula", "coleccion", "capitulo"];
		// Obtiene los links en status 'a revisar'
		let originales = db.links
			.findAll({where: {status_registro_id: gr_estables}, include: [...includes, "status_registro"]})
			.then((n) => n.map((m) => m.toJSON()));
		// Obtiene todas las ediciones
		let ediciones = db.links_edicion.findAll({include: includes}).then((n) => n.map((m) => m.toJSON()));
		// Consolidarlos
		let links = await Promise.all([originales, ediciones]).then(([a, b]) => [...a, ...b]);
		return links;
	},
	// Revisar - producto/edicion y rclv/edicion
	obtenerEdicionAjena: async (entidad, entidad_id, entID, userID) => {
		const haceUnaHora = funciones.nuevoHorario(-1);
		// Obtiene un registro que cumpla ciertas condiciones
		return db[entidad]
			.findOne({
				where: {
					// Que pertenezca al producto que nos interesa
					[entidad_id]: entID,
					// Que esté editado por otro usuario
					editado_por_id: {[Op.ne]: userID},
				},
			})
			.then((n) => (n ? n.toJSON() : ""));
	},

	// USUARIOS ---------------------------------------------------------
	// Controladora/Usuario/Login
	obtenerUsuarioPorID: (id) => {
		return db.usuarios
			.findByPk(id, {include: ["rol_usuario", "status_registro"]})
			.then((n) => (n ? n.toJSON() : ""));
	},
	obtenerUsuarioDistintoIdMasFiltros: (userID, filtros) => {
		return db.usuarios
			.findAll({
				where: {
					// Filtros
					...filtros,
					// Otro usuario
					id: {[Op.ne]: userID},
				},
			})
			.then((n) => n.map((m) => m.toJSON()));
	},
	// Middleware/Usuario/loginConCookie - Controladora/Usuario/Login
	obtenerUsuarioPorMail: (email) => {
		return db.usuarios
			.findOne({
				where: {email: email},
				include: ["rol_usuario", "rol_iglesia", "status_registro", "sexo"],
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	// Middleware/Usuario/autorizadoFA
	obtenerAutorizadoFA: (id) => {
		return db.usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
};
