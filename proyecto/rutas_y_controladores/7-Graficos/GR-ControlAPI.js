"use strict";
// Variables
const procsRutinas = require("../../funciones/3-Rutinas/RT-Control");

module.exports = {
	pelisPublico: async (req, res) => {
		// Variables
		const publicos = ["mayores", "familia", "menores"];
		let cfc = {};
		let vpc = {};
		let productos = [];

		// Obtiene los productos
		for (const entidad of ["peliculas", "colecciones"])
			productos.push(BD_genericas.obtieneTodosPorCondicionConInclude(entidad, {statusRegistro_id: aprobado_id}, "publico"));
		productos = await Promise.all(productos).then(([a, b]) => [...a, ...b]);

		// Cuenta las cantidades
		let prods = {cfc: productos.filter((n) => n.cfc), vpc: productos.filter((n) => !n.cfc)};
		for (const publico of publicos) {
			cfc[publico] = prods.cfc.filter((n) => n.publico && n.publico.grupo == publico).length;
			vpc[publico] = prods.vpc.filter((n) => n.publico && n.publico.grupo == publico).length;
		}

		// Fin
		return res.json([{cfc, vpc}, publicos]);
	},
	pelisCfcVpc: async (req, res) => {
		// Variables
		let productos = [];

		// Obtiene los productos
		for (const entidad of ["peliculas", "colecciones"])
			productos.push(BD_genericas.obtieneTodosConInclude(entidad, "publico"));
		productos = await Promise.all(productos).then(([a, b]) => [...a, ...b]);

		// Cuenta las cantidades
		let prods = {cfc: productos.filter((n) => n.cfc), vpc: productos.filter((n) => !n.cfc)};
		const aprob = {
			cfc: prods.cfc.filter((n) => n.statusRegistro_id == aprobado_id).length,
			vpc: prods.vpc.filter((n) => n.statusRegistro_id == aprobado_id).length,
		};
		const pend = {
			cfc: prods.cfc.filter((n) => creados_ids.includes(n.statusRegistro_id)).length,
			vpc: prods.vpc.filter((n) => creados_ids.includes(n.statusRegistro_id)).length,
		};

		// Fin
		return res.json({aprob, pend});
	},
	vencimLinks: async (req, res) => {
		// Variables
		if (!fechaPrimerLunesDelAno) procsRutinas.FechaPrimerLunesDelAno(); // Para asegurarse de tener la 'fechaPrimerLunesDelAno'
		const semanaActual = parseInt((Date.now() - fechaPrimerLunesDelAno) / unDia / 7);
		const prodAprob = true;
		const sinPrimRev = {};
		const conPrimRev = {};

		// Obtiene todos los links en status 'creadoAprob' y 'aprobados'
		let creadoAprobs = BD_genericas.obtieneTodosPorCondicion("links", {statusRegistro_id: creadoAprob_id, prodAprob});
		let aprobados = BD_genericas.obtieneTodosPorCondicion("links", {statusRegistro_id: aprobado_id, prodAprob});
		[creadoAprobs, aprobados] = await Promise.all([creadoAprobs, aprobados]);

		// Obtiene la cantidad de 'creadoAprobs'
		sinPrimRev[semanaActual] = creadoAprobs.filter((n) => !n.yaTuvoPrimRev).length;
		conPrimRev[semanaActual] = creadoAprobs.filter((n) => n.yaTuvoPrimRev).length;

		// Obtiene la cantidad por semana de los 'aprobados'
		for (let link of aprobados) {
			const diaVencim = link.statusSugeridoEn.getTime() + (link.yaTuvoPrimRev ? vidaUtilLinks : vidaPrimRevision);
			const semVencim = parseInt((diaVencim - fechaPrimerLunesDelAno) / unaSemana) + 1;
			link.yaTuvoPrimRev
				? conPrimRev[semVencim]
					? conPrimRev[semVencim]++
					: (conPrimRev[semVencim] = 1)
				: sinPrimRev[semVencim]
				? sinPrimRev[semVencim]++
				: (sinPrimRev[semVencim] = 1);
		}

		// Obtiene los links aprobados
		let cantLinksTotal = await BD_genericas.obtieneTodosPorCondicion("links", {
			prodAprob: true,
			statusRegistro_id: aprobados_ids,
		}).then((n) => n.length);

		// Fin
		return res.json({sinPrimRev, conPrimRev, cantLinksTotal});
	},
	linksPorProv: async (req, res) => {
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
