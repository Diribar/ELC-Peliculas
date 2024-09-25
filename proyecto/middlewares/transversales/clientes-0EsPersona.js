// Obtiene 'usuario' y 'cliente'
"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if ((req.session && (req.session.cliente || req.session.esPersona)) || (req.cookies && req.cookies.cliente_id)) return next();

	// Prepara la información
	req.session.esPersona = true;
	const informacion = {
		mensajes: ["Por favor confirmanos que sos una persona", "Elegí el ícono del pulgar para arriba"],
		iconos: [{clase: iconos.xMark, titulo: "No confirmo"}, variables.vistaEntendido(req.session.urlActual)],
		check: true,
	};

	// Fin
	return res.render("CMP-0Estructura", {informacion});
};
