"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	let opcion = req.url.slice(1);
	let opcionSubOpcion;
	if (opcion.indexOf("/") != -1) {
		opcion = opcion.slice(0, opcion.indexOf("/"));
		opcionSubOpcion = req.url.slice(1);
	}
	// Para tener en 'session' las opciones
	if (!req.session.menuOpciones) {
		req.session.menuOpciones = variables.menuOpciones();
		req.session.menuOpciones_url = req.session.menuOpciones.map((n) => n.url);
	}
	// Para tener en 'session' las menuSubOpciones_algunas
	if (!req.session.menuSubOpciones_todas) {
		req.session.menuSubOpciones_todas = [];
		// Obtener las menuSubOpciones_todas para Sugeridos y Listado
		let menuSubOpciones_todas = variables.subMenuOpciones();
		menuSubOpciones_todas.map((n) =>
			req.session.menuSubOpciones_todas.push({nombre: n.nombre, url: "sugeridas/" + n.url})
		);
		menuSubOpciones_todas.map((n) =>
			req.session.menuSubOpciones_todas.push({nombre: n.nombre, url: "listado/" + n.url})
		);
		// Obtener las menuSubOpciones_algunas para CFC y VPC
		req.session.menuSubOpciones_todas.push(
			...(await BD_genericas.obtenerTodos("subcategorias", "orden").then((n) =>
				n.map((m) => {
					return {nombre: m.nombre, url: m.url};
				})
			))
		);
	}

	// Obtener las menuSubOpciones_algunas para la opción elegida
	req.session.menuSubOpciones_algunas = req.session.menuSubOpciones_todas.filter(
		(n) => n.url.slice(0, n.url.indexOf("/")) == opcion
	);
	req.session.menuSubOpciones_algunas_url = req.session.menuSubOpciones_algunas.map((n) => n.url);

	// Validar que la url sea de alguna opción o sub-opción válida
	if (
		// La url coincide con un url de OPCIÓN
		!req.session.menuOpciones_url.includes(opcion) &&
		// La url coincide con un url de SUB-OPCIÓN
		!req.session.menuSubOpciones_algunas_url.includes(opcionSubOpcion)
	) {
		let informacion = {
			mensajes: ["No tenemos esa dirección de url en nuestro sitio"],
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio()],
		};
		return res.render("MI-Cartel", {informacion});
	}

	// Continuar
	next();
};
