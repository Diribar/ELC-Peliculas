"use strict";
const procsFM = require("../../rutas_y_contrs/2.0-Familias/FM-FN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.query;
	let elLa = comp.obtieneDesdeEntidad.elLa(entidad).trim();
	const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
	elLa = comp.letras.inicialMayus(elLa);
	let informacion;

	// Compara los status
	const {statusAlineado, prodRclv, ultHist} = await procsFM.statusAlineado({entidad, id});
	if (statusAlineado) {
		// Variables
		const {urlAnterior} = req.session;
		const nombre = comp.nombresPosibles(prodRclv);

		// Información
		informacion = {
			mensajes: [
				elLa + " " + entidadNombre + " <em><u>" + nombre + "</u></em> no tiene diferencias de status entre sus registros",
			],
			iconos: [variables.vistaAnterior(urlAnterior)],
		};
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else req.body = {...req.body, prodRclv, ultHist};
	return next();
};
