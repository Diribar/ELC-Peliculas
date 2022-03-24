"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_especificas = require("../../funciones/BD/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidadActual = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	// CONTROLES PARA PRODUCTO *******************************************************
	// Revisa si tiene capturas > haceUnaHora en alguno de: 3 Tipos de Producto, 3 Tipos de RCLV
	let prodCapturado = await BD_especificas.revisaSiTieneOtrasCapturas(entidadActual, prodID, userID);
	if (prodCapturado) {
		let entidadNombre = especificas.entidadNombre(prodCapturado.entidad);
		let mensaje =
			"Tenés que liberar el/la " +
			entidadNombre +
			" " +
			(prodCapturado.nombre_castellano
				? prodCapturado.nombre_castellano
				: prodCapturado.nombre_original) +
			". Volvé a la vista 'Visión General'";
		return res.render("Errores", {mensaje});
	} else next();
};
