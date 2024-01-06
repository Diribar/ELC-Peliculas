"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id, edicID} = req.query;
	let origen = req.query.origen;
	let entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
	let informacion;

	// 1. Acciones en caso de que exista el 'edicID' en el url
	if (edicID) {
		// Averigua si existe la edicID en la base de datos
		let edicion = await BD_genericas.obtienePorId(entidadEdic, edicID);

		// En caso que no, mensaje de error
		if (!edicion) {
			if (!origen) {
				const {baseUrl} = comp.reqBasePathUrl(req);
				origen = baseUrl == "/revision" ? "TR" : baseUrl == "/rclv" ? "DTR" : "DTP";
			}
			informacion = {
				mensajes: ["No encontramos esa edición."],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen,
						titulo: "Regresar",
					},
				],
			};
		}
	}

	// 2. Acciones en caso de que no exista el 'edicID' en el url
	else {
		// Variables
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const {baseUrl} = comp.reqBasePathUrl(req);
		const revision = baseUrl == "/revision";
		const cola = "?entidad=" + entidad + "&id=" + id + "&origen=" + (origen ? origen : "TR");
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		let edicion;

		if (revision) {
			// Averigua si existe una edicion
			edicion = await BD_genericas.obtienePorCondicion(entidadEdic, {[campo_id]: id});

			// Mensaje si no existe una edición
			if (!edicion) {
				// Acciones si el origen no es revisión
				if (origen != "TR") return res.redirect("/" + familia + "/edicion/" + cola);

				// Mensaje si el origen es revisión
				informacion = {
					mensajes: ["No encontramos ninguna edición para revisar"],
					iconos: [
						{
							nombre: "fa-solid fa-circle-left",
							link: "/inactivar-captura/" + cola,
							titulo: "Entendido",
						},
						{
							nombre: "fa-solid fa-pen",
							link: "/" + familia + "/edicion/" + cola,
							titulo: "Edición",
						},
					],
				};
			}
		} else {
			// Averigua si existe una edicion propia
			const condicion = {[campo_id]: id, editadoPor_id: req.session.usuario.id};
			edicion = await BD_genericas.obtienePorCondicion(entidadEdic, condicion);
		}

		// En caso que exista una edición, redirige incluyendo esa edicID en el url
		if (edicion) return res.redirect(req.originalUrl + "&edicID=" + edicion.id);
	}

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
