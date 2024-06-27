"use strict";
// Variables
const comp = require("../2-Procesos/Compartidas");
const variables = require("../2-Procesos/Variables");

module.exports = {
	// CRUD
	obtieneCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({where: {coleccion_id, temporada, statusRegistro_id: activos_ids}, order: [["capitulo", "ASC"]]})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => ({id: m.id, numero: m.capitulo, nombre: m.nombreCastellano ? m.nombreCastellano : m.nombreOriginal}))
			);
	},

	// Revisar - Tablero
	TC: {
		obtieneRegs: ({entidad, status_id, campoFecha, campoRevID, include, revID}) => {
			// Variables
			const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
			const haceDosHoras = comp.fechaHora.nuevoHorario(-2);

			// Condiciones
			let condiciones = {
				// Con status según parámetro
				statusRegistro_id: status_id,
				// Es necesario el [Op.and], porque luego se le agregan condiciones
				[Op.and]: [
					// Que cumpla alguno de los siguientes sobre la 'captura':
					{
						[Op.or]: [
							// Que no esté capturado
							{capturadoEn: null},
							// Que esté capturado hace más de dos horas
							{capturadoEn: {[Op.lt]: haceDosHoras}},
							// Que la captura haya sido por otro usuario y hace más de una hora
							{capturadoPor_id: {[Op.ne]: revID}, capturadoEn: {[Op.lt]: haceUnaHora}},
							// Que la captura haya sido por otro usuario y esté inactiva
							{capturadoPor_id: {[Op.ne]: revID}, capturaActiva: {[Op.ne]: 1}},
							// Que esté capturado por este usuario hace menos de una hora
							{capturadoPor_id: revID, capturadoEn: {[Op.gt]: haceUnaHora}},
						],
					},
				],
			};
			if (campoFecha) {
				// Que esté propuesto por el usuario o hace más de una hora
				if (campoRevID)
					condiciones[Op.and].push({
						[Op.or]: [{[campoRevID]: [revID, usAutom_id]}, {[campoFecha]: {[Op.lt]: haceUnaHora}}],
					});
				// Que esté propuesto hace más de una hora
				else condiciones[campoFecha] = {[Op.lt]: haceUnaHora};
			}
			// Excluye los registros RCLV cuyo ID es <= 10
			if (variables.entidades.rclvs.includes(entidad)) condiciones.id = {[Op.gt]: 10};

			// Resultado
			return db[entidad]
				.findAll({where: condiciones, include})
				.then((n) => n.map((m) => m.toJSON()))
				.then((n) => n.map((m) => ({...m, entidad})));
		},
		obtieneLinks: async () => {
			// Variables
			const include = variables.entidades.asocProds;

			// Obtiene los links en status 'a revisar'
			const condiciones = {
				prodAprob: true,
				statusRegistro_id: {[Op.and]: [{[Op.ne]: aprobado_id}, {[Op.ne]: inactivo_id}]},
			};
			const originales = db.links
				.findAll({where: condiciones, include})
				.then((n) => n.map((m) => m.toJSON()))
				.then((n) => n.sort((a, b) => (a.capitulo_id && !b.capitulo_id ? -1 : !a.capitulo_id && b.capitulo_id ? 1 : 0))) // lotes por capítulos y no capítulos
				.then((n) => n.sort((a, b) => (a.capitulo_id && b.capitulo_id ? a.grupoCol_id - b.grupoCol_id : 0))) // capítulos por colección
				.then((n) => n.sort((a, b) => (a.statusSugeridoEn < b.statusSugeridoEn ? -1 : 1))); // lotes por 'statusSugeridoEn'

			// Obtiene todas las ediciones
			const ediciones = db.linksEdicion.findAll({include}).then((n) => n.map((m) => m.toJSON()));

			// Los consolida
			const links = await Promise.all([originales, ediciones]).then(([originales, ediciones]) => ({originales, ediciones}));

			// Fin
			return links;
		},
	},
	// Revisar - Inactivo
	actualizaLosProdsVinculadosNoAprobados: ({entidad, campo_id, id}) => {
		// Variables
		const condicion = {[campo_id]: id, statusRegistro_id: {[Op.ne]: aprobado_id}};
		const objeto = {[campo_id]: 1};

		// Fin
		return db[entidad].update(objeto, {where: condicion});
	},

	// Otros
	MT_obtieneRegs: async ({petitFamilias, userID, campoFecha, status_id, include, entidad}) => {
		// Variables
		const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
		const haceDosHoras = comp.fechaHora.nuevoHorario(-2);
		const idMin = petitFamilias == "rclvs" ? 10 : 0;
		let includeBD = [...include];
		if (entidad == "colecciones") includeBD.push("csl");

		// Condiciones
		const condiciones = {
			// Con status según parámetro
			statusRegistro_id: status_id,
			// Que cumpla alguno de los siguientes sobre la 'captura':
			[Op.or]: [
				// Que no esté capturado
				{capturadoEn: null},
				// Que esté capturado hace más de dos horas
				{capturadoEn: {[Op.lt]: haceDosHoras}},
				// Que la captura haya sido por otro usuario y hace más de una hora
				{capturadoPor_id: {[Op.ne]: userID}, capturadoEn: {[Op.lt]: haceUnaHora}},
				// Que la captura haya sido por otro usuario y esté inactiva
				{capturadoPor_id: {[Op.ne]: userID}, capturaActiva: {[Op.ne]: 1}},
				// Que esté capturado por este usuario hace menos de una hora
				{capturadoPor_id: userID, capturadoEn: {[Op.gt]: haceUnaHora}},
			],
			// Si es un rclv, que su id > 10
			id: {[Op.gt]: idMin},
		};

		const registros = await baseDeDatos.obtieneTodosPorCondicionConInclude(entidad, condiciones, includeBD)
			// Agrega las fechaRef
			// Actualiza el original con la edición
			.then((n) =>
				n.map((m) => {
					// Variables
					const fechaRef = m[campoFecha];
					const fechaRefTexto = comp.fechaHora.diaMes(fechaRef);

					// Obtiene la edición del usuario
					let edicion = m.ediciones.find((m) => m.editadoPor_id == condiciones.userID);
					delete m.ediciones;

					// Actualiza el original con la edición
					if (edicion) {
						edicion = purgaEdicion(edicion, entidad);
						m = {...m, ...edicion};
					}

					// Fin
					return {...m, entidad, fechaRef, fechaRefTexto};
				})
			);

		// Fin
		return registros;
	},
	nombresDeAvatarEnBD: ({entidad, status_id, campoAvatar}) => {
		// Variables
		campoAvatar = campoAvatar ? campoAvatar : "avatar";
		const condiciones = {[campoAvatar]: {[Op.and]: [{[Op.ne]: null}, {[Op.notLike]: "%/%"}]}};
		if (status_id) condiciones.statusRegistro_id = status_id;

		// Fin
		return db[entidad]
			.findAll({where: condiciones})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {
						imagen: m[campoAvatar],
						nombre: m.nombre ? m.nombre : m.nombreCastellano ? m.nombreCastellano : m.nombreOriginal,
						entidad,
					};
				})
			);
	},
	actualizaElProximoValorDeID: async (entidad) => {
		// Variables
		const config = require(__dirname + "/../../baseDeDatos/config/config.js")[nodeEnv];
		const Sequelize = require("sequelize");
		const sequelize = new Sequelize(config.database, config.username, config.password, config);
		const nuevoValor = await baseDeDatos.maxValor(entidad, "id").then((n) => n + 1);

		// Actualiza el autoincrement
		sequelize.query("ALTER TABLE `" + db[entidad].tableName + "` AUTO_INCREMENT = " + nuevoValor + ";");

		// Fin
		return;
	},

	// USUARIOS ---------------------------------------------------------
	// Middleware/Usuario/loginConCookie - Controlador/Usuario/Login
	obtieneUsuarioPorMail: (email) => {
		return db.usuarios
			.findOne({
				where: {email},
				include: ["rolUsuario", "statusRegistro", "genero"],
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	// Middlewares - Usuario habilitado
	usuario_regsConStatusARevisar: async (userID, entidades) => {
		// Variables
		let contarRegistros = 0;
		// Rutina para contar
		let condiciones = {
			[Op.or]: [
				{[Op.and]: [{statusRegistro_id: creado_id}, {creadoPor_id: userID}]},
				{[Op.and]: [{statusRegistro_id: inactivar_id}, {statusSugeridoPor_id: userID}]},
				{[Op.and]: [{statusRegistro_id: recuperar_id}, {statusSugeridoPor_id: userID}]},
			],
		};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condiciones});

		// Fin
		return contarRegistros;
	},
	usuario_regsConEdicion: async (userID) => {
		// Variables
		const entidades = ["prodsEdicion", "rclvsEdicion", "linksEdicion"];
		let contarRegistros = 0;

		// Rutina para contar
		let condicion = {editadoPor_id: userID};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condicion});

		// Fin
		return contarRegistros;
	},
};
