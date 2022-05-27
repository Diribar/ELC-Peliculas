"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_especificas = require("../../funciones/2-BD/Especificas");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidadActual = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	let haceUnaHora = funciones.haceUnaHora();
	// CONTROLES PARA PRODUCTO *******************************************************
	// Revisa si tiene capturas > haceUnaHora en alguno de: 3 Tipos de Producto, 3 Tipos de RCLV
	let prodCapturado = await BD_especificas.buscaAlgunaCapturaVigenteDelUsuario(
		entidadActual,
		prodID,
		userID,
		haceUnaHora
	);
	if (prodCapturado) {
		// Datos para el mensaje
		let entidadCodigo = prodCapturado.entidad;
		let entidadNombre = funciones.obtenerEntidadNombre(entidadCodigo);
		let entidadID = prodCapturado.id;
		let linkRedireccionar = "/revision/redireccionar/?entidad=" + entidadCodigo + "&id=" + entidadID;
		let url = encodeURIComponent(req.originalUrl);
		let linkInactivar = "/inactivar/?entidad=" + entidadCodigo + "&id=" + entidadID + "&url=" + url;
		let horario =
			prodCapturado.capturado_en.getHours() +
			":" +
			String(prodCapturado.capturado_en.getMinutes()).padStart(2, "0") +
			"hs.";
		// Preparar la información
		let terminacion =
			entidadCodigo != "capitulos" && !entidadCodigo.includes("RCLV")
				? {entidad: "la ", reservado: "a"}
				: {entidad: "el ", reservado: "o"};
		let nombre = entidadCodigo.includes("RCLV")
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
			iconos: [
				{nombre: "fa-circle-check", link: linkInactivar, titulo: "Liberar automáticamente"},
				{nombre: "fa-circle-right", link: linkRedireccionar, titulo: "Liberar manualmente"},
			],
		};

		return res.render("Errores", {informacion});
	}

	// Continuar
	next();
};
