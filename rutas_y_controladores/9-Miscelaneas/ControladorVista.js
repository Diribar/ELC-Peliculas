"use strict";

// *********** Controlador ***********
module.exports = {
	// Vistas de vistas - Institucional
	home: (req, res) => {
		const tema = "miscelaneas";
		const codigo = "inicio";
		return res.render("IN0-Estructura", {
			tema,
			codigo,
			titulo: "Inicio",
		});
	},
	quienesSomos: (req, res) => {
		const tema = "miscelaneas";
		const codigo = "quienes-somos";
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Quiénes somos",
		});
	},

	// Session y Cookies
	session: (req, res) => {
		return res.send(req.session);
	},
	cookies: (req, res) => {
		return res.send(req.cookies);
	},

	// Miscelaneas
	redireccionar: async (req, res) => {
		// Variables
		let {origen, prodEntidad, prodID} = req.query;
		// Si es 'tablero', ir a tablero
		if (origen == "DP") origen = "/producto/agregar/datos-personalizados";
		if (origen == "ED") origen = "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID;
		if (origen == "DT") origen = "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID;
		if (origen == "tableroUs") origen = "/revision/tablero-de-control/usuarios";
		if (origen == "tableroEnts") origen = "/revision/tablero-de-control";
		if (!origen) origen = "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(origen);
	},
};
