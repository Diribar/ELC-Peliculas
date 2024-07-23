"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const rclvs = variables.entidades.rclvs;
	const {ruta} = comp.reqBasePathUrl(req);
	const indice = ruta.lastIndexOf("/");
	const rclv = ruta.slice(indice + 1);
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);

	// Valida la entidad
	if (!rclvs.includes(rclv)) {
		const informacion = {
			mensajes: ["No se reconoce esa entidad."],
			iconos: [vistaAnterior, variables.vistaInicio],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// Fin
	next();
};
