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
		const rutasStd = ["/crud/", familia1];
		const rutasPorFamilia = {
			producto: [...rutasStd, "/links/"],
			rclv: [...rutasStd],
		};
		if (
			!familia1 || // la entidad no pertenece a una familia
			!rutasPorFamilia[familia1].some((n) => familia2.includes(n)) // la familia no está presente en el url
		)
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
	console.log(40, informacion,!!informacion);
	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
