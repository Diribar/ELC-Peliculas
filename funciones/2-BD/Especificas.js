"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;
const comp = require("../3-Procesos/Compartidas");

module.exports = {
	// Varios
	obtieneELC_id: (entidad, objeto) => {
		return db[entidad].findOne({where: objeto}).then((n) => (n ? n.id : ""));
	},
	validaRepetidos: (campos, datos) => {
		// El mismo valor para los campos
		let objeto = {};
		for (let campo of campos) objeto[campo] = datos[campo];

		// Si tiene ID, agrega la condición de que sea distinto
		if (datos.id) objeto = {...objeto, id: {[Op.ne]: datos.id}};

		// Fin
		return db[datos.entidad].findOne({where: objeto}).then((n) => (n ? n.id : false));
	},
	// Header
	quickSearchCondics: (palabras, dato, userID) => {
		// Convierte las palabras en un array
		palabras = palabras.split(" ");
		// Crea el objeto literal con los valores a buscar
		let condicTodasLasPalabrasPresentesEnCampos = [];
		// Almacena la condición en una matriz
		for (let campo of dato.campos) {
			let condicPalabrasABuscarEnCampo = [];
			for (let palabra of palabras) {
				// Que encuentre la palabra en el campo
				let condicPalabraABuscarEnCampo = {
					[Op.or]: [{[campo]: {[Op.like]: "% " + palabra + "%"}}, {[campo]: {[Op.like]: palabra + "%"}}],
				};
				// Agrega la palabra al conjunto de palabras a buscar
				condicPalabrasABuscarEnCampo.push(condicPalabraABuscarEnCampo);
			}
			// Exige que cada palabra del conjunto esté presente
			let condicTodasLasPalabrasPresentesEnCampo = {[Op.and]: condicPalabrasABuscarEnCampo};
			// Consolida el resultado
			condicTodasLasPalabrasPresentesEnCampos.push(condicTodasLasPalabrasPresentesEnCampo);
		}
		// Se fija que la condición de palabras se cumpla en alguno de los campos
		let condicPalabras = {[Op.or]: condicTodasLasPalabrasPresentesEnCampos};
		// Se fija que el registro esté en statusAprobado, o statusCreado por el usuario
		let statusGrCreado_id = status_registros.filter((n) => n.gr_creado).map((n) => n.id);
		let condicStatus = {
			[Op.or]: [
				{status_registro_id: aprobado_id},
				{
					[Op.and]: [{status_registro_id: statusGrCreado_id}, {[Op.or]: [{creado_por_id: userID}, {creado_por_id: 2}]}],
				},
			],
		};
		// Consolidado
		let condics = {[Op.and]: [condicPalabras, condicStatus]};
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
						ano: m.ano_estreno,
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
	TC_obtieneRegs: ({entidad, status_id, revID, campoFecha, campoRevID, include}) => {
		// Variables
		const haceUnaHora = comp.nuevoHorario(-1);
		const haceDosHoras = comp.nuevoHorario(-2);

		// Condiciones
		let condiciones = {
			// Con status según parámetro
			status_registro_id: status_id,
			// Que cumpla alguno de los siguientes sobre la 'captura':
			[Op.or]: [
				// Que no esté capturado
				{capturado_en: null},
				// Que esté capturado hace más de dos horas
				{capturado_en: {[Op.lt]: haceDosHoras}},
				// Que la captura haya sido por otro usuario y hace más de una hora
				{capturado_por_id: {[Op.ne]: revID}, capturado_en: {[Op.lt]: haceUnaHora}},
				// Que la captura haya sido por otro usuario y esté inactiva
				{capturado_por_id: {[Op.ne]: revID}, captura_activa: {[Op.ne]: 1}},
				// Que esté capturado por este usuario hace menos de una hora
				{capturado_por_id: revID, capturado_en: {[Op.gt]: haceUnaHora}},
			],
		};
		// Que esté propuesto por otro usuario
		if (campoRevID) condiciones[campoRevID] = {[Op.ne]: revID};
		// Que esté propuesto hace más de una hora
		if (campoFecha) condiciones[campoFecha] = {[Op.lt]: haceUnaHora};

		// Resultado
		return db[entidad].findAll({where: condiciones, include}).then((n) => n.map((m) => m.toJSON()));
	},
	TC_obtieneEdicsAptas: (entidad, include) => {
		const haceUnaHora = comp.nuevoHorario(-1);
		// Obtiene las ediciones que cumplan ciertas condiciones
		return (
			db[entidad]
				// Que esté editado desde hace más de 1 hora
				.findAll({where: {editado_en: {[Op.lt]: haceUnaHora}}, include})
				.then((n) => n.map((m) => m.toJSON()))
		);
	},
	TC_obtieneLinksAjenos: async (revID) => {
		// Variables
		let include = ["pelicula", "coleccion", "capitulo"];

		// Obtiene los links en status 'a revisar'
		let condiciones = {
			[Op.or]: [
				{[Op.and]: [{status_registro_id: creado_id}, {creado_por_id: {[Op.ne]: revID}}]},
				{[Op.and]: [{status_registro_id: creado_aprob_id}, {creado_por_id: {[Op.ne]: revID}}]},
				{[Op.and]: [{status_registro_id: inactivar_id}, {sugerido_por_id: {[Op.ne]: revID}}]},
				{[Op.and]: [{status_registro_id: recuperar_id}, {sugerido_por_id: {[Op.ne]: revID}}]},
			],
		};
		let originales = db.links
			.findAll({where: condiciones, include: [...include, "status_registro"]})
			.then((n) => n.map((m) => m.toJSON()));

		// Obtiene todas las ediciones ajenas
		let condicion = {editado_por_id: {[Op.ne]: revID}};
		let ediciones = db.links_edicion.findAll({where: condicion, include}).then((n) => n.map((m) => m.toJSON()));

		// Los consolida
		let links = await Promise.all([originales, ediciones]).then(([a, b]) => [...a, ...b]);
		return links;
	},
	// Revisar - producto/edicion y rclv/edicion
	obtieneEdicAjenaDeUnProd: (entEdicion, datos, include) => {
		const haceUnaHora = comp.nuevoHorario(-1);
		const {campo_id, entID, userID} = datos;
		// Obtiene un registro que cumpla ciertas condiciones
		return db[entEdicion]
			.findOne({
				where: {
					// Que pertenezca a la entidad que nos interesa
					[campo_id]: entID,
					// Que esté editado por otro usuario
					editado_por_id: {[Op.ne]: userID},
					// Que esté editado desde hace más de 1 hora
					editado_en: {[Op.lt]: haceUnaHora},
				},
				include,
			})
			.then((n) => (n ? n.toJSON() : ""));
	},

	// Mantenimiento
	MT_obtieneRegs: ({entidad, status_id, userID, campoFecha, include}) => {
		const haceUnaHora = comp.nuevoHorario(-1);
		const haceDosHoras = comp.nuevoHorario(-2);
		return db[entidad]
			.findAll({
				where: {
					// Con status según parámetro
					status_registro_id: status_id,
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
				},
				include,
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => (m = {...m, entidad, fechaRef: m[campoFecha], fechaRefTexto: comp.fechaDiaMes(m[campoFecha])}))
			);
	},
	linksVencidos: () => {
		// Obtiene la fecha de corte
		const vidaUtil = 6 * unMes;
		const fechaCorte = new Date(comp.ahora().getTime() - vidaUtil);

		// Obtiene la condición
		let condicion = {
			sugerido_en: {[Op.lt]: fechaCorte},
			status_registro_id: aprobado_id,
		};

		// Fin
		return condicion;
	},
	nombresDeAvatarEnBD: (entidad) => {
		const condiciones = {avatar: {[Op.ne]: null}, avatar: {[Op.notLike]: "%/%"}};
		return db[entidad]
			.findAll({where: condiciones})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.avatar));
	},

	// USUARIOS ---------------------------------------------------------
	// Controlador/Usuario/Login
	obtieneUsuarioDistintoIdMasFiltros: (userID, filtros) => {
		return db.usuarios.findAll({where: {...filtros, id: {[Op.ne]: userID}}}).then((n) => n.map((m) => m.toJSON()));
	},
	// Middleware/Usuario/loginConCookie - Controlador/Usuario/Login
	obtieneUsuarioPorMail: (email) => {
		return db.usuarios
			.findOne({
				where: {email},
				include: ["rol_usuario", "rol_iglesia", "status_registro", "sexo"],
			})
			.then((n) => (n ? n.toJSON() : ""));
	},
	// Middleware/Usuario/usAutorizFA
	obtieneAutorizFA: (id) => {
		return db.usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
	// Middlewares - Usuario habilitado
	usuario_regsConStatusARevisar: async (userID, entidades) => {
		// Variables
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
	usuario_regsConEdicion: async (userID) => {
		// Variables
		const entidades = ["prods_edicion", "rclvs_edicion", "links_edicion"];
		let contarRegistros = 0;
		// Rutina para contar
		let condicion = {editado_por_id: userID};
		for (let entidad of entidades) contarRegistros += await db[entidad].count({where: condicion});

		// Fin
		return contarRegistros;
	},
};
