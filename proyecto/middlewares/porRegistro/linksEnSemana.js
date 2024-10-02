"use strict";
const procesos = require("../../rutas_y_contrs/3-Rev-Entidades/RE-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const {id} = req.query;
	const revId = req.session.usuario.id;
	delete req.sigProd;

	// Averigua el producto que debería ser
	let sigProd = await procesos.links.obtieneSigProd({revId});

	// Si no hay ninguno, termina y redirige
	if (!sigProd) return res.redirect("/inactivar-captura/" + entidad + "/?id=" + id + "&origen=TE");

	// Acciones si es distinto
	if (entidad != sigProd.entidad || id != sigProd.id) {
		// Variables
		req.sigProd = sigProd;
		sigProd = await procesos.links.obtieneSigProd({entidad: sigProd.entidad, id: sigProd.id, revId});

		// Si tampoco es el siguiente, termina y redirige
		if (!sigProd || entidad != sigProd.entidad || id != sigProd.id)
			return res.redirect("/inactivar-captura/" + entidad + "/?id=" + id + "&origen=TE");
	}

	// Fin
	return next();
};
