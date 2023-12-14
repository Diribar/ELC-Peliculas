"use strict";

// *********** Controlador ***********
module.exports = {
	institucional: (req, res) => {
		// Variables
		const url = req.path.slice(1);
		const vistas = Object.keys(vistasInstitucs);
		const vistaActual = vistasInstitucs[url];
		const indice = vistas.indexOf(url);

		// Vistas anterior y posterior
		const urlAnt = indice ? vistas[indice - 1] : null;
		const urlPost = indice < vistas.length - 1 ? vistas[indice + 1] : "inicio";

		// Fin
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			...vistaActual,
			...{urlAnt, urlPost, indice, vistas: vistas.length - 1},
		});
	},
	contactanos: {
		form: async (req, res) => {
			// Variables
			const tema = "institucional";
			const codigo = "contactanos";
			const titulo = "Contactanos";
			const urlAnterior = req.session.urlAnterior;

			// Obtiene información para la vista
			const dataEntry =
				req.session.tableros && req.session.tableros.mantenimiento ? req.session.tableros.mantenimiento : {};

			// Va a la vista
			return res.render("CMP-0Estructura", {tema, codigo, titulo, dataEntry, urlAnterior});
		},
		guardar: async (req, res) => {

		},
	},
};
