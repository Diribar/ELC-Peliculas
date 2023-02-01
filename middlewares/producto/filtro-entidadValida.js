"use strict";
// Requires
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	// Obtiene la entidad
	let entidad = req.query.entidad;
	// Verificar los datos
	let informacion;
	if (!entidad)
		informacion = {
			mensajes: ["Falta el dato de la 'entidad'"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	else {
		// Entidad inexistente
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		if (!prodNombre)
			informacion = {
				mensajes: ["La entidad ingresada es inválida"],
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
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
