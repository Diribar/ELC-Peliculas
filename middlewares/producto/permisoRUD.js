"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let usuario = req.session.usuario;
	let userID = usuario.id;
	let url = req.url.slice(1);
	let codigo = url.slice(0, url.indexOf("/"));
	let haceUnaHora = funciones.haceUnaHora();
	let informacion;
	let linkDetalle = "/producto/detalle/?entidad=" + entidad + "&id=" + prodID;
	// CONTROLES PARA PRODUCTO *******************************************************
	let includes = entidad == "capitulos" ? ["status_registro", "coleccion"] : "status_registro";
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);

	// PROBLEMA 1: Registro no encontrado
	if (!prodOriginal) {
		informacion = {
			mensajes: ["Producto no encontrado"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	} else {
		// REGISTRO ENCONTRADO
		// FOCO SOLAMENTE EN 'EDICIÓN' Y 'LINKS'
		if (codigo == "edicion" || codigo == "links") {
			// FOCO EN STATUS APROBADO
			if (prodOriginal.status_registro.aprobado) {
				// PROBLEMAS DE CAPTURA
				// PROBLEMA 2: El registro está capturado por otro usuario en forma 'activa'
				if (
					registro.capturado_en > haceUnaHora &&
					registro.capturado_por_id != userID &&
					registro.captura_activa
				) {
					informacion = {
						mensajes: [
							"El registro está en revisión por el usuario " +
								registro.capturado_por.apodo +
								", desde el " +
								horarioString.slice(0, horarioString.indexOf(" ")) +
								" a las " +
								horarioString.slice(horarioString.indexOf(" ")) +
								"hs",
						],
						iconos: [
							{
								nombre: "fa-circle-left",
								link: req.session.urlAnterior,
								titulo: "Ir a la vista anterior",
							},
							{
								nombre: "fa-house",
								link: "/",
								titulo: "Ir al 'Inicio'",
							},
						],
					};
				}
				// PROBLEMA 3: El usuario dejó inconclusa la revisión luego de la hora y no transcurrieron aún las 2 horas
				else if (
					registro.capturado_en < haceUnaHora &&
					registro.capturado_en > haceDosHoras &&
					registro.capturado_por_id == userID
				) {
					informacion = {
						mensajes: [
							"Esta revisión quedó inconclusa desde un poco antes del " +
								horarioString.slice(0, horarioString.indexOf(" ")) +
								" a las " +
								horarioString.slice(horarioString.indexOf(" ")) +
								"hs.. ",
							"Quedó a disposición de que lo continúe revisando otra persona.",
							"Si nadie lo revisa hasta 2 horas después de ese horario, podrás volver a revisarlo.",
						],
						iconos: [
							{
								nombre: "fa-spell-check",
								link: "/revision/tablero-de-control",
								titulo: "Ir al 'Tablero de Control' de Revisiones",
							},
						],
					};
				}
				// EL USUARIO PUEDE CAPTURAR EL REGISTRO --> SOLUCIONES
				// 1. Activar si no lo está, de lo contrario no hace nada
				else if (
					!registro.captura_activa ||
					registro.capturado_por_id != userID ||
					registro.capturado_en < haceDosHoras
				) {
					let datos = {captura_activa: 1};
					// 2. Cambiar de usuario si estaba capturado por otro
					if (registro.capturado_por_id != userID) datos.capturado_por_id = userID;
					// 3. Fijarle la nueva hora de captura si corresponde
					if (registro.capturado_por_id != userID || registro.capturado_en < haceDosHoras)
						datos.capturado_en = funciones.ahora();
					// CAPTURA DEL REGISTRO
					BD_genericas.actualizarPorId(entidad, prodID, datos);
				}
			}
			// FOCO EN STATUS CREADO
			if (prodOriginal.status_registro.creado) {
				// FOCO EN SU CREADOR
				// PROBLEMA 2: expiró la ventana de 1 hora
				// ¿Creado por el usuario actual?
				let creadoPorElUsuario1 = prodOriginal.creado_por_id == userID;
				let creadoPorElUsuario2 =
					entidad == "capitulos" && prodOriginal.coleccion.creado_por_id == userID;
				if (creadoPorElUsuario1 || creadoPorElUsuario2) {
					// ¿Creado < haceUnaHora?
					if (prodOriginal.creado_en < haceUnaHora)
						informacion = {
							mensajes: [
								"Expiró el tiempo de edición.",
								"Está a disposición de nuestro equipo para su revisión.",
							],
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
				// FOCO EN OTRA PERSONA
				// PROBLEMA 3: en este status, un usuario que no sea su creador no tiene permiso para acceder
				else {
					// No se puede acceder en este status
					informacion = {
						mensajes: [
							"El producto todavía no está aprobado.",
							"Está a disposición de nuestro equipo para su revisión.",
							"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
						],
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
			// FOCO EN STATUS ALTA-APROBADA
			if (prodOriginal.status_registro.alta_aprob) {
				// FOCO EN LINKS
				// PROBLEMA 4: en este status, nadie tiene permiso para acceder
				if (codigo == "links") {
					// No se puede acceder en este status
					informacion = {
						mensajes: [
							"El producto todavía no está aprobado.",
							"Está a disposición de nuestro equipo para su revisión.",
							"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
						],
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
				// FOCO EN EDICIÓN
				if (codigo == "edicion") {
					// FOCO EN NO REVISORES
					// PROBLEMA 5: en este status, sólo los revisores pueden acceder
					if (!usuario.rol_usuario.aut_gestion_prod) {
						// No se puede acceder en este status
						informacion = {
							mensajes: [
								"El producto todavía no está aprobado.",
								"Está a disposición de nuestro equipo para su revisión.",
								"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
							],
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
					// FOCO EN REVISORES
					// PROBLEMAS DE CAPTURA
					else {
						// PROBLEMA 6: El registro está capturado por otro usuario en forma 'activa'
						if (
							registro.capturado_en > haceUnaHora &&
							registro.capturado_por_id != userID &&
							registro.captura_activa
						) {
							informacion = {
								mensajes: [
									"El registro está en revisión por el usuario " +
										registro.capturado_por.apodo +
										", desde el " +
										horarioString.slice(0, horarioString.indexOf(" ")) +
										" a las " +
										horarioString.slice(horarioString.indexOf(" ")) +
										"hs",
								],
								iconos: [
									{
										nombre: "fa-circle-left",
										link: req.session.urlAnterior,
										titulo: "Ir a la vista anterior",
									},
									{
										nombre: "fa-house",
										link: "/",
										titulo: "Ir al 'Inicio'",
									},
								],
							};
						}
						// PROBLEMA 7: El usuario dejó inconclusa la revisión luego de la hora y no transcurrieron aún las 2 horas
						else if (
							registro.capturado_en < haceUnaHora &&
							registro.capturado_en > haceDosHoras &&
							registro.capturado_por_id == userID
						) {
							informacion = {
								mensajes: [
									"Esta revisión quedó inconclusa desde un poco antes del " +
										horarioString.slice(0, horarioString.indexOf(" ")) +
										" a las " +
										horarioString.slice(horarioString.indexOf(" ")) +
										"hs.. ",
									"Quedó a disposición de que lo continúe revisando otra persona.",
									"Si nadie lo revisa hasta 2 horas después de ese horario, podrás volver a revisarlo.",
								],
								iconos: [
									{
										nombre: "fa-spell-check",
										link: "/revision/tablero-de-control",
										titulo: "Ir al 'Tablero de Control' de Revisiones",
									},
								],
							};
						}
						// EL USUARIO PUEDE CAPTURAR EL REGISTRO
						// SOLUCIONES
						// 1. Activar si no lo está, de lo contrario no hace nada
						else if (
							!registro.captura_activa ||
							registro.capturado_por_id != userID ||
							registro.capturado_en < haceDosHoras
						) {
							let datos = {captura_activa: 1};
							// 2. Cambiar de usuario si estaba capturado por otro
							if (registro.capturado_por_id != userID) datos.capturado_por_id = userID;
							// 3. Fijarle la nueva hora de captura si corresponde
							if (registro.capturado_por_id != userID || registro.capturado_en < haceDosHoras)
								datos.capturado_en = funciones.ahora();
							// CAPTURA DEL REGISTRO
							BD_genericas.actualizarPorId(entidad, prodID, datos);
						}
					}
				}
			} else {
				// Mensaje para Inactivos
			}
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	else next();
};
