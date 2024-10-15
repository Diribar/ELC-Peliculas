"use strict";

module.exports = (req, res, next) => {
	// Variables
	const {id} = req.query;
	if (!id) return next();
	const revisorPERL = req.session.usuario && req.session.usuario.rolUsuario.revisorPERL;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);

	let informacion;
	// Bloquea el acceso a los ID menores que 'idInicial'
	if (id < idInicial && !revisorPERL)
		informacion = {
			mensajes: ["Este registro está reservado para que lo editen los revisores del sitio."],
			iconos: [vistaAnterior],
		};

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
