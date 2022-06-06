"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Definir variables
	const entidadActual = req.query.entidad ? req.query.entidad : "";
	const prodID = req.query.id ? req.query.id : "";
	const userID = req.session.usuario.id;
	// CONTROLES PARA PRODUCTO *******************************************************
	// Revisa si tiene capturas > haceUnaHora en alguno de: 3 Tipos de Producto, 3 Tipos de RCLV
	let prodCapturado = await funciones.buscaAlgunaCapturaVigenteDelUsuario(entidadActual, prodID, userID);
	if (prodCapturado) {
		// Datos para el mensaje
		const entidadCodigo = prodCapturado.entidad;
		const entidadNombre = funciones.obtenerEntidadNombre(entidadCodigo);
		const entidadID = prodCapturado.id;
		const url = encodeURIComponent(req.originalUrl);
		const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
		const linkInactivar = "/inactivar/?entidad=" + entidadCodigo + "&id=" + entidadID + "&url=" + url;
		const liberar = {nombre: "fa-circle-check", link: linkInactivar, titulo: "Liberar automáticamente"};
		const horario =
			prodCapturado.capturado_en.getHours() +
			":" +
			String(prodCapturado.capturado_en.getMinutes()).padStart(2, "0") +
			"hs.";
		// Preparar la información
		const terminacion =
			entidadCodigo != "capitulos" && !entidadCodigo.includes("RCLV")
				? {entidad: "la ", reservado: "a"}
				: {entidad: "el ", reservado: "o"};
		const nombre = entidadCodigo.includes("RCLV")
			? "nombre"
			: prodCapturado.nombre_castellano
			? "nombre_castellano"
			: "nombre_original";
		const informacion = {
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
			iconos: [vistaAnterior, liberar],
		};

		return res.render("Errores", {informacion});
	}

	// Continuar
	next();
};
