"use strict";
// Definir variables
const BD_genericas = require("../../funciones/1-BD/Genericas");
const BD_especificas = require("../../funciones/1-BD/Especificas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const variables = require("../../funciones/2-Procesos/Variables");

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
		let ppp = BD_genericas.obtieneTodosPorCondicion("ppp_registros", {usuario_id: userID, opcion_id: yaLaVi.id});

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
		const SE = [...SE_pel, ...SE_col, ...SE_cap];

		// Inactivos (los tres productos)
		const IN = inactivos.filter((n) => !n.statusColeccion_id || n.statusColeccion_id == aprobado_id);

		// Aprobados - Sin calificar
		ppp = ppp.filter((n) => !cal.some((m) => m.entidad == n.entidad && m.entidad_id == n.entidad_id));
		const SC = pelisColes.filter((n) => ppp.find((m) => m.entidad == n.entidad && m.entidad_id == n.id));

		// Aprobados - Sin tema
		const ST = pelisColes.filter((n) => n.tema_id == 1);

		// Aprobados - Sin links
		const SL_Pelis = pelisColes.filter((n) => !n.linksGeneral && n.entidad == "peliculas");

		const SL_CC = aprobados.filter((n) => !n.linksGeneral && n.entidad != "peliculas");

		// Aprobados - Sin links gratuitos
		const SLG = aprobados.filter((m) => m.linksGeneral).filter((m) => !m.linksGratuitos);

		// Aprobados - Sin links en castellano
		const SLC = aprobados.filter((m) => m.linksGeneral).filter((m) => !m.castellano);

		// Fin
		return {IN, SE, SC, ST, SL_Pelis, SL_CC, SLG, SLC};
	},
	obtieneRCLVs: async (userID) => {
		// Variables
		const includeProds = [...variables.entidades.prods, "prods_ediciones"];
		const objetoFijo = {petitFamilias: "rclvs", userID};
		let objeto;

		// Inactivos
		objeto = {...objetoFijo, campoFecha: "statusSugeridoEn", status_id: inactivo_id};
		let IN = obtienePorEntidad(objeto);

		// Aprobados
		objeto = {...objetoFijo, campoFecha: "altaRevisadaEn", status_id: aprobado_id};
		let aprobados = obtienePorEntidad({...objeto, include: includeProds});

		// Await
		[IN, aprobados] = await Promise.all([IN, aprobados]);

		// Sin Avatar
		const SA = aprobados.filter((m) => !m.avatar && m.id > 10);

		// Con solapamiento de fechas
		const SF = aprobados.filter((m) => m.solapam_fechas);

		// Sin producto
		const SP = aprobados.filter(
			(m) => !m.peliculas.length && !m.colecciones.length && !m.capitulos.length && !m.prods_ediciones.length
		);

		// Con fecha móvil
		const dia = new Date().getDate();
		const mes = new Date().getMonth() + 1;
		const ano = new Date().getFullYear();
		const fechaDelAno_id = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes).id;
		const FM = aprobados.filter(
			(n) => n.fechaMovil && (!n.anoFM || n.anoFM < ano || (n.anoFM == ano && n.fechaDelAno_id < fechaDelAno_id))
		);

		// Fin
		return {IN, SA, SF, SP, FM};
	},
	obtieneProds_Links: async (userID) => {
		// Variables
		let include = variables.asocs.prods;
		let ahora = comp.fechaHora.ahora();
		let condicion = {statusRegistro_id: inactivo_id};

		// Obtiene los links 'a revisar'
		let linksInactivos = await BD_genericas.obtieneTodosPorCondicionConInclude("links", condicion, include);

		// Obtiene los productos
		let productos = linksInactivos.length ? obtieneProdsDeLinks(linksInactivos, ahora, userID) : [];

		// Fin
		return productos;
	},
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
let obtieneProdsDeLinks = function (links, ahora, userID) {
	// 1. Variables
	let LI = []; // Inactivos

	// 2. Obtiene los prods
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

	// 3. Ordena
	LI.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef)); // Fecha más reciente

	// 4. Elimina repetidos
	LI = comp.eliminaRepetidos(LI);

	// 5. Deja solamente los prods aprobados
	if (LI.length) LI = LI.filter((n) => n.statusRegistro_id == aprobado_id);

	// 6. Deja solamente los prods sin problemas de captura
	if (LI.length) LI = comp.sinProblemasDeCaptura(LI, userID);

	// Fin
	return {LI};
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
