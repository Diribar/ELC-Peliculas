"use strict";
// Variables
const comp = require("../2-Procesos/Compartidas");
const variables = require("../2-Procesos/Variables");

module.exports = {
	// Revisar - Tablero
	tablRevision: {
		obtieneLinks: async () => {
			// Variables
			const include = variables.entidades.asocProds;

			// Obtiene los links en status 'a revisar'
			const condiciones = {
				prodAprob: true,
				statusRegistro_id: {[Op.and]: [{[Op.ne]: aprobado_id}, {[Op.ne]: inactivo_id}]},
			};
			const originales = db.links
				.findAll({where: condiciones, include})
				.then((n) => n.map((m) => m.toJSON()))
				.then((n) => n.sort((a, b) => (a.capitulo_id && !b.capitulo_id ? -1 : !a.capitulo_id && b.capitulo_id ? 1 : 0))) // lotes por capítulos y no capítulos
				.then((n) => n.sort((a, b) => (a.capitulo_id && b.capitulo_id ? a.grupoCol_id - b.grupoCol_id : 0))) // capítulos por colección
				.then((n) => n.sort((a, b) => (a.statusSugeridoEn < b.statusSugeridoEn ? -1 : 1))); // lotes por 'statusSugeridoEn'

			// Obtiene todas las ediciones
			const ediciones = db.linksEdicion.findAll({include}).then((n) => n.map((m) => m.toJSON()));

			// Los consolida
			const links = await Promise.all([originales, ediciones]).then(([originales, ediciones]) => ({originales, ediciones}));

			// Fin
			return links;
		},
	},

};
