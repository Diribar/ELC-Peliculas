"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");

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
				const baseUrl = req.baseUrl;
				origen = baseUrl == "/revision" ? "TE" : baseUrl == "/rclv" ? "DTR" : "DTP";
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
		let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let revision = req.baseUrl == "/revision";
		let edicion;

		if (revision) {
			// Averigua si existe una edicion ajena
			let datos = {campo_id, entID: id, userID: req.session.usuario.id};
			edicion = await BD_especificas.obtieneEdicionAjena(entidadEdic, datos);
			if (!edicion)
				informacion = {
					mensajes: ["No encontramos ninguna edición ajena para revisar"],
					iconos: [
						{
							nombre: "fa-spell-check ",
							link: "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=TE",
							titulo: "Regresar al Tablero de Control",
						},
					],
				};
		} else {
			// Averigua si existe una edicion propia
			let objeto = {[campo_id]: id, editado_por_id: req.session.usuario.id};
			edicion = await BD_genericas.obtienePorCondicion(entidadEdic, objeto);
		}

		// En caso que exista una edición, redirige incluyendo esa edicID en el url
		if (edicion) return res.redirect(req.originalUrl + "&edicID=" + edicion.id);
	}

	// Conclusiones
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
