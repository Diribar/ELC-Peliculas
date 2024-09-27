"use strict";

module.exports = (req, res, next) => {
	// Variables
	const {entidad} = req.query;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	let informacion;

	// Verifica los datos
	if (!entidad) informacion = {mensajes: ["Falta el dato de la 'entidad'"], iconos: [vistaAnterior]};
	else {
		// Entidad inexistente
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const url = req.baseUrl + req.path;
		const rutasStd = [familia, "/correccion/"];
		const rutasPorFamilia = {
			producto: [...rutasStd, "/links/"],
			rclv: [...rutasStd],
		};
		if (
			!familia || // la entidad no pertenece a una familia
			!rutasPorFamilia[familia].some((n) => url.includes(n)) // la familia no está presente en el url
		)
			informacion = {mensajes: ["La entidad ingresada es inválida."], iconos: [vistaAnterior]};
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
