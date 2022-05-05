"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Para tener en 'session' las opciones
	if (!req.session.menuOpciones_url) {
		req.session.menuOpciones = variables.menuOpciones();
		req.session.menuOpciones_url = req.session.menuOpciones.map((n) => n.url);
	}

	// Para tener en 'session' las subOpciones
	if (!req.session.menuSubOpciones_url) {
		req.session.menuSubOpciones_url = [];
		// Obtener las subOpciones de Sugerids y Listado
		let subOpciones = variables.menuSubOpciones().map((n) => n.url);
		// Armar la estructura para esas opciones
		subOpciones.map((n) => req.session.menuSubOpciones_url.push("sugeridas/" + n));
		subOpciones.map((n) => req.session.menuSubOpciones_url.push("listado/" + n));
		// Agregarles las subcategorías para CFC y VPC
		req.session.menuSubOpciones_url.push(
			...(await BD_genericas.obtenerTodos("subcategorias", "orden").then((n) => n.map((m) => m.url)))
		);
	}

	// Validar que la url sea de alguna opción o sub-opción válida
	if (
		// La url coincide con un url de OPCIÓN
		!req.session.menuOpciones_url.includes(req.url.slice(1)) &&
		// La url coincide con un url de SUB-OPCIÓN
		!req.session.menuSubOpciones_url.includes(req.url.slice(1))
	) {
		let informacion = {
			mensajes: ["No tenemos esa dirección de url en nuestro sitio"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
				{nombre: "fa-house", link: "/", titulo: "Ir a la vista de inicio"},
			],
		};
		return res.render("Errores", {informacion});
	}

	// Generar 'menuSubOpciones'
	req.session.menuSubOpciones=

	// Si el url es correcto --> Fin
	next();
};
