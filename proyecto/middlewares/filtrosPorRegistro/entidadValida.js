"use strict";

module.exports = (req, res, next) => {
	// Variables
	const entidad = req.query.entidad;
	let informacion;

	// Verifica los datos
	if (!entidad)
		informacion = {
			mensajes: ["Falta el dato de la 'entidad'"],
			iconos: [{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"}],
		};
	else {
		// Entidad inexistente
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const url = req.baseUrl + req.path;
		const rutasStd = [familia, "/correccion/"];
		const rutasPorFamilia = {
			producto: [...rutasStd, "/links/"],
			rclv: [...rutasStd],
		};
		if (
			!familia || // la entidad no pertenece a una familia
			!rutasPorFamilia[familia].some((n) => url.includes(n)) // la familia no está presente en el url
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
	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
