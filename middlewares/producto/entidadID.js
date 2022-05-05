"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	// Obtener el ID de la entidad
	let prodID = req.query.id;
	// Verificar los datos
	let informacion;
	if (!prodID)
		informacion = {
			mensajes: ["Falta el dato del 'ID'"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	// Conclusiones
	if (informacion) res.render("Errores", {informacion});
	else next();
};
