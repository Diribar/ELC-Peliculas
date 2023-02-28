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
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"}],
		};
	else {
		// Entidad inexistente
		let familia1 = comp.obtieneFamiliaEnSingular(entidad);
		let familia2 = req.baseUrl.slice(1);
		if (!familia1 || familia1 != familia2)
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
