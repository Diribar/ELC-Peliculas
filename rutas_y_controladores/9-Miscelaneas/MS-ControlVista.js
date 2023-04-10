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
		let {origen, prodEntidad, prodID, entidad, id, urlDestino} = req.query;
		// return res.send(req.query)
		// Si es 'tablero', ir a tablero
		let destino = false
			? null
			: // Producto
			origen == "DA"
			? "/producto/agregar/datos-adicionales"
			: origen == "DTP"
			? "/producto/detalle/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "EDP"
			? "/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "LK"
			? "/links/abm/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: // RCLV
			origen == "DTR"
			? "/rclv/detalle/?entidad=" + entidad + "&id=" + id
			: // Revisión
			origen == "TE"
			? "/revision/tablero-de-control"
			: origen == "RLK"
			? "/revision/links/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: // Otros
			origen == "TU"
			? "/revision/usuarios/tablero-de-control"
			: origen == "MT"
			? "/mantenimiento"
			: urlDestino
			? urlDestino
			: "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(destino);
	},
};
