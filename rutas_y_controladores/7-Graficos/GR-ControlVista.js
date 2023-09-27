"use strict";

module.exports = {
	// Películas
	pelisCfcVpc: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisCfcVpc",
			titulo: "Películas por Fe Católica / Valores",
		});
	},
	pelisPublico: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisPublico",
			titulo: "Películas por Público",
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
	linksPorProv: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "linksPorProv",
			titulo: "Cantidad de Links por Proveedor",
		});
	},
};
