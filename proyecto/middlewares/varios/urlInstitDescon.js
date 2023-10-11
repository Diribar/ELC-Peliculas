"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const url = req.path.slice(1);
	const vars = vistasInstitucs[url];
	let informacion;

	// Acciones si no se reconoce la url
	if (!vars)
		informacion = {
			mensajes: [variables.urlDesconocida],
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
		};

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
