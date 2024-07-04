"use strict";
const procsFM = require("../../rutas_y_contrs/2.0-Familias/FM-FN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.query;
	let elLa = comp.obtieneDesdeEntidad.elLa(entidad).trim();
	const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
	elLa = comp.letras.inicialMayus(elLa);
	let informacion;

	// Obtiene los registros
	let prodRclv = procsFM.cambioMotivo.prodRclv({entidad, id});
	let ultHist = procsFM.cambioMotivo.ultHist({entidad, id});
	[prodRclv, ultHist] = await Promise.all([prodRclv, ultHist]);

	// Compara los status
	if (prodRclv.statusRegistro_id == ultHist.statusFinal_id) {
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
