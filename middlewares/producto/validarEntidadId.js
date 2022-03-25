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
	if (!prodID)
		informacion = {
			mensaje: "Falta el dato del 'ID'",
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior}],
		};
	// Entidad inexistente
	let producto = especificas.entidadNombre(entidad);
	if (!producto && !mensaje) 
	informacion = {
		mensaje: "La entidad ingresada no es válida",
		iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior}],
	};
	// Conclusiones
	if (informacion) res.render("Errores", {informacion});
	else next();
};
