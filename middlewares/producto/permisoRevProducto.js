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
	let includes = ["status_registro", "capturado_por"];
	if (entidad == "capitulos")	includes.push("coleccion")
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
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
				let unidad = espera > 60 ? "minutos" : "segundos";
				if (espera > 60) espera = parseInt(espera / 60);
				if (espera > 0)
					mensaje = "El producto estará disponible para su revisión en " + espera + " " + unidad;
				// --------------------------------------------------------------------
				else {
					// Definir nuevas variables
					let meses = await BD_genericas.obtenerTodos("meses", "id").then((n) =>
						n.map((m) => m.abrev)
					);
					if (prodOriginal.capturado_en)
						var horarioCaptura =
							prodOriginal.capturado_en.getDate() +
							"/" +
							meses[prodOriginal.capturado_en.getUTCMonth()] +
							" " +
							prodOriginal.capturado_en.getHours() +
							":" +
							String(prodOriginal.capturado_en.getMinutes() + 1).padStart(2, "0");
					// ----------------------------------------------------------------
					// Problema4: EL PRODUCTO ESTÁ CAPTURADO POR OTRO USUARIO EN FORMA 'ACTIVA'
					if (
						prodOriginal.capturado_en > haceUnaHora &&
						prodOriginal.capturado_por_id != userID &&
						prodOriginal.captura_activa
					)
						mensaje =
							"El producto está en revisión por el usuario " +
							prodOriginal.capturado_por.apodo +
							", desde las " +
							horarioCaptura +
							"hs";
					// Problema5: EL USUARIO DEJÓ INCONCLUSA LA REVISIÓN LUEGO DE LA HORA Y NO TRANSCURRIERON AÚN LAS 2 HORAS
					else if (
						prodOriginal.capturado_en < haceUnaHora &&
						prodOriginal.capturado_en > haceDosHoras &&
						prodOriginal.capturado_por_id == userID
					)
						mensaje =
							"Tu revisión de este producto quedó inconclusa desde un poco antes de las " +
							horarioCaptura +
							"hs.. Podrás volver a revisarlo luego de transcurridas 2 horas desde ese horario.";
					// Comienzo de las soluciones
					// 1. Activar si no lo está, de lo contrario no hace nada
					else if (
						!prodOriginal.captura_activa ||
						prodOriginal.capturado_por_id != userID ||
						prodOriginal.capturado_en < haceDosHoras
					) {
						let datos = {captura_activa: 1};
						// 2. Cambiar de usuario si estaba capturado por otro
						if (prodOriginal.capturado_por_id != userID) datos.capturado_por_id = userID;
						// 3. Fijarle la nueva hora de captura si corresponde
						if (
							prodOriginal.capturado_por_id != userID ||
							prodOriginal.capturado_en < haceDosHoras
						)
							datos.capturado_en = especificas.ahora();
						// CAPTURA DEL PRODUCTO
						BD_genericas.actualizarPorId(entidad, prodID, datos);
					}
				}
			}
		}
	}
	// Fin
	if (mensaje) return res.render("Errores", {mensaje});
	next();
};
