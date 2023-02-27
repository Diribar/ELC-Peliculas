"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./MT-Procesos");

module.exports = {
	mantenimiento:async (req, res) => {
		// Productos sin link gratuito
		// Productos sin link
		// Productos sin calificar
		// Productos Inactivos
		let prods=await procesos.TC_obtieneProductos()

		// RCLVs Inactivos

		return res.send(prods)
	},

};
