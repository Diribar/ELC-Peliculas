"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	// Obtener los datos identificatorios del producto
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	// Verificar los datos
	let informacion;
	// Sin entidad y/o ID
	if (!entidad)
		informacion = {
			mensajes: ["Falta el dato de la 'entidad'"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	else if (!prodID)
		informacion = {
			mensajes: ["Falta el dato del 'ID'"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	else {
		// Entidad inexistente
		let prodNombre = funciones.entidadNombre(entidad);
		if (!prodNombre)
			informacion = {
				mensajes: ["La entidad ingresada no es válida"],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
				],
			};
	}
	// Conclusiones
	if (informacion) res.render("Errores", {informacion});
	else next();
};
