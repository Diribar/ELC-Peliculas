"use strict";
// Requires
const varias = require("../../funciones/Varias/Varias");
const BD_varias = require("../../funciones/BD/Varias");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	let url = req.url.slice(1);
	let codigo = url.slice(0, url.indexOf("/"));
	let haceUnaHora = varias.haceUnaHora();
	let mensaje = "";
	// CONTROLES PARA PRODUCTO *******************************************************
	let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, [
		"status_registro",
		"capturado_por",
	]).then((n) => (n ? n.toJSON() : ""));
	// Problema1: PRODUCTO NO ENCONTRADO ----------------------------------------------
	if (!prodOriginal) mensaje = "Producto no encontrado";
	else {
		// Problemas VARIOS
		// 1-¿Producto en estado 'pend_aprobar'?
		if (prodOriginal.status_registro.pend_aprobar) {
			// 2-¿Creado por el usuario actual?
			let creadoPorElUsuario1 = prodOriginal.creado_por_id == userID;
			let creadoPorElUsuario2 =
				entidad != "capitulos" ||
				(entidad == "capitulos" && prodOriginal.coleccion.creado_por_id != userID);
			// Problema2: EL REVISOR NO DEBE REVISAR UN PRODUCTO AGREGADO POR ÉL ------
			if (creadoPorElUsuario1 || creadoPorElUsuario2)
				mensaje = "El producto debe ser analizado por otro revisor, no por su creador";
			else {
				// Creado por otro usuario
				// 3. ¿Creado > haceUnaHora?
				let espera = parseInt((prodOriginal.creado_en - haceUnaHora) / 1000);
				let unidad = espera <= 60 ? "segundos" : "minutos";
				if (espera > 60) espera = parseInt(espera / 60);
				// Problema3: EL PRODUCTO TODAVÍA ESTÁ EN MANOS DE SU CREADOR ---------
				if (espera > 0)
					mensaje = "El producto estará disponible para su revisión en " + espera + " " + unidad;
				else {
					// Creado hace > 1 hora
					// 4. Capturado > haceUnaHora
					if (prodOriginal.capturado_en && prodOriginal.capturado_en > haceUnaHora) {
						// Capturado por otro usuario
						// Problema4: EL PRODUCTO ESTÁ CAPTURADO POR OTRO USUARIO -----
						if (prodOriginal.capturado_por_id != userID) {
							let usuarioCaptura = prodOriginal.capturado_por.apodo;
							let horarioCaptura =
								prodOriginal.capturado_en.getDate() +
								"/" +
								prodOriginal.capturado_en.getMonth() +
								" " +
								prodOriginal.capturado_en.getHours() +
								":" +
								prodOriginal.capturado_en.getMinutes();
							mensaje =
								"El producto está en revisión por el usuario " +
								usuarioCaptura +
								", desde las " +
								horarioCaptura +
								"hs";
						}
					} else {
						// CAPTURA EL PRODUCTO
						let datos = {
							capturado_en: new Date(),
							capturado_por_id: userID,
						};
						BD_varias.actualizarPorId(entidad, prodID, datos);
					}
				}
			}
		}
	}
	// Fin
	if (mensaje) return res.render("Errores", {mensaje});
	next();
};
