"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {baseUrl, siglaFam, entidad} = comp.partesDelUrl(req);
	const {id, edicId} = req.query;
	let {origen} = req.query;
	let entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
	let informacion;

	// Acciones en caso de que no exista el 'edicId' en el url
	if (!edicId) {
		// Variables
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const revision = baseUrl == "/revision";
		const cola = "/?id=" + id + "&origen=" + (origen ? origen : "TE");
		const vistaAnterior = variables.vistaAnterior("/" + entidad + "/inactivar-captura" + cola);
		let edicion;

		if (revision) {
			// Averigua si existe una edicion
			edicion = await baseDeDatos.obtienePorCondicion(entidadEdic, {[campo_id]: id});

			// Mensaje si no existe una edición
			if (!edicion) {
				// Acciones si el origen no es revisión
				if (origen != "TE") return res.redirect("/" + entidad + "/edicion/" + siglaFam + cola);

				// Mensaje si el origen es revisión
				informacion = {
					mensajes: ["No encontramos ninguna edición para revisar"],
					iconos: [
						vistaAnterior,
						{
							clase: iconos.faSolid + " " + iconos.edicion,
							link: "/" + entidad + "/edicion/" + siglaFam + cola,
							titulo: "Edición",
						},
					],
				};
			}
		} else {
			// Averigua si existe una edicion propia
			const condicion = {[campo_id]: id, editadoPor_id: req.session.usuario.id};
			edicion = await baseDeDatos.obtienePorCondicion(entidadEdic, condicion);
		}

		// En caso que exista una edición, redirige incluyendo esa edicId en el url
		if (edicion) return res.redirect(req.originalUrl + "&edicId=" + edicion.id);
	}

	// Acciones en caso de que exista el 'edicId' en el url
	if (edicId) {
		// Averigua si existe la edicId en la base de datos
		const edicion = await baseDeDatos.obtienePorId(entidadEdic, edicId);

		// En caso que no, mensaje de error
		if (!edicion) {
			// Acciones si no tiene origen
			if (!origen) origen = baseUrl == "/revision" ? "TE" : "DT";

			// Información
			const link = "/" + entidad + "/inactivar-captura/?id=" + id + "&origen=" + origen;
			const vistaAnterior = variables.vistaAnterior(link);
			informacion = {mensajes: ["No encontramos esa edición."], iconos: [vistaAnterior]};
		}
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
