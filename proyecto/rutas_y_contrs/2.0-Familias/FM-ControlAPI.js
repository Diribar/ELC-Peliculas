"use strict";
// Variables
const procesos = require("./FM-FN-Procesos");

module.exports = {
	// Tridente: Detalle - Edición del Producto - Links
	obtieneInfo: (req, res) => {
		// Variables
		const {entidad} = req.query;
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

		// Obtiene los motivos
		const motivos = statusMotivos.filter((m) => m[petitFamilias]);

		// Fin
		return res.json({motivos, largoComentario});
	},
	obtieneRegistro: async (req, res) => {
		const {entidad, id} = req.query;
		const registro = await baseDeDatos.obtienePorId(entidad, id);
		return res.json(registro);
	},
	altaBajaLinks: async (req, res) => {
		// Variables
		const {url} = req.query;
		const link = await baseDeDatos.obtienePorCondicion("links", {url}, variables.entidades.asocProds);

		// Más variables
		const datos = procesos.links.variables({link, req});
		const {id, statusRegistro_id, statusCreado, decisAprob, datosLink, campoDecision} = datos;
		const {motivo_id, revId, statusOriginalPor_id, statusOriginal_id, statusFinal_id} = datos;

		// CONSECUENCIAS - Actualiza el registro del link
		await baseDeDatos.actualizaPorId("links", id, datosLink);

		// CONSECUENCIAS - Acciones si no es un 'creadoAprob' convertido en 'aprobado'
		if (statusOriginal_id != creadoAprob_id || statusFinal_id != aprobado_id) {
			// Agrega un registro en el statusHistorial
			let datosHist = {
				entidad_id: id,
				entidad: "links",
				statusOriginal_id: link.statusRegistro_id,
				statusFinal_id: statusRegistro_id,
				statusOriginalPor_id,
				statusFinalPor_id: revId,
				statusOriginalEn: statusCreado ? link.creadoEn : link.statusSugeridoEn,
				aprobado: decisAprob,
			};
			let motivo;
			if (motivo_id) {
				motivo = statusMotivos.find((n) => n.id == motivo_id);
				datosHist.motivo_id = motivo_id;
				datosHist.duracion = Number(motivo.duracion);
				datosHist.comentario = motivo.descripcion;
			}
			baseDeDatos.agregaRegistro("statusHistorial", datosHist);

			// Aumenta el valor de linksAprob/rech en el registro del usuario
			baseDeDatos.aumentaElValorDeUnCampo("usuarios", statusOriginalPor_id, campoDecision, 1);

			// Penaliza al usuario si corresponde
			if (motivo) comp.penalizacAcum(statusOriginalPor_id, motivo, "links");
		}

		// CONSECUENCIAS - Actualiza los productos en los campos de 'links'
		await validacsFM.accionesPorCambioDeStatus("links", {...link, statusRegistro_id});

		// Fin
		return res.json("");
	},
};
