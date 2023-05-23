"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const validaPR = require("../2.1-Prod-RUD/PR-FN-Validar");

module.exports = {
	obtieneProds: async (userID) => {
		// Variables
		let entidades = variables.entidades.prods;

		// PRODUCTOS
		// Inactivos
		let inactivos = obtienePorEntidad({entidades, campoFecha: "sugerido_en", status_id: inactivo_id, userID});

		// Aprobados
		let aprobados = obtienePorEntidad({entidades, campoFecha: "alta_term_en", status_id: aprobado_id, userID});

		// Espera las lecturas
		[inactivos, aprobados] = await Promise.all([inactivos, aprobados]);
		const pelisColes = aprobados.filter((m) => m.entidad != "capitulos");
		const pelisCaps = aprobados.filter((m) => m.entidad != "colecciones");

		// Inactivos (peliculas y colecciones)
		const IN = inactivos.filter((n) => n.entidad != "capitulos");

		// Aprobados - Sin calificar
		let SC = pelisColes.filter((m) => !m.calificacion);

		// Aprobados - Sin tema
		let ST = pelisColes.filter((n) => n.tema_id == 1);

		// Aprobados - Sin links
		let SL = aprobados.filter((m) => !m.links_general);
		// Aprobados - Sin links gratuitos
		let SLG = aprobados.filter((m) => m.links_general).filter((m) => !m.links_gratuitos);
		// Aprobados - Sin links en castellano
		let SLC = aprobados.filter((m) => m.links_general).filter((m) => !m.castellano);

		// Fin
		return {IN, SC, SL, SLG, SLC, ST};
	},
	obtieneRCLVs: async (userID) => {
		// Variables
		const entidades = variables.entidades.rclvs;
		const includeProds = [...variables.entidades.prods, "prods_ediciones"];
		let include, objeto;
		let IN = [];
		let INP = [];

		// 1. RCLVs inactivos
		objeto = {entidades, campoFecha: "sugerido_en", status_id: inactivo_id, include: includeProds};
		let inactivos = obtienePorEntidad({...objeto, userID});

		// 2. Aprobados
		include = ["ediciones"];
		let campoFecha = "alta_revisada_en";
		let aprobados = obtienePorEntidad({entidades, campoFecha, status_id: aprobado_id, userID: 1, include});

		// Await
		[inactivos, aprobados] = await Promise.all([inactivos, aprobados]);

		// Inactivos c/producto
		inactivos.map((n) => {
			n.peliculas.length || n.colecciones.length || n.capitulos.length || n.prods_ediciones.length
				? INP.push(n)
				: IN.push(n);
		});

		// 2.1. Sin Avatar
		const SA = aprobados.filter((m) => !m.avatar && m.id > 10 && !m.ediciones.length);

		// 2.2. Con solapamiento de fechas
		const SF = aprobados.filter((m) => m.solapam_fechas);

		// 2.3. Con fecha móvil
		const FM = aprobados.filter((m) => m.fecha_movil);

		// 2.4. Con epoca igual a 'pst' y sin ano
		const PST = aprobados.filter((m) => m.epoca_id == "pst" && !m.ano);

		// Fin
		return {INP, IN, SA, SF, FM, PST};
	},
	obtieneProds_Links: async (userID) => {
		// Obtiene todos los productos aprobados, con algún link ajeno en status provisorio

		// Variables
		let include = ["pelicula", "coleccion", "capitulo"];
		let ahora = comp.fechaHora.ahora();
		let condicion = {status_registro_id: inactivo_id};

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
	let campos = {status_id, userID, include, campoFecha, include};
	let resultados1 = [];
	let resultados2 = [];

	// Rutina
	for (let entidad of entidades) resultados1.push(BD_especificas.MT_obtieneRegs({entidad, ...campos}));

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
		let campoFecha = "sugerido_en";
		let fechaRef = link[campoFecha];
		let fechaRefTexto = comp.fechaHora.fechaDiaMes(link[campoFecha]);

		LI.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
	});

	// 3. Ordena por la fecha más antigua
	LI.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef));

	// 4. Elimina repetidos
	LI = comp.eliminaRepetidos(LI);

	// 5. Deja solamente los prods aprobados
	if (LI.length) LI = LI.filter((n) => n.status_registro_id == aprobado_id);

	// 6. Deja solamente los prods sin problemas de captura
	if (LI.length) LI = comp.sinProblemasDeCaptura(LI, userID, ahora);

	// Fin
	return {LI};
};
