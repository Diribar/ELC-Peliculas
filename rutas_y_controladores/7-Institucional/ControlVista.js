"use strict";
const variables = require("../../funciones/3-Procesos/Variables");

// *********** Controlador ***********
module.exports = {
	inicio: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "inicio",
			titulo: "Inicio",
			opciones: variables.opcionesInicio,
		});
	},
	quienesSomos: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "quienesSomos",
			titulo: "Quiénes somos",
		});
	},
	misionVision: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "misionVision",
			titulo: "Nuestra Misión y Visión",
		});
	},
	valores: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "nuestrosValores",
			titulo: "Nuestros Valores",
		});
	},
	derechosAutor: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "derechosAutor",
			titulo: "Nuestra Política sobre Derechos de Autor",
		});
	},
	dataEntry: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			codigo: "dataEntry",
			titulo: "Nuestra Política de Data-Entry",
		});
	},
};
