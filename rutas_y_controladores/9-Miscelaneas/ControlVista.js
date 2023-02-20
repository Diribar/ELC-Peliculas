"use strict";

// *********** Controlador ***********
module.exports = {
	redireccionarInicio: (req, res) => {
		return res.redirect("/institucional/inicio");
	},

	session: (req, res) => {
		return res.send(req.session);
	},
	cookies: (req, res) => {
		return res.send(req.cookies);
	},

	redireccionar: async (req, res) => {
		// Variables
		let {origen, prodEntidad, prodID, entidad, id} = req.query;
		// Si es 'tablero', ir a tablero
		let destino =
			origen == "DA"
				? "/producto/agregar/datos-adicionales"
				: origen == "ED"
				? "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DT_prod"
				? "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DT_RCLV"
				? "/rclv/detalle/?entidad=" + entidad + "&id=" + id
				: origen == "tableroUs"
				? "/revision/usuarios/tablero-de-control"
				: origen == "tableroEnts"
				? "/revision/tablero-de-control"
				: "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(destino);
	},
};
