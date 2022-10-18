"use strict";

// *********** Controlador ***********
module.exports = {
	// Vistas de vistas - Institucional
	home: (req, res) => {
		const tema = "miscelaneas";
		const codigo = "inicio";
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Inicio",
			avatar: "/imagenes/8-Inicio/Inicio.jpg",
		});
	},
	quienesSomos: (req, res) => {
		const tema = "miscelaneas";
		const codigo = "quienes-somos";
		return res.render("CMP-0Estructura", {
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
		let {origen, prodEntidad, prodID, entidad, id} = req.query;
		// Si es 'tablero', ir a tablero
		if (origen == "DP") origen = "/producto/agregar/datos-personalizados";
		if (origen == "ED") origen = "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID;
		if (origen == "DT_RCLV") origen = "/rclv/detalle/?entidad=" + entidad + "&id=" + id;
		if (origen == "tableroUs") origen = "/revision/usuarios/tablero-de-control";
		if (origen == "tableroEnts") origen = "/revision/tablero-de-control";
		if (!origen) origen = "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(origen);
		// Ya no se usa...
		// if (origen == "DTP") origen = "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID;
	},
};
