"use strict";

module.exports = {
	// Usuarios
	clientesDiarios: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "clientesDiarios",
			titulo: "Visitas Diarias",
		}),

	// Productos
	prodsCfcVpc: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "prodsCfcVpc",
			titulo: "Películas por Fe Católica / Valores",
		}),
	prodsPorPublico: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "prodsPorPublico",
			titulo: "Películas por Público",
		}),
	prodsPorEpocaEstr: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "prodsPorEpocaEstr",
			titulo: "Películas por Época de Estreno",
		}),

	// RCLVs
	rclvsRangosSinEfems: (req, res) =>
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "rclvsRangosSinEfems",
			titulo: "Rangos sin Efemérides",
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
};
