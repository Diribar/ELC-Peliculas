"use strict";

module.exports = {
	obtieneProds: async (userID) => {
		// Variables
		const petitFamilias = "prods";
		let condiciones = {petitFamilias, userID};

		// Productos Inactivos
		condiciones = {...condiciones, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
		let inactivos = obtienePorEntidad(condiciones);

		// Productos Aprobados
		condiciones = {...condiciones, campoFecha: "statusSugeridoEn", status_id: aprobado_id};
		let aprobados = obtienePorEntidad(condiciones);

		// Productos Sin Edición (en status creadoAprob)
		let SE_pel = obtieneSinEdicion("peliculas");
		let SE_col = obtieneSinEdicion("colecciones");
		let SE_cap = obtieneSinEdicion("capitulos");

		// Calificaciones de productos y Preferencia por productos
		let cal = BD_genericas.obtieneTodosPorCondicion("calRegistros", {usuario_id: userID});
		let ppp = BD_genericas.obtieneTodosPorCondicion("pppRegistros", {usuario_id: userID, opcion_id: yaLaVi.id});

		// Espera las lecturas
		[inactivos, aprobados, SE_pel, SE_col, SE_cap, cal, ppp] = await Promise.all([
			inactivos,
			aprobados,
			SE_pel,
			SE_col,
			SE_cap,
			cal,
			ppp,
		]);
		const pelisColes = aprobados.filter((m) => m.entidad != "capitulos");
		ppp = ppp.filter((n) => !cal.some((m) => m.entidad == n.entidad && m.entidad_id == n.entidad_id));

		// Resultados
		let resultados = {
			// Productos
			SE: [...SE_pel, ...SE_col, ...SE_cap], // sin edición
			IN: inactivos.filter((n) => !n.statusColeccion_id || n.statusColeccion_id == aprobado_id), // películas y colecciones inactivas, y capítulos con su colección aprobada
			SC: pelisColes.filter((n) => ppp.find((m) => m.entidad == n.entidad && m.entidad_id == n.id)), // Aprobados - Sin calificar
			ST: pelisColes.filter((n) => n.tema_id == 1), // Aprobados - Sin tema

			// Links - sin links
			SL_pelis: pelisColes.filter((n) => !n.linksGral && n.entidad == "peliculas"), // películas
			SL_caps: aprobados.filter((n) => !n.linksGral && n.entidad == "capitulos"), // capítulos
			SL_HD: aprobados.filter((n) => n.linksGral && !n.HD_Gral), // con Links pero sin HD

			// Links Basicos
			SLG_basico: aprobados.filter((n) => n.linksGral && !n.HD_Gral && !n.linksGratis), // sin links gratuitos
			SLC_basico: aprobados.filter((n) => n.linksGral && !n.HD_Gral && !n.linksCast && !n.linksSubt), // sin links en castellano

			// Links HD
			SLG_HD: aprobados.filter((n) => n.HD_Gral && !n.HD_Gratis), // sin HD gratuitos
			SLC_HD: aprobados.filter((n) => n.HD_Gral && !n.HD_Cast && !n.HD_Subt), // sin HD en castellano
		};

		// Fin
		return resultados;
	},
	obtieneRCLVs: async (userID) => {
		// Variables
		const objetoFijo = {petitFamilias: "rclvs", userID};
		const include = [...variables.entidades.prods, "prodsEdiciones", "fechaDelAno"];
		let condiciones;

		// Inactivos
		condiciones = {...objetoFijo, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
		let IN = obtienePorEntidad(condiciones);

		// Aprobados
		condiciones = {...objetoFijo, campoFecha: "statusSugeridoEn", status_id: aprobado_id};
		let aprobados = obtienePorEntidad({...condiciones, include});

		// Await
		[IN, aprobados] = await Promise.all([IN, aprobados]);

		// Sin Avatar
		const SA = aprobados.filter((m) => !m.avatar && m.id > 10);

		// Con solapamiento de fechas
		const SF = aprobados.filter((m) => m.solapam_fechas);

		// Sin producto
		const SP = aprobados.filter(
			(m) => !m.peliculas.length && !m.colecciones.length && !m.capitulos.length && !m.prodsEdiciones.length
		);

		// Fin
		return {IN, SA, SF, SP};
	},
	obtieneLinksInactivos: async (userID) => {
		// Variables
		let include = variables.entidades.asocProds;
		let condicion = {statusRegistro_id: inactivo_id};

		// Obtiene los links 'a revisar'
		let linksInactivos = await BD_genericas.obtieneTodosPorCondicionConInclude("links", condicion, include);

		// Obtiene los productos
		let productos = linksInactivos.length ? obtieneProdsDeLinks(linksInactivos, userID) : {LI: []};

		// Fin
		return productos;
	},
};

let obtieneProdsDeLinks = function (links, userID) {
	// Variables
	let LI = [];

	// Obtiene los prods
	for (let link of links) {
		// Variables
		let entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
		let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
		let fechaRef = link.statusSugeridoEn;
		let fechaRefTexto = comp.fechaHora.diaMes(link.statusSugeridoEn);

		// Agrega los registros
		LI.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
	}

	if (LI.length > 1) {
		// Ordena
		LI.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef)); // Fecha más reciente

		// Elimina repetidos
		LI = comp.eliminaRepetidos(LI);
	}

	// Deja solamente los prods aprobados
	if (LI.length) LI = LI.filter((n) => aprobados_ids.includes(n.statusRegistro_id));

	// Deja solamente los prods sin problemas de captura
	if (LI.length) LI = comp.sinProblemasDeCaptura(LI, userID);

	// Fin
	return {LI};
};
let obtienePorEntidad = async ({...condiciones}) => {
	// Variables
	const {petitFamilias} = condiciones;
	const entidades = variables.entidades[petitFamilias];
	condiciones.include ? condiciones.include.push("ediciones") : (condiciones.include = "ediciones");

	let resultados1 = [];
	let resultados2 = [];

	// Rutina
	for (let entidad of entidades) resultados1.push(BD_especificas.MT_obtieneRegs({entidad, ...condiciones}));

	// Espera hasta tener todos los resultados
	await Promise.all(resultados1).then((n) => n.map((m) => resultados2.push(...m)));

	// Ordena
	resultados2.sort((a, b) => b.fechaRef - a.fechaRef);

	// Fin
	return resultados2;
};
let purgaEdicion = (edicion, entidad) => {
	// Quita de edición los campos 'null'
	for (let campo in edicion) if (edicion[campo] === null) delete edicion[campo];

	// Quita de edición los campos que no se comparan
	const familias = comp.obtieneDesdeEntidad.familias(entidad);
	const campos = variables.camposRevisar[familias].map((n) => n.nombre);
	for (let campo in edicion) if (!campos.includes(campo)) delete edicion[campo];

	// Fin
	return edicion;
};
let obtieneSinEdicion = (entidad) => {
	// Variables
	const condiciones = {statusRegistro_id: creadoAprob_id};
	if (entidad == "capitulos") condiciones.statusColeccion_id = aprobado_id;

	// Obtiene la información
	return BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condiciones, "ediciones")
		.then((n) => n.filter((m) => !m.ediciones.length))
		.then((n) =>
			n.map((m) => {
				// Variables
				const datos = {
					...m,
					entidad,
					fechaRef: m.statusSugeridoEn,
					fechaRefTexto: comp.fechaHora.diaMes(m.statusSugeridoEn),
				};

				// Fin
				return datos;
			})
		);
};
