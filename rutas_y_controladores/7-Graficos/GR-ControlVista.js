"use strict";

module.exports = {
	// Películas
	pelisCfcVpc: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "cantPelisPorCFC",
			titulo: "Películas por Fe Católica / Valores",
		});
	},
	pelisAprob: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisAprob",
			titulo: "Películas Aprobadas",
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
