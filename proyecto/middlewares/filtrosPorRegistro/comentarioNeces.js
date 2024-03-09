"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {comentario, motivo_id} = req.body;
	const motivo = await BD_genericas.obtienePorId("motivosStatus", motivo_id);

	// Problemas
	const informacion =
		!comentario && motivo.agregarComent
			? {
					mensajes: ["Necesitamos que nos des un comentario"],
					iconos: [variables.vistaEntendido(req.session.urlAnterior)],
			  }
			: "";

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
