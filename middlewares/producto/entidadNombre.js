"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");

module.exports = (req, res, next) => {
	// Obtener la entidad
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
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
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
	if (informacion) res.render("MI9-Cartel", {informacion});
	else next();
};
