"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesosRE = require("../3-RevisionEnts/RE-Procesos");
const procesos = require("./MT-Procesos");

module.exports = {
	mantenimiento: async (req, res) => {
		// Tema y Código
		const tema = "mantenimiento";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;

		// Productos
		let productos = await procesos.TC_obtieneProductos(userID);
		productos = procesosRE.TC.prod_ProcesaCampos(productos);
		// return res.send(productos)

		// RCLVs Inactivos
		let rclvs = {};

		// Links Inactivos
		let links = {};

		// Va a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Mantenimiento",
			productos,
			rclvs,
			links,
		});
	},
};
