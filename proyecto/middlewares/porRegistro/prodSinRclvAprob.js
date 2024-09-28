"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.params.entidad ? req.params.entidad : req.baseUrl.slice(1);
	const {id: entId, origen} = req.query;
	const asocRclvs = variables.entidades.asocRclvs;
	const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
	const condicion = {[campo_id]: entId};
	const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
	const ea = comp.obtieneDesdeEntidad.ea(entidad);

	// Obtiene la prodEdicion con sus RCLV
	const edicion = await baseDeDatos.obtienePorCondicion("prodsEdicion", condicion, asocRclvs);

	// Si alguno de sus RCLV está en status creado, genera la información
	if (edicion)
		for (let asocRclv of asocRclvs)
			if (edicion[asocRclv] && edicion[asocRclv].statusRegistro_id == creado_id) {
				// Variables
				const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
				const rclv = {
					entidad: comp.obtieneDesdeAsoc.entidad(asocRclv),
					id: edicion[asocRclv].id,
					entidadNombre: comp.obtieneDesdeAsoc.entidadNombre(asocRclv).toLowerCase(),
					a: comp.obtieneDesdeAsoc.a(asocRclv),
					oa: comp.obtieneDesdeAsoc.oa(asocRclv),
				};

				// Obtiene la vista siguiente
				let urlSiguiente = "/revision/rclv/alta/?entidad=" + rclv.entidad + ("&id=" + rclv.id);
				urlSiguiente += "&prodEntidad=" + entidad + "&prodId=" + entId + (origen ? "&origen=" + origen : "");
				const vistaSiguiente = variables.vistaSiguiente(urlSiguiente);

				// Genera la información
				const informacion = {
					mensajes: [
						"Est" +
							(ea + " " + entidadNombre) +
							(" está vinculada con un" + rclv.a + " ") +
							(rclv.entidadNombre + " pendiente de revisar."),
						"Si querés revisarl" + rclv.oa + ", elegí el ícono de la derecha.",
					],
					iconos: [vistaAnterior, vistaSiguiente],
				};

				// Redirecciona
				return res.render("CMP-0Estructura", {informacion});
			}

	// Fin
	return next();
};
