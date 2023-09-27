"use strict";

module.exports = (req, res, next) => {
	// Variables
	let entidad = req.query.entidad;
	let informacion;

	// Verifica los datos
	if (!entidad)
		informacion = {
			mensajes: ["Falta el dato de la 'entidad'"],
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"}],
		};
	else {
		// Entidad inexistente
		const familia1 = comp.obtieneDesdeEntidad.familia(entidad);
		const familia2 = req.baseUrl + req.path;
		const rutasPorFamilia = {
			producto: ["/links/", "/crud/", familia1],
			rclv: ["/crud/", familia1],
		};
		if (!familia1 || !rutasPorFamilia[familia1].some((n) => familia2.includes(n) || familia2.startsWith(n)))
			informacion = {
				mensajes: ["La entidad ingresada es inválida."],
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
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
