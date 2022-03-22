"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	let url = req.url.slice(1);
	let codigo = url.slice(0, url.indexOf("/"));
	let haceUnaHora = especificas.haceUnaHora();
	let mensaje;
	// CONTROLES PARA PRODUCTO *******************************************************
	let includes = ["status_registro"];
	if (entidad == "capitulos") includes.push("coleccion");
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	// Problema1: PRODUCTO NO ENCONTRADO -----------------------------------------
	if (!prodOriginal) mensaje = "Producto no encontrado";
	else {
		// Problemas VARIOS
		// 1-¿Producto en estado 'pend_aprobar'?
		if (prodOriginal.status_registro.pend_aprobar) {
			// 2-¿Creado por el usuario actual?
			let creadoPorElUsuario1 = prodOriginal.creado_por_id == userID;
			let creadoPorElUsuario2 =
				entidad == "capitulos" && prodOriginal.coleccion.creado_por_id == userID;
			if (creadoPorElUsuario1 || creadoPorElUsuario2) {
				// 3-¿La vista es "Edición"?
				if (codigo == "edicion") {
					// 4-¿Creado < haceUnaHora?
					// Problema2: TIEMPO DE EDICIÓN CUMPLIDO ---------------------------------
					if (prodOriginal.creado_en < haceUnaHora)
						mensaje =
							"Expiró el tiempo de edición. Está a disposición de nuestro equipo para su revisión";
				} else if (codigo == "links") {
					// ¿Producto capturado?
					// Problema3: PRODUCTO CAPTURADO Y APTO PARA SER REVISADO ------
					if (prodOriginal.capturado_en > haceUnaHora) {
						let entidad_id = especificas.entidad_id(prodEntidad);
						let links = await BD_genericas.obtenerTodosPorCampo(
							"links_originales",
							entidad_id,
							prodID
						);
						let cantLinks = links.length;
						if (cantLinks && links[cantLinks - 1].fecha_referencia < haceUnaHora)
							mensaje =
								"El producto está en revisión. Una vez revisado, podrás acceder a esta vista";
					}
				}
			}
			// Problema4: PRODUCTO NO APROBADO ----------------------------------------
			else
				mensaje =
					"El producto no está aprobado aún para ser mostrado o editado. El status actual es: " +
					prodOriginal.status_registro.nombre;
		}
	}
	// Fin
	if (mensaje) return res.render("Errores", {mensaje});
	else next();
};
