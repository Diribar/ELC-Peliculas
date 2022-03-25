"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");

module.exports = (req, res, next) => {
	// Obtener los datos identificatorios del producto
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	// Verificar los datos
	let informacion;
	// Sin entidad y/o ID
	if (!entidad)
		informacion = {
			mensaje: "Falta el dato de la 'entidad'",
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior}],
		};
	else if (!prodID)
		informacion = {
			mensaje: "Falta el dato del 'ID'",
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior}],
		};
	else {
		// Entidad inexistente
		let productoNombre = especificas.entidadNombre(entidad);
		if (!productoNombre)
			informacion = {
				mensaje: "La entidad ingresada no es válida",
				iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior}],
			};
	}
	// Conclusiones
	if (informacion) res.render("Errores", {informacion});
	else next();
};
