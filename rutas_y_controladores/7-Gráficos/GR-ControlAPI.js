"use strict";
// Variables
const procsRutinas = require("../../funciones/3-Rutinas/RT-Control");
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = {
	vencimLinks: async (req, res) => {
		// Variables
		const vidaPrimRevision = cuatroSems;
		const vidaUtil = 7 * unDia * 26; // 26 semanas
		if (!fechaPrimerLunesDelAno) procsRutinas.FechaPrimerLunesDelAno(); // Para asegurarse de tener la 'fechaPrimerLunesDelAno'
		const semanaActual = parseInt((Date.now() - fechaPrimerLunesDelAno) / unDia / 7);
		const linksSemanales = {};

		// Obtiene todos los links en status 'creadoAprob' y 'aprobados'
		let creadoAprobs = BD_genericas.obtieneTodosPorCondicion("links", {statusRegistro_id: creadoAprob_id});
		let aprobados = BD_genericas.obtieneTodosPorCondicion("links", {statusRegistro_id: aprobado_id});
		[creadoAprobs, aprobados] = await Promise.all([creadoAprobs, aprobados]);

		// Obtiene la cantidad de 'creadoAprobs'
		linksSemanales[semanaActual] = creadoAprobs.length;

		// Obtiene la cantidad por semana de los 'aprobados'
		for (let link of aprobados) {
			const diaVencim = link.statusSugeridoEn.getTime() + (link.yaTuvoPrimRev ? vidaUtil : vidaPrimRevision);
			const semanaVencim = parseInt((diaVencim - fechaPrimerLunesDelAno) / unDia / 7) + 1;
			linksSemanales[semanaVencim] ? linksSemanales[semanaVencim]++ : (linksSemanales[semanaVencim] = 1);
		}

		// Fin
		return res.json(linksSemanales)
	},
};
