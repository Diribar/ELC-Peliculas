"use strict";
const procesos = require("../../rutas_y_controladores/3-RevisionEnts/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.query;
	const origen = req.query.origen ? req.query.origen : "TR";
	const revID = req.session.usuario.id;

	// Valida si es el producto correcto
	if (origen == "TR") {
		const sigProd = await procesos.links.obtieneSigProd({revID});
		if (entidad != sigProd.entidad || id != sigProd.id)
			return res.redirect("/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=TR");
	}

	// Fin
	return next();
};
