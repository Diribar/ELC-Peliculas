"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const haceUnaHora = especificas.haceUnaHora();
	const haceDosHoras = especificas.haceDosHoras();
	let mensaje;
	// CONTROLES PARA PRODUCTO *******************************************************
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
		"status_registro",
		"capturado_por",
	]);
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
					// Creado < haceUnaHora
					// ----------------------------------------------------------------
					let horarioCaptura;
					let meses = ["ene", "feb", "mar", "abr", "may", "jun"];
					meses.push("jul", "ago", "sep", "oct", "nov", "dic");
					if (prodOriginal.capturado_en)
						horarioCaptura =
							prodOriginal.capturado_en.getDate() +
							"/" +
							meses[prodOriginal.capturado_en.getUTCMonth()] +
							" " +
							prodOriginal.capturado_en.getHours() +
							":" +
							String(prodOriginal.capturado_en.getMinutes()).padStart(2, "0");
					// Capturado > haceUnaHora
					if (prodOriginal.capturado_en > haceUnaHora) {
						// Problema4: EL PRODUCTO ESTÁ CAPTURADO POR OTRO USUARIO
						if (prodOriginal.capturado_por_id != userID)
							mensaje =
								"El producto está en revisión por el usuario " +
								prodOriginal.capturado_por.apodo +
								", desde las " +
								horarioCaptura +
								"hs";
					} else {
						// No capturado o capturado < haceUnaHora
						// Problema5: EL USUARIO DEJÓ CAPTURADO ESTE PRODUCTO LUEGO DE LA HORA Y NO TRANSCURRIERON AÚN LAS 2 HORAS
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
								capturado_en: especificas.ahora(),
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
