"use strict";
// Variables
const comp = require("../1-Procesos/Compartidas");

module.exports = {
	// Varios
	obtieneELC_id: (entidad, objeto) => {
		return db[entidad].findOne({where: objeto}).then((n) => (n ? n.id : ""));
	},
	validaRepetidos: (campos, datos) => {
		// El mismo valor para los campos
		let condicion = {};
		for (let campo of campos) condicion[campo] = datos[campo];

		// Si tiene ID, agrega la condición de que sea distinto
		if (datos.id) condicion.id = {[Op.ne]: datos.id};

		// Fin
		return db[datos.entidad].findOne({where: condicion}).then((n) => (n ? n.id : false));
	},
	// Header
	quickSearchCondics: (palabras, dato, userID) => {
		// Convierte las palabras en un array
		palabras = palabras.split(" ");

		// Crea el objeto literal con los valores a buscar
		let condicTodasLasPalabrasPorCampos = [];

		// Almacena la condición en una matriz
		for (let campo of dato.campos) {
			// Variables
			let condicPalabras = [];

			// Rutina por palabra
			for (let palabra of palabras) {
				// Que encuentre la palabra en el campo
				const condicPalabra = {
					[Op.or]: [
						{[campo]: {[Op.like]: "% " + palabra + "%"}}, // Comienzo de la palabra
						{[campo]: {[Op.like]: palabra + "%"}} // Comienzo del texto
					],
				};
				// Agrega la palabra al conjunto de palabras a buscar
				condicPalabras.push(condicPalabra);
			}

			// Exige que cada palabra del conjunto esté presente
			const condicTodasLasPalabras = {[Op.and]: condicPalabras};
			// Consolida el resultado
			condicTodasLasPalabrasPorCampos.push(condicTodasLasPalabras);
		}

		// Se fija que la condición de palabras se cumpla en alguno de los campos
		const condicPalabras = {[Op.or]: condicTodasLasPalabrasPorCampos};

		// Se fija que el registro esté en statusAprobado, o statusCreado por el usuario
		const condicStatus = {
			[Op.or]: [
				{statusRegistro_id: aprobado_id},
				{[Op.and]: [{statusRegistro_id: [creado_id, creadoAprob_id]}, {creadoPor_id: userID}]},
			],
		};

		// Consolidado
		const condics = {[Op.and]: [condicPalabras, condicStatus]};

		// Fin
		return condics;
	},
	quickSearchRegistros: (condiciones, dato) => {
		// Obtiene los registros
		return db[dato.entidad]
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {
						id: m.id,
						ano: m.anoEstreno,
						nombre: m[dato.campos[0]],
						entidad: dato.entidad,
						familia: dato.familia,
					};
				})
			);
	},

	// CRUD
	obtieneCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({where: {coleccion_id, temporada}, order: [["capitulo", "ASC"]]})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},

	// Revisar - Tablero
	TC: {
		obtieneRegs: ({entidad, status_id, revID, campoFecha, campoRevID, include}) => {
			// Variables
			const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
			const haceDosHoras = comp.fechaHora.nuevoHorario(-2);

			// Condiciones
			let condiciones = {
				// Con status según parámetro
				statusRegistro_id: status_id,
				// Que cumpla alguno de los siguientes sobre la 'captura':
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
			};
			// Que esté propuesto por otro usuario
			if (campoRevID) condiciones[campoRevID] = {[Op.ne]: revID};
			// Que esté propuesto hace más de una hora
			if (campoFecha) condiciones[campoFecha] = {[Op.lt]: haceUnaHora};

			// Resultado
			return db[entidad]
				.findAll({where: condiciones, include})
				.then((n) => n.map((m) => m.toJSON()))
				.then((n) => n.map((m) => ({...m, entidad})));
		},
		obtieneEdicsAjenas: (entidad, revID, include) => {
			// Variables
			// const haceUnaHora = comp.fechaHora.nuevoHorario(-1);

			// Fin
			return db[entidad]
				.findAll({
					where: {
						// Que esté editado desde hace más de 1 hora
						// editadoEn: {[Op.lt]: haceUnaHora},
						// Que sea ajeno
						editadoPor_id: {[Op.ne]: revID},
					},
					include,
				})
				.then((n) => n.map((m) => m.toJSON()));
		},
		obtieneLinksAjenos: async (revID) => {
			// Variables
			const include = ["pelicula", "coleccion", "capitulo"];

			// Obtiene los links en status 'a revisar'
			const condiciones = {
				[Op.and]: [
					{statusRegistro_id: [creado_id, inactivar_id, recuperar_id]},
					{statusSugeridoPor_id: {[Op.ne]: revID}},
				],
			};
			const originales = db.links
				.findAll({where: condiciones, include: [...include, "statusRegistro"]})
				.then((n) => n.map((m) => m.toJSON()));

			// Obtiene todas las ediciones ajenas
			const condicion = {editadoPor_id: {[Op.ne]: revID}};
			const ediciones = db.links_edicion.findAll({where: condicion, include}).then((n) => n.map((m) => m.toJSON()));

			// Los consolida
			const links = await Promise.all([originales, ediciones]).then(([a, b]) => [...a, ...b]);

			// Fin
			return links;
		},
	},
	// Revisar - producto/edicion y rclv/edicion
	obtieneEdicionAjena: (entidadEdic, datos, include) => {
		const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
		const {campo_id, entID, userID} = datos;
		// Obtiene un registro que cumpla ciertas condiciones
		return db[entidadEdic]
			.findOne({
				where: {
					// Que pertenezca a la entidad que nos interesa
					[campo_id]: entID,
					// Que esté editado por otro usuario
					editadoPor_id: {[Op.ne]: userID},
					// Que esté editado desde hace más de 1 hora
					editadoEn: {[Op.lt]: haceUnaHora},
				},
				include,
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	// Revisar - Inactivo
	actualizaLosProdsVinculadosNoAprobados: ({entidad, campo_id, id}) => {
		const condicion = {[campo_id]: id, statusRegistro_id: {[Op.ne]: aprobado_id}};
		const objeto = {[campo_id]: 1};
		return db[entidad].update(objeto, {where: condicion});
	},
	// Revisar diasDelAno
	condicsDDA: ({desde, duracion}) => {
		// Primera Condicion
		let condicion = {id: {[Op.between]: [desde, Math.min(desde + duracion, 366)]}};

		// Si es necesario, segunda condición
		if (desde + duracion > 366)
			condicion = {[Op.or]: [condicion, {id: {[Op.between]: [1, Math.min(desde + duracion - 366)]}}]};

		// Fin
		return condicion;
	},
	activaSolapam: (IDs_solapam) => {
		// Variables
		const datos = {solapamiento: true};
		const condicion = {id: {[Op.or]: IDs_solapam}};

		// Fin
		return db.epocasDelAno.update(datos, {where: condicion});
	},

	// Otros
	MT_obtieneRegs: ({entidad, status_id, userID, campoFecha, include}) => {
		// Variables
		const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
		const haceDosHoras = comp.fechaHora.nuevoHorario(-2);

		// Fin
		return db[entidad]
			.findAll({
				where: {
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
				},
				include,
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					const fechaRefTexto = comp.fechaHora.fechaDiaMes(m[campoFecha]);
					return {...m, entidad, fechaRef: m[campoFecha], fechaRefTexto};
				})
			);
	},
	nombresDeAvatarEnBD: (entidad, statusRegistro_id) => {
		// Variables
		const condiciones = {avatar: {[Op.ne]: null}, avatar: {[Op.notLike]: "%/%"}};
		if (statusRegistro_id) condiciones.statusRegistro_id = statusRegistro_id;

		// Fin
		return db[entidad]
			.findAll({where: condiciones})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {
						imagen: m.avatar,
						nombre: m.nombre ? m.nombre : m.nombreCastellano ? m.nombreCastellano : m.nombreOriginal,
						entidad,
					};
				})
			);
	},

	// USUARIOS ---------------------------------------------------------
	// Middleware/Usuario/loginConCookie - Controlador/Usuario/Login
	obtieneUsuarioPorMail: (email) => {
		return db.usuarios
			.findOne({
				where: {email},
				include: ["rolUsuario", "rolIglesia", "statusRegistro", "sexo"],
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	// Middleware/Usuario/usAutorizFA
	obtieneAutorizFA: (id) => {
		return db.usuarios.findByPk(id).then((n) => n.autorizadoFA);
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
		const entidades = ["prods_edicion", "rclvs_edicion", "links_edicion"];
		let contarRegistros = 0;
		// Rutina para contar
		let condicion = {editadoPor_id: userID};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condicion});

		// Fin
		return contarRegistros;
	},
};
