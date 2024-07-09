"use strict";
const procsFM = require("../../rutas_y_contrs/2.0-Familias/FM-FN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.query;
	let elLa = comp.obtieneDesdeEntidad.elLa(entidad).trim();
	const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
	const familia = comp.obtieneDesdeEntidad.familia(entidad);
	elLa = comp.letras.inicialMayus(elLa);
	const statusDistinto = req.path == "/correccion/status/";
	const statusIgual = ["/correccion/motivo/", "/" + familia + "/historial/"].includes(req.path);
	let informacion;

	// Compara los status
	const {statusAlineado, prodRclv, ultHist} = await procsFM.statusAlineado({entidad, id});
	if (statusAlineado && statusDistinto) {
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
	} else if (!statusAlineado && statusIgual) {
		// Variables
		const {urlAnterior} = req.session;
		const urlStatus = "/correccion/status/?entidad=" + entidad + "&id=" + id;
		const tituloStatus = "Ir a la vista de Cambio de Status";
		const nombre = comp.nombresPosibles(prodRclv);

		// Información
		informacion = {
			mensajes: [
				elLa + " " + entidadNombre + " <em><u>" + nombre + "</u></em> tiene diferencias de status entre sus registros",
				"Podés volver a la vista anterior o ir a la vista para resolverlo",
			],
			iconos: [variables.vistaAnterior(urlAnterior), {...variables.vistaSiguiente(urlStatus), titulo: tituloStatus}],
		};
	}

	// Si hubo errores, lo avisa
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	// Fin
	else req.body = {...req.body, prodRclv, ultHist, statusAlineado};
	return next();
};
