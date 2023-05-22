"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesosRE = require("../3-RevisionEnts/RE-Procesos");
const procesos = require("./MT-Procesos");

module.exports = {
	mantenimiento: async (req, res) => {
		// Tema y Código
		const tema = "mantenimiento";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;

		// Productos
		let productos = await procesos.obtieneProds(userID);
		productos = procesosRE.TC.prod_ProcesaCampos(productos);

		// RCLVs
		let rclvs = await procesos.obtieneRCLVs(userID);
		rclvs = procesosRE.TC.RCLV_ProcesaCampos(rclvs);

		// Links
		let prodLinks = await procesos.obtieneProds_Links(userID);
		prodLinks = procesosRE.TC.prod_ProcesaCampos(prodLinks);

		// Une Productos y Links
		productos = {...productos, ...prodLinks};

		// Va a la vista
		// return res.send(productos);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Mantenimiento"},
			...{productos, rclvs},
			revisor: req.session.usuario.rol_usuario.revisor_ents,
		});
	},
};
