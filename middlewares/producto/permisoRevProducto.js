"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Definir variables
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const haceUnaHora = funciones.haceUnaHora();
	const haceDosHoras = funciones.haceDosHoras();
	let informacion;
	// CONTROLES PARA PRODUCTO *******************************************************
	let includes = ["status_registro", "capturado_por"];
	if (entidad == "capitulos") includes.push("coleccion");
	let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	// Problema1: PRODUCTO NO ENCONTRADO ----------------------------------------------
	if (!prodOriginal)
		informacion = {
			mensajes: ["Producto no encontrado"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	else {
		// ¿Producto en alguno de los estados 'gr_pend_aprob'?
		if (prodOriginal.status_registro.gr_pend_aprob) {
			// ------------------------------------------------------------------------
			// Problema2: EL REVISOR NO DEBE REVISAR UN PRODUCTO AGREGADO POR ÉL
			// ¿Creado por el usuario actual?
			let creadoPorElUsuario1 = prodOriginal.creado_por_id == userID;
			let creadoPorElUsuario2 =
				entidad == "capitulos" && prodOriginal.coleccion.creado_por_id == userID;
			if (creadoPorElUsuario1 || creadoPorElUsuario2)
				informacion = {
					mensajes: ["El producto debe ser analizado por otro revisor, no por su creador"],
					iconos: [
						{
							nombre: "fa-circle-left",
							link: req.session.urlAnterior,
							titulo: "Ir a la vista anterior",
						},
						{
							nombre: "fa-spell-check",
							link: "/revision/tablero-de-control",
							titulo: "Ir al 'Tablero de Control' de Revisiones",
						},
					],
				};
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
					informacion = {
						mensajes: [
							"El producto estará disponible para su revisión en " + espera + " " + unidad,
						],
						iconos: [
							{
								nombre: "fa-circle-left",
								link: req.session.urlAnterior,
								titulo: "Ir a la vista anterior",
							},
							{
								nombre: "fa-spell-check",
								link: "/revision/tablero-de-control",
								titulo: "Ir al 'Tablero de Control' de Revisiones",
							},
						],
					};
				// --------------------------------------------------------------------
				else {
					// Definir nuevas variables
					let meses = variables.meses();
					if (prodOriginal.capturado_en)
						var horarioCaptura =
							prodOriginal.capturado_en.getDate() +
							"/" +
							meses[prodOriginal.capturado_en.getMonth()] +
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
						informacion = {
							mensajes: [
								"El producto está en revisión por el usuario " +
									prodOriginal.capturado_por.apodo +
									", desde el " +
									horarioCaptura.slice(0, horarioCaptura.indexOf(" ")) +
									" a las " +
									horarioCaptura.slice(horarioCaptura.indexOf(" ")) +
									"hs",
							],
							iconos: [
								{
									nombre: "fa-circle-left",
									link: req.session.urlAnterior,
									titulo: "Ir a la vista anterior",
								},
								{
									nombre: "fa-spell-check",
									link: "/revision/tablero-de-control",
									titulo: "Ir al 'Tablero de Control' de Revisiones",
								},
							],
						};
					// Problema5: EL USUARIO DEJÓ INCONCLUSA LA REVISIÓN LUEGO DE LA HORA Y NO TRANSCURRIERON AÚN LAS 2 HORAS
					else if (
						prodOriginal.capturado_en < haceUnaHora &&
						prodOriginal.capturado_en > haceDosHoras &&
						prodOriginal.capturado_por_id == userID
					)
						informacion = {
							mensajes: [
								"Esta revisión quedó inconclusa desde un poco antes del " +
									horarioCaptura.slice(0, horarioCaptura.indexOf(" ")) +
									" a las " +
									horarioCaptura.slice(horarioCaptura.indexOf(" ")) +
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
					// SOLUCIONES
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
							datos.capturado_en = funciones.ahora();
						// CAPTURA DEL PRODUCTO
						BD_genericas.actualizarPorId(entidad, prodID, datos);
					}
				}
			}
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	next();
};
