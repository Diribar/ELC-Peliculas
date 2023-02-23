"use strict";
// Requires
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id, edicion_id: edicID} = req.query;
	let informacion;

	// 1. Acciones en caso de que exista el 'edicID'
	if (edicID) {
		// Obtiene la entEdicion
		let entEdicion = comp.obtienePetitFamiliaDesdeEntidad(entidad) + "_edicion";

		// Averigua si existe la edicID en la base de datos
		let edicion = await BD_genericas.obtienePorId(entEdicion, edicID);

		// En caso que no, mensaje de error
		if (!edicion)
			informacion = {
				mensajes: ["No encontramos esa edición.", "Te sugerimos que regreses al tablero y lo vuelvas a intentar"],
				iconos: [
					{
						nombre: "fa-spell-check ",
						link: "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=tableroEnts",
						titulo: "Regresar al Tablero de Control",
					},
				],
			};
	}

	// 2. Acciones en caso de que no exista el 'edicID'
	else {
		// 3. Averigua si existe una edicion ajena
		let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		let datos = {campo_id, entID: id, userID: req.session.usuario.id};
		let ediciones = await BD_especificas.obtieneEdicsAjenasDeUnProd(entidad, datos);

		// 2.1. En caso que exista, redirige incluyendo esa edicID en el url
		if (ediciones.length) return res.redirect(req.originalUrl + "&edicion_id=" + ediciones[0].id);
		// 2.2. En caso que no exista, mensaje de error
		else
			informacion = {
				mensajes: ["No encontramos ninguna edición ajena para revisar"],
				iconos: [
					{
						nombre: "fa-spell-check ",
						link: "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=tableroEnts",
						titulo: "Regresar al Tablero de Control",
					},
				],
			};
	}

	// Conclusiones
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
