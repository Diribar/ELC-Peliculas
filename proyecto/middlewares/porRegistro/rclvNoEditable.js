"use strict";

module.exports = (req, res, next) => {
	// Variables
	const id = req.query.id;
	const revisorPERL = req.session.usuario && req.session.usuario.rolUsuario.revisorPERL;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);

	let informacion;
	// Bloquea el acceso a los ID menores que 10
	if (id && id < 10)
		informacion = {
			mensajes: ["El acceso para este registro está bloqueado por los administradores."],
			iconos: [vistaAnterior],
		};
	// Bloquea la edición de los ID menores que 20
	else if (req.originalUrl.includes("/edicion/") && id && id < 2 && !revisorPERL)
		informacion = {
			mensajes: [
				"Este registro es de alta sensibilidad.",
				"Su acceso para editarlo está bloqueado por los administradores.",
			],
			iconos: [vistaAnterior],
		};

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
