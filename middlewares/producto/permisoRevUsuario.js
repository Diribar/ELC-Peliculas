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
	let prodCapturado = await BD_especificas.buscaAlgunaCapturaVigenteDelUsuario(
		entidadActual,
		prodID,
		userID
	);
	if (prodCapturado) {
		// Datos para el mensaje
		let entidad = prodCapturado.entidad;
		let entidadNombre = especificas.entidadNombre(prodCapturado.entidad);
		let linkEntidadCapturada = "/revision/redireccionar/?entidad=" + entidad + "&id=" + prodCapturado.id;
		let horario = prodCapturado.capturado_en.getHours() + ":" + prodCapturado.capturado_en.getMinutes();
		// Preparar la información
		let informacion = {
			mensaje:
				"Tenés que liberar " +
				(prodCapturado.entidad != "capitulos" && !prodCapturado.entidad.includes("RCLV")
					? "la "
					: "el ") +
				entidadNombre.toLowerCase() +
				" <span>" +
				(prodCapturado.nombre_castellano
					? prodCapturado.nombre_castellano
					: prodCapturado.nombre_original) +
				"</span>, que está reservad" +
				(prodCapturado.entidad != "capitulos" ? "a" : "o") +
				" desde las " +
				horario,
			iconos: [
				{nombre: "fa-circle-right", link: linkEntidadCapturada, titulo: "Ir a esa vista"},
			],
		};

		return res.render("Errores", {informacion});
	} else next();
};
