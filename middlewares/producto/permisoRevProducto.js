"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	let ahora;
	let haceUnaHora = especificas.haceUnaHora();
	let haceDosHoras = especificas.haceDosHoras();
	let mensaje;
	// CONTROLES PARA PRODUCTO *******************************************************
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
		"status_registro",
		"capturado_por",
	]).then((n) => (n ? n.toJSON() : ""));
	// Problema1: PRODUCTO NO ENCONTRADO ----------------------------------------------
	if (!prodOriginal) mensaje = "Producto no encontrado";
	else {
		// ¿Producto en estado 'pend_aprobar'?
		if (prodOriginal.status_registro.pend_aprobar) {
			// ------------------------------------------------------------------------
			// Problema2: EL REVISOR NO DEBE REVISAR UN PRODUCTO AGREGADO POR ÉL
			// ¿Creado por el usuario actual?
			let creadoPorElUsuario1 = prodOriginal.creado_por_id == userID;
			let creadoPorElUsuario2 =
				entidad == "capitulos" && prodOriginal.coleccion.creado_por_id == userID;
			if (creadoPorElUsuario1 || creadoPorElUsuario2)
				mensaje = "El producto debe ser analizado por otro revisor, no por su creador";
			// ------------------------------------------------------------------------
			else {
				// Creado por otro usuario
				// --------------------------------------------------------------------
				// Problema3: EL PRODUCTO TODAVÍA ESTÁ EN MANOS DE SU CREADOR
				// ¿Creado > haceUnaHora?
				let espera = parseInt((prodOriginal.creado_en - haceUnaHora) / 1000);
				let unidad = espera <= 60 ? "segundos" : "minutos";
				if (espera > 60) espera = parseInt(espera / 60);
				if (espera > 0)
					mensaje = "El producto estará disponible para su revisión en " + espera + " " + unidad;
				// --------------------------------------------------------------------
				else {
					// Creado < haceUnaHora>
					// ----------------------------------------------------------------
					// Capturado > haceUnaHora
					let horarioCaptura;
					if (prodOriginal.capturado_en)
						horarioCaptura =
							prodOriginal.capturado_en.getDate() +
							"/" +
							prodOriginal.capturado_en.getMonth() +
							" " +
							prodOriginal.capturado_en.getHours() +
							":" +
							prodOriginal.capturado_en.getMinutes();

					if (prodOriginal.capturado_en > haceUnaHora) {
						// Problema4: EL PRODUCTO ESTÁ CAPTURADO POR OTRO USUARIO
						if (prodOriginal.capturado_por_id != userID) {
							let usuarioCaptura = prodOriginal.capturado_por.apodo;
							mensaje =
								"El producto está en revisión por el usuario " +
								usuarioCaptura +
								", desde las " +
								horarioCaptura +
								"hs";
						}
					} else {
						// No capturado o capturado < haceUnaHora
						// Problema5: EL USUARIO DEJÓ CAPTURADO ESTE PRODUCTO LUEGO DE LA HORA
						// ¿Capturado por este usuario > haceDosHoras?
						if (
							prodOriginal.capturado_en > haceDosHoras &&
							prodOriginal.capturado_por_id == userID
						)
							mensaje =
								"El producto quedó capturado por vos desde las " +
								horarioCaptura +
								"hs.. Podrás volver a capturarlo luego de transcurridas 2 horas desde ese horario.";
						else {
							// Sin problemas: CAPTURA DEL PRODUCTO
							let datos = {
								capturado_en: new Date(),
								capturado_por_id: userID,
							};
							BD_genericas.actualizarPorId(entidad, prodID, datos);
						}
					}
				}
			}
		}
	}
	// Fin
	if (mensaje) return res.render("Errores", {mensaje});
	next();
};
