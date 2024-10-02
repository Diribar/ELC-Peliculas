"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const {id, rechazar, motivo_id} = {...req.query, ...req.body};
	let informacion;

	// 1. Rechazado sin motivo => Recarga la vista
	if (rechazar && !motivo_id) {
		let link = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
		informacion = {
			mensajes: ["Se rechazó sin decirnos el motivo"],
			iconos: [variables.vistaEntendido(link)],
		};
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
