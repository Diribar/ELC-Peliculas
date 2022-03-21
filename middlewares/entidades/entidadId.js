"use strict";
// Requires
const varias = require("../../funciones/Varias/Varias");

module.exports = async (req, res, next) => {
	// Obtener los datos identificatorios del producto
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	// Verificar los datos
	let mensaje = "";
	// Sin entidad y/o ID
	if (!entidad) mensaje = "Falta el dato de la 'entidad'";
	if (!prodID) mensaje = "Falta el dato del 'ID'";
	// Entidad inexistente
	let producto = varias.entidadEnSingular(entidad);
	if (!producto && !mensaje) mensaje = "La entidad ingresada no es válida";
	// Conclusiones
	if (mensaje) res.render("Errores", {mensaje});
	else next();
};
