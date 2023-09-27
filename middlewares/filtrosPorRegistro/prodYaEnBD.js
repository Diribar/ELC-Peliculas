"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const datos = req.session.datosOriginales
		? req.session.datosOriginales
		: req.cookies.datosOriginales
		? req.cookies.datosOriginales
		: "";
	let informacion;

	// Controles
	if (!datos)
		informacion = {
			mensajes: ["No podemos identificar la película.", "Necesitamos que retrocedas un paso"],
			iconos: [variables.vistaEntendido(req.session.urlAnterior)],
		};
	else if (datos.fuente != "IM") {
		const fuente_id = datos.fuente + "_id";
		const elc_id = await BD_especificas.obtieneELC_id(datos.entidad, {[fuente_id]: datos[fuente_id]});
		if (elc_id) {
			// Links
			const linkAnterior = "/producto/agregar/desambiguar";
			const linkDetalle = "/producto/detalle/?entidad=" + datos.entidad + "&id=" + elc_id;

			// Nombre de la entidad
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(datos.entidad);

			// Información para el cartel
			informacion = {
				mensajes: [
					"La " + entidadNombre + " ya está en nuestra BD.",
					"Podés ver el detalle, con el ícono de abajo a la derecha",
				],
				iconos: [
					{nombre: "fa-circle-left", link: linkAnterior, titulo: "Regresar a 'Desambiguar'"},
					{nombre: "fa-circle-info", link: linkDetalle, titulo: "Ir a la vista Detalle"},
				],
			};

			// Elimina los hallazgos anteriores
			req.session.desambiguar = "";
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
