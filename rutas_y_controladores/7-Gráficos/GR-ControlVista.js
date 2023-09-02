"use strict";

module.exports = {
	// Películas
	cantPelisPorCfcVpc: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "cantPelisPorCFC",
			titulo: "Películas por Fe Católica / Valores",
		});
	},

	// Links
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
