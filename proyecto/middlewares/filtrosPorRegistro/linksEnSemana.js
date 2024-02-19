"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.query;
	const origen = req.query.origen ? req.query.origen : "TR";
	const revID = req.session.usuario.id;

	// Averigua el producto que debería ser
	let sigProd = await procesos.links.obtieneSigProd({revID});

	// Si no hay ninguno, termina y redirige
	if (!sigProd) return res.redirect("/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=TR");

	// Si es distinto y tampoco es el siguiente, termina y redirige
	if (entidad != sigProd.entidad || id != sigProd.id) {
		sigProd = await procesos.links.obtieneSigProd({entidad: sigProd.entidad, id: sigProd.id, revID});
		if (!sigProd || entidad != sigProd.entidad || id != sigProd.id)
			return res.redirect("/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=TR");
	}

	// Fin
	return next();
};
