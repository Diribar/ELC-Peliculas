"use strict";
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	const rclvs = variables.entidades.rclvs;
	const rclv = req.path.slice(1);

	// Valida la entidad
	if (!rclvs.includes(rclv)) {
		let informacion = {
			mensajes: ["No se reconoce esa entidad."],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				variables.vistaInicio,
			],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// Fin
	next();
};
