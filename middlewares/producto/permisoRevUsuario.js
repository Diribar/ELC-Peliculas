"use strict";
// Requires
const especificas = require("../../funciones/4-Compartidas/Especificas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

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
		let horario =
			prodCapturado.capturado_en.getHours() +
			":" +
			String(prodCapturado.capturado_en.getMinutes()).padStart(2, "0") +
			"hs.";
		// Preparar la información
		let terminacion =
			prodCapturado.entidad != "capitulos" && !prodCapturado.entidad.includes("RCLV")
				? {entidad: "la ", reservado: "a"}
				: {entidad: "el ", reservado: "o"};
		let nombre = prodCapturado.entidad.includes("RCLV")
			? "nombre"
			: prodCapturado.nombre_castellano
			? "nombre_castellano"
			: "nombre_original";
		let informacion = {
			mensajes: [
				"Tenés que liberar " +
					terminacion.entidad +
					entidadNombre.toLowerCase() +
					" " +
					prodCapturado[nombre] +
					", que está reservad" +
					terminacion.reservado +
					" desde las " +
					horario,
			],
			iconos: [{nombre: "fa-circle-right", link: linkEntidadCapturada, titulo: "Ir a esa vista"}],
		};

		return res.render("Errores", {informacion});
	} else next();
};
