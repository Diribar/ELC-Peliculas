"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {baseUrl, entidad} = comp.partesDelUrl(req);
	const {id, edicID} = req.query;
	let {origen} = req.query;
	let entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
	let informacion;

	// Acciones en caso de que no exista el 'edicID' en el url
	if (!edicID) {
		// Variables
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const revision = baseUrl == "/revision";
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const cola = entidad + "/?id=" + id + "&origen=" + (origen ? origen : "TE");
		const vistaAnterior = variables.vistaAnterior("/" + entidad + "/inactivar-captura" + cola);
		let edicion;

		if (revision) {
			// Averigua si existe una edicion
			edicion = await baseDeDatos.obtienePorCondicion(entidadEdic, {[campo_id]: id});

			// Mensaje si no existe una edición
			if (!edicion) {
				// Acciones si el origen no es revisión
				if (origen != "TE") return res.redirect("/" + familia + "/edicion/" + cola);

				// Mensaje si el origen es revisión
				informacion = {
					mensajes: ["No encontramos ninguna edición para revisar"],
					iconos: [
						vistaAnterior,
						{
							clase: iconos.faSolid + " " + iconos.edicion,
							link: "/" + familia + "/edicion/" + cola,
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

		// En caso que exista una edición, redirige incluyendo esa edicID en el url
		if (edicion) return res.redirect(req.originalUrl + "&edicID=" + edicion.id);
	}

	// Acciones en caso de que exista el 'edicID' en el url
	if (edicID) {
		// Averigua si existe la edicID en la base de datos
		const edicion = await baseDeDatos.obtienePorId(entidadEdic, edicID);

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
