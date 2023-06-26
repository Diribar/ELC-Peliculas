"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = {
	obtieneProds: async (userID) => {
		// Variables
		const entidades = variables.entidades.prods;

		// PRODUCTOS
		// Inactivos
		let inactivos = obtienePorEntidad({entidades, campoFecha: "statusSugeridoEn", status_id: inactivo_id, userID});

		// Aprobados
		let aprobados = obtienePorEntidad({entidades, campoFecha: "altaTermEn", status_id: aprobado_id, userID});

		// Sin Edición (en status creadoAprob)
		let SE_pel = obtieneSinEdicion("peliculas");
		let SE_col = obtieneSinEdicion("colecciones");
		let SE_cap = obtieneSinEdicion("capitulos");

		// Espera las lecturas
		[inactivos, aprobados, SE_pel, SE_col, SE_cap] = await Promise.all([inactivos, aprobados, SE_pel, SE_col, SE_cap]);
		const pelisColes = aprobados.filter((m) => m.entidad != "capitulos");
		const SE = [...SE_pel, ...SE_col, ...SE_cap];

		// Inactivos (los tres productos)
		const IN = inactivos.filter((n) => !n.statusColeccion_id || n.statusColeccion_id != inactivo_id);

		// Aprobados - Sin calificar
		const SC = pelisColes.filter((m) => !m.calificacion);

		// Aprobados - Sin tema
		const ST = pelisColes.filter((n) => n.tema_id == 1);

		// Aprobados - Sin links
		const SL = aprobados.filter((m) => !m.linksGeneral);

		// Aprobados - Sin links gratuitos
		const SLG = aprobados.filter((m) => m.linksGeneral).filter((m) => !m.linksGratuitos);

		// Aprobados - Sin links en castellano
		const SLC = aprobados.filter((m) => m.linksGeneral).filter((m) => !m.castellano);

		// Fin
		return {IN, SE, SC, ST, SL, SLG, SLC};
	},
	obtieneRCLVs: async (userID) => {
		// Variables
		const entidades = variables.entidades.rclvs;
		const includeProds = [...variables.entidades.prods, "prods_ediciones"];
		let objeto;
		let IN = [];
		let INP = [];

		// Inactivos
		objeto = {entidades, campoFecha: "statusSugeridoEn", status_id: inactivo_id, include: includeProds};
		let inactivos = obtienePorEntidad({...objeto, userID});

		// Aprobados
		let campoFecha = "altaRevisadaEn";
		let aprobados = obtienePorEntidad({entidades, campoFecha, status_id: aprobado_id, userID});

		// Await
		[inactivos, aprobados] = await Promise.all([inactivos, aprobados]);

		// Sin Avatar
		const SA = aprobados.filter((m) => !m.avatar && m.id > 10);

		// Con solapamiento de fechas
		const SF = aprobados.filter((m) => m.solapam_fechas);

		// Con fecha móvil
		const FM = aprobados.filter((m) => m.fechaMovil);

		// 2.4. Con epoca igual a 'pst' y sin ano
		const PST = aprobados.filter((m) => m.epoca_id == "pst" && !m.ano);

		// Fin
		return {INP, IN, SA, SF, FM, PST};
	},
	obtieneProds_Links: async (userID) => {
		// Variables
		let include = variables.asociaciones.prods;
		let ahora = comp.fechaHora.ahora();
		let condicion = {statusRegistro_id: inactivo_id};

		// Obtiene los links 'a revisar'
		let links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", condicion, include);

		// Obtiene los productos
		let productos = links.length ? obtieneProdsDeLinks(links, ahora, userID) : [];

		// Fin
		return productos;
	},
};

let obtienePorEntidad = async ({entidades, campoFecha, status_id, userID, include}) => {
	// Variables
	include ? include.push("ediciones") : (include = "ediciones");
	const campos = {status_id, userID, include, campoFecha, include};
	let resultados1 = [];
	let resultados2 = [];

	// Rutina
	for (let entidad of entidades)
		resultados1.push(
			BD_especificas.MT_obtieneRegs({entidad, ...campos}).then((n) =>
				n.map((m) => {
					// Obtiene la edición del usuario
					let edicion = m.ediciones.length ? m.ediciones.find((m) => m.editadoPor_id == userID) : null;
					delete m.ediciones;

					// Miminiza la edicion y actualiza el original con la edición
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
	links.map((link) => {
		// Variables
		let entidad = comp.obtieneDesdeEdicion.entidadProd(link);
		let asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
		let campoFecha = "statusSugeridoEn";
		let fechaRef = link[campoFecha];
		let fechaRefTexto = comp.fechaHora.fechaDiaMes(link[campoFecha]);

		LI.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
	});

	// 3. Ordena por la fecha más antigua
	LI.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));

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
