"use strict";

module.exports = (req, res, next) => {
	// Variables
	const {entidad, siglaFam} = req.params;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	let informacion;

	// Verifica que existe la entidad
	if (!entidad) informacion = {mensajes: ["Falta el dato de la 'entidad'"], iconos: [vistaAnterior]};

	// Verifica que se reconozca la 'siglaFam'
	if (!informacion && siglaFam && !["p", "r"].includes(siglaFam))
		informacion = {
			mensajes: ["No tenemos esa dirección en nuestro sistema"],
			iconos: [vistaAnterior, variables.vistaInicio], // se usa actual porque no llegó a cambiar el session
		};

	// Verifica la coherencia entre la siglaFam y la entidad
	if (!informacion && siglaFam) {
		// Obtiene la siglaFam a partir de la entidad, y las compara
		const siglaFamEnt = comp.obtieneDesdeEntidad.siglaFam(entidad);
		if (siglaFam != siglaFamEnt) informacion = {mensajes: ["La entidad ingresada es inválida."], iconos: [vistaAnterior]};
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
