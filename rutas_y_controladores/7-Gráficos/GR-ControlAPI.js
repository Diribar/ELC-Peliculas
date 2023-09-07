"use strict";
// Variables
const procsRutinas = require("../../funciones/3-Rutinas/RT-Control");
const BD_genericas = require("../../funciones/1-BD/Genericas");
const variables = require("../../funciones/2-Procesos/Variables");

module.exports = {
	cantPelisPorCfcVpc: async (req, res) => {
		// Variables
		let cfc = {};
		let vpc = {};
		let productos = [];

		// Obtiene los productos
		for (const entidad of ["peliculas", "colecciones"])
			productos.push(BD_genericas.obtieneTodosPorCondicionConInclude(entidad, {statusRegistro_id: aprobado_id}, "publico"));
		productos = await Promise.all(productos).then(([a, b]) => [...a, ...b]);

		// Cuenta las cantidades
		let prods = {cfc: productos.filter((n) => n.cfc), vpc: productos.filter((n) => !n.cfc)};
		for (const aptoPara of ["mayores", "familia", "menores"]) {
			cfc[aptoPara] = prods.cfc.filter((n) => n.publico && n.publico.codigo == aptoPara).length;
			vpc[aptoPara] = prods.vpc.filter((n) => n.publico && n.publico.codigo == aptoPara).length;
		}

		// Fin
		return res.json({cfc, vpc});
	},
	vencimLinks: async (req, res) => {
		// Variables
		if (!fechaPrimerLunesDelAno) procsRutinas.FechaPrimerLunesDelAno(); // Para asegurarse de tener la 'fechaPrimerLunesDelAno'
		const semanaActual = parseInt((Date.now() - fechaPrimerLunesDelAno) / unDia / 7);
		const prodAprob = true;
		const linksSemanales = {};

		// Obtiene todos los links en status 'creadoAprob' y 'aprobados'
		let creadoAprobs = BD_genericas.obtieneTodosPorCondicion("links", {statusRegistro_id: creadoAprob_id, prodAprob});
		let aprobados = BD_genericas.obtieneTodosPorCondicion("links", {statusRegistro_id: aprobado_id, prodAprob});
		[creadoAprobs, aprobados] = await Promise.all([creadoAprobs, aprobados]);

		// Obtiene la cantidad de 'creadoAprobs'
		linksSemanales[semanaActual] = creadoAprobs.length;

		// Obtiene la cantidad por semana de los 'aprobados'
		for (let link of aprobados) {
			const diaVencim = link.statusSugeridoEn.getTime() + (link.yaTuvoPrimRev ? vidaUtilLinks : vidaPrimRevision);
			const semanaVencim = parseInt((diaVencim - fechaPrimerLunesDelAno) / unDia / 7) + 1;
			linksSemanales[semanaVencim] ? linksSemanales[semanaVencim]++ : (linksSemanales[semanaVencim] = 1);
		}

		// Fin
		return res.json(linksSemanales);
	},
	cantLinksPorProv: async (req, res) => {
		// Obtiene los provs
		let provs = await BD_genericas.obtieneTodosConInclude("linksProvs", "links");

		// Cuenta la cantidad de links
		provs = provs.map((m) => {
			m.links = m.links.filter((p) => aprobados_ids.includes(p.statusRegistro_id)).length;
			return m;
		});

		// Ordena de mayor a menor, por cantidad de links
		provs.sort((a, b) => (a.links > b.links ? -1 : 1));

		// Fin
		return res.json(provs);
	},
};
