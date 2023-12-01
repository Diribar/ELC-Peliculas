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
		const antiguos = creadoAprobs.filter((n) => n.statusSugeridoEn.getTime() < lunesDeEstaSemana).length;
		const recientes = creadoAprobs.filter((n) => n.statusSugeridoEn.getTime() >= lunesDeEstaSemana);
		sinPrimRev[semanaActual] = recientes.filter((n) => !n.yaTuvoPrimRev).length;
		conPrimRev[semanaActual] = recientes.filter((n) => n.yaTuvoPrimRev).length;

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

		// Fin
		return res.json({antiguos, sinPrimRev, conPrimRev});
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
	rangosSinEfs: async (req, res) => {
		// Variables
		let fechas = await obtieneEfemerides();

		// Obtiene rangos entre efemérides
		fechas.forEach((fecha, i) => {
			const sig = i + 1 < fechas.length ? i + 1 : 0; // si se llegó al final, empieza desde el comienzo
			fecha.rango = fechas[sig].id - fecha.id;
			if (fecha.rango < 0) fecha.rango += 366; // excepción para el último registro
		});

		// Ordena decreciente
		fechas.sort((a, b) => b.rango - a.rango);

		// Fin
		return res.json(fechas);
	},
};
let obtieneEfemerides = async () => {
	// Variables
	const entsRCLV = variables.entidades.rclvs.slice(0, -1);
	const include = ["personajes", "hechos", "temas", "eventos"];
	let fechas;

	// Obtiene las fechas con sus RCLV
	fechas = await BD_genericas.obtieneTodosConInclude("fechasDelAno", include);
	fechas = fechas.filter((n) => n.id < 400);

	// Concentra los distintos RCLVs en el campo RCLV
	for (let fecha of fechas) {
		// Variables
		fecha.rclvs = [];

		// Rutina
		for (let entRCLV of entsRCLV)
			if (fecha[entRCLV].length) {
				const nombres = fecha[entRCLV].map((n) => n.nombre);
				fecha.rclvs.push(...nombres);
			}

		// Elimina info innecesaria
		for (let campo in fecha) if (!["id", "nombre", "rclvs"].includes(campo)) delete fecha[campo];
		if (!fecha.rclvs.length) delete fecha.rclvs;
	}

	// Conserva solo las fechas con efemérides
	fechas = fechas.filter((n) => n.rclvs);

	// Fin
	return fechas;
};
