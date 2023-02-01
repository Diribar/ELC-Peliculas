"use strict";

// *********** Controlador ***********
module.exports = {
	redireccionarInicio:(req,res)=>{
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
		if (origen == "DA") origen = "/producto/agregar/datos-adicionales";
		if (origen == "ED") origen = "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID;
		if (origen == "DT_RCLV") origen = "/rclv/detalle/?entidad=" + entidad + "&id=" + id;
		if (origen == "tableroUs") origen = "/revision/usuarios/tablero-de-control";
		if (origen == "tableroEnts") origen = "/revision/tablero-de-control";
		if (!origen) origen = "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(origen);
	},
};
