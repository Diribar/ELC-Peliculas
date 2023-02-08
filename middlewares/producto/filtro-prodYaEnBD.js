"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesos = require("../../rutas_y_controladores/2.1-Prod-Agregar/PA-FN-Procesos");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables
	let informacion;
	let datos = req.session.datosOriginales
		? req.session.datosOriginales
		: req.cookies.datosOriginales
		? req.cookies.datosOriginales
		: "";
	// Controles
	if (!datos) return res.redirect("/producto/agregar/palabras-clave");
	else if (datos.fuente != "IM") {
		let fuente_id = datos.fuente + "_id";
		let elc_id = await BD_especificas.obtieneELC_id(datos.entidad, {[fuente_id]: datos[fuente_id]});
		if (elc_id) {
			// Links
			let linkAnterior = "/producto/agregar/desambiguar";
			let linkDetalle = "/producto/detalle/?entidad=" + datos.entidad + "&id=" + elc_id;
			// Nombre de la entidad
			let entidadNombre = comp.obtieneEntidadNombre(datos.entidad);
			// Información para el cartel
			informacion = {
				mensajes: [
					"La " + entidadNombre + " ya está en nuestra BD.",
					"Podés ver el detalle haciendo click abajo, en el ícono de 'información'.",
				],
				iconos: [
					{nombre: "fa-circle-left", link: linkAnterior, titulo: "Regresar a 'Desambiguar'"},
					{nombre: "fa-circle-info", link: linkDetalle, titulo: "Ir a la vista Detalle"},
				],
			};
			// Elimina los hallazgos anteriores
			req.session.desambiguar = "";
			// Envía a la vista
			return res.render("CMP-0Estructura", {informacion});
		}
	}

	// Fin
	next();
};
