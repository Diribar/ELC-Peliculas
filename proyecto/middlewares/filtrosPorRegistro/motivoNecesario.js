"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id, motivo_id} = {...req.query, ...req.body};
	let informacion;

	if (!motivo_id) {
		let link = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
		informacion = {
			mensajes: ["Se rechazó sin decirnos el motivo"],
			iconos: [comp.vistaEntendido(link)],
		};
	}

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
