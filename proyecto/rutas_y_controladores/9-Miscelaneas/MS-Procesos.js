"use strict";

module.exports = {
	obtieneProds: async (userID) => {
		// Variables
		const petitFamilias = "prods";
		let objeto = {petitFamilias, userID};

		// Productos Inactivos
		objeto = {...objeto, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
		let inactivos = obtienePorEntidad(objeto);

		// Productos Aprobados
		objeto = {...objeto, campoFecha: "altaTermEn", status_id: aprobado_id};
		let aprobados = obtienePorEntidad(objeto);

		// Productos Sin Edición (en status creadoAprob)
		let SE_pel = obtieneSinEdicion("peliculas");
		let SE_col = obtieneSinEdicion("colecciones");
		let SE_cap = obtieneSinEdicion("capitulos");

		// Calificaciones de productos y Preferencia por productos
		let cal = BD_genericas.obtieneTodosPorCondicion("cal_registros", {usuario_id: userID});
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
			SE: [...SE_pel, ...SE_col, ...SE_cap],
			IN: inactivos.filter((n) => !n.statusColeccion_id || n.statusColeccion_id == aprobado_id), // Inactivos (los tres productos)
			SC: pelisColes.filter((n) => ppp.find((m) => m.entidad == n.entidad && m.entidad_id == n.id)), // Aprobados - Sin calificar
			ST: pelisColes.filter((n) => n.tema_id == 1), // Aprobados - Sin tema
			SL_Pelis: pelisColes.filter((n) => !n.linksGral && n.entidad == "peliculas"), // Aprobados - Sin links
			SL_Caps: aprobados.filter((n) => !n.linksGral && n.entidad == "capitulos"), // Aprobados - Sin links
			SL_HD: pelisColes.filter((n) => n.linksGral && !n.linksHD), // Aprobados - Sin links
			SLG: aprobados.filter((m) => m.linksGral).filter((m) => !m.linksGratis), // Aprobados - Sin links gratuitos
			SLC: aprobados.filter((m) => m.linksGral).filter((m) => !m.linksCast), // Aprobados - Sin links en castellano
		};

		// Fin
		return resultados;
	},
	obtieneRCLVs: async (userID) => {
		// Variables
		const objetoFijo = {petitFamilias: "rclvs", userID};
		const include = [...variables.entidades.prods, "prodsEdiciones", "fechaDelAno"];
		let objeto;

		// Inactivos
		objeto = {...objetoFijo, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
		let IN = obtienePorEntidad(objeto);

		// Aprobados
		objeto = {...objetoFijo, campoFecha: "altaRevisadaEn", status_id: aprobado_id};
		let aprobados = obtienePorEntidad({...objeto, include});

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

		// Con fecha móvil
		const FM = aprobados
			.filter((n) => n.fechaMovil) // con fecha móvil
			.filter((n) => !n.anoFM || n.anoFM < anoHoy || (n.anoFM == anoHoy && n.fechaDelAno_id < fechaDelAnoHoy_id)) // sin año, año menor al actual, de este año con fecha menor
			.map((n) => ({...n, fechaRef: n.fechaDelAno_id, fechaRefTexto: n.fechaDelAno.nombre}))
			.sort((a, b) => a.fechaRef - b.fechaRef);

		// Fin
		return {IN, SA, SF, SP, FM};
	},
	obtieneLinksInactivos: async (userID) => {
		// Variables
		let include = variables.asocs.prods;
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
		let entidad = comp.obtieneDesdeEdicion.entidadProd(link);
		let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
		let campoFecha = "statusSugeridoEn";
		let fechaRef = link[campoFecha];
		let fechaRefTexto = comp.fechaHora.fechaDiaMes(link[campoFecha]);

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
let obtienePorEntidad = async ({...objeto}) => {
	// Variables
	const petitFamilias = objeto.petitFamilias;
	const entidades = variables.entidades[petitFamilias];
	objeto.include ? objeto.include.push("ediciones") : (objeto.include = "ediciones");

	let resultados1 = [];
	let resultados2 = [];

	// Rutina
	for (let entidad of entidades)
		resultados1.push(
			BD_especificas.MT_obtieneRegs({entidad, ...objeto}).then((n) =>
				n.map((m) => {
					// Obtiene la edición del usuario
					let edicion = m.ediciones.find((m) => m.editadoPor_id == objeto.userID);
					delete m.ediciones;

					// Actualiza el original con la edición
					if (edicion) {
						edicion = purgaEdicion(edicion, entidad);
						m = {...m, ...edicion};
					}

					// Fin
					return m;
				})
			)
		);

	// Espera hasta tener todos los resultados
	await Promise.all(resultados1).then((resultados) => resultados.map((n) => resultados2.push(...n)));

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
					fechaRefTexto: comp.fechaHora.fechaDiaMes(m.statusSugeridoEn),
				};

				// Fin
				return datos;
			})
		);
};
