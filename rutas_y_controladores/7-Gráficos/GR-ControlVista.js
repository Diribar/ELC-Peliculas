"use strict";

// *********** Controlador ***********
module.exports = {
	vencimLinks: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "vencimLinks",
			titulo: "Vencimiento Semanal de Links",
		});
	},
	cantLinksPorProv: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "cantLinksPorProv",
			titulo: "Cantidad de Links por Proveedor",
		});
	},
};
