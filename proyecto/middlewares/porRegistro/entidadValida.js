"use strict";

module.exports = (req, res, next) => {
	// Variables
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	let informacion, siglaFam;

	// Verifica que existe la entidad
	if (!entidad) informacion = {mensajes: ["Falta el dato de la 'entidad'"], iconos: [vistaAnterior]};

	// Configura 'siglaFam'
	if (!informacion)
		siglaFam =
			req.params && req.params.siglaFam
				? req.params.siglaFam // Obtiene la 'siglaFam' del params
				: comp.partesDelUrl(req).siglaFam; // Si no la consiguió, la busca en el path

	// Verificaciones si existe la 'siglaFam'
	if (!informacion && siglaFam) {
		// Verifica que se reconozca la 'siglaFam'
		if (!["p", "r", "l"].includes(siglaFam))
			informacion = {
				mensajes: ["No tenemos esa dirección en nuestro sistema (entidad inválida)"],
				iconos: [vistaAnterior, variables.vistaInicio], // se usa actual porque no llegó a cambiar el session
			};
		// Verifica la coherencia entre la siglaFam y la entidad
		else {
			// Obtiene la siglaFam a partir de la entidad, y las compara
			const siglaFamEnt = comp.obtieneDesdeEntidad.siglaFam(entidad);
			if (siglaFam != siglaFamEnt) informacion = {mensajes: ["La entidad ingresada es inválida."], iconos: [vistaAnterior]};
		}
	}

	if (!informacion && !siglaFam) {
		const entidades = variables.entidades.prodsRclvs;
		if (!entidades.includes(entidad))
			informacion = {mensajes: ["La entidad ingresada es inválida."], iconos: [vistaAnterior]};
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
