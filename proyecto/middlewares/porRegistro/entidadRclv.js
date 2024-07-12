"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const rclvs = variables.entidades.rclvs;
	const {ruta} = comp.reqBasePathUrl(req);
	const indice = ruta.lastIndexOf("/");
	const rclv = ruta.slice(indice + 1);

	// Valida la entidad
	if (!rclvs.includes(rclv)) {
		let informacion = {
			mensajes: ["No se reconoce esa entidad."],
			iconos: [vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// Fin
	next();
};
