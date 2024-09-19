"use strict";

module.exports = {
	// Usuarios
	visitasDiarias: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "visitasDiarias",
			titulo: "Visitas Diarias",
		}),

	// Películas
	pelisCfcVpc: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisCfcVpc",
			titulo: "Películas por Fe Católica / Valores",
		}),
	pelisPublico: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisPublico",
			titulo: "Películas por Público",
		}),
	pelisEpocaEstreno: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "pelisEpocaEstreno",
			titulo: "Películas por Época de Estreno",
		}),

	// Links
	linksVencim: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "linksVencim",
			titulo: "Vencimiento Semanal de Links",
		}),
	linksPorProv: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "linksPorProv",
			titulo: "Cantidad de Links por Proveedor",
		}),

	// Otros
	rangosSinEfs: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "rangosSinEfs",
			titulo: "Rangos sin Efemérides",
		}),
};
