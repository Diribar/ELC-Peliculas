"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id, rechazado} = req.query;
	const motivo_id = req.body.motivo_id;
	let informacion;

	// 1. Rechazado sin motivo => Recarga la vista
	if (rechazado && !motivo_id) {
		let link = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
		informacion = {
			mensajes: ["Se rechazó sin decirnos el motivo"],
			iconos: [{nombre: "fa-circle-left", link, titulo: "Volver a la vista anterior"}],
		};
	}

	// Conclusiones
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
