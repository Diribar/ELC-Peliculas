"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let usuario = req.session.usuario;
	let userID = usuario.id;
	let url = req.url.slice(1);
	let codigo = url.slice(0, url.indexOf("/"));
	let haceUnaHora = especificas.haceUnaHora();
	let informacion;
	let linkDetalle = "/producto/detalle/?entidad=" + entidad + "&id=" + prodID;
	// CONTROLES PARA PRODUCTO *******************************************************
	let includes = entidad == "capitulos" ? ["status_registro", "coleccion"] : "status_registro";
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	// Problema1: PRODUCTO NO ENCONTRADO -----------------------------------------
	if (!prodOriginal)
		informacion = {
			mensaje: "Producto no encontrado",
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	else {
		// Problemas VARIOS
		// 1-¿Producto en alguno de los estados 'gr_pend_aprob'?
		if (prodOriginal.status_registro.gr_pend_aprob) {
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
						informacion = {
							mensaje:
								"Expiró el tiempo de edición. Está a disposición de nuestro equipo para su revisión",
							iconos: [
								{
									nombre: "fa-circle-left",
									link: req.session.urlAnterior,
									titulo: "Ir a la vista anterior",
								},
								{
									nombre: "fa-circle-info",
									link: linkDetalle,
									titulo: "Ir a la vista Detalle",
								},
							],
						};
				} else if (codigo == "links") {
					// ¿Producto capturado?
					// Problema3: PRODUCTO CAPTURADO Y APTO PARA SER REVISADO ------
					if (prodOriginal.capturado_en > haceUnaHora) {
						let producto_id = especificas.entidad_id(entidad);
						let links = await BD_genericas.obtenerTodosPorCampos("links_originales", {
							[producto_id]: prodID,
						});
						let cantLinks = links.length;
						if (cantLinks && links[cantLinks - 1].fecha_referencia < haceUnaHora)
							informacion = {
								mensaje:
									"El producto está en revisión. Una vez revisado, podrás acceder a esta vista",
								iconos: [
									{
										nombre: "fa-circle-left",
										link: req.session.urlAnterior,
										titulo: "Ir a la vista anterior",
									},
									{
										nombre: "fa-circle-info",
										link: linkDetalle,
										titulo: "Ir a la vista Detalle",
									},
								],
							};
					}
				}
			} else if (!usuario.rol_usuario.aut_gestion_prod)
				// Problema4: PRODUCTO NO APROBADO ----------------------------------------
				informacion = {
					mensaje:
						"El producto no está aprobado aún para ser mostrado o editado. El status actual es: " +
						prodOriginal.status_registro.nombre,
					iconos: [
						{
							nombre: "fa-circle-left",
							link: req.session.urlAnterior,
							titulo: "Ir a la vista anterior",
						},
					],
				};
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	else next();
};
