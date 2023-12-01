"use strict";

module.exports = {
	// Películas
	pelisCfcVpc: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisCfcVpc",
			titulo: "Películas por Fe Católica / Valores",
		});
	},
	pelisPublico: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisPublico",
			titulo: "Películas por Público",
		});
	},

	// Links
	vencimLinks: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "vencimLinks",
			titulo: "Vencimiento Semanal de Links",
		});
	},
	linksPorProv: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "linksPorProv",
			titulo: "Cantidad de Links por Proveedor",
		});
	},

	// Otros
	rangosSinEfemerides: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "rangosSinEfemerides",
			titulo: "Rangos sin Efemérides",
		});
	},
};
