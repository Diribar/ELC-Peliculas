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
	let includes = ["status_registro", "capturado_por"];
	if (entidad == "capitulos") includes.push("coleccion");
	let registro = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	let capturado_en = registro.capturado_en;
	if (capturado_en) capturado_en.setSeconds(0);

	// Funciones
	let horarioInicio, horarioFinal;
	let horarioTexto = (horario) => {
		return (
			horario.getDate() +
			"/" +
			meses[horario.getMonth()] +
			" " +
			horario.getHours() +
			":" +
			String(horario.getMinutes()).padStart(2, "0")
		);
	};

	// Detectar los problemas
	// PROBLEMA 1: Registro no encontrado ----------------------------------------------
	if (!registro)
		informacion = {
			mensajes: ["Registro no encontrado"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	else {
		// REGISTRO ENCONTRADO
		// PROBLEMA 2: El revisor no debe revisar un registro creado por sí mismo
		// ¿Creado por el usuario actual?
		let creadoPorElUsuario1 = registro.creado_por_id == userID;
		let creadoPorElUsuario2 = entidad == "capitulos" && registro.coleccion.creado_por_id == userID;
		if (creadoPorElUsuario1 || creadoPorElUsuario2)
			informacion = {
				mensajes: ["El registro debe ser analizado por otro revisor, no por su creador"],
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
		else {
			// REGISTRO ENCONTRADO + CREADO POR OTRO USUARIO
			// PROBLEMA 3: El registro todavía está en manos de su creador
			// ¿Creado > haceUnaHora?
			let espera = parseInt((registro.creado_en - haceUnaHora) / 1000);
			let unidad = espera > 60 ? "minutos" : "segundos";
			if (espera > 60) espera = parseInt(espera / 60);
			if (espera > 0)
				informacion = {
					mensajes: ["El registro estará disponible para su revisión en " + espera + " " + unidad],
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
				// REGISTRO ENCONTRADO + CREADO POR OTRO USUARIO + APTO PARA SER REVISADO
				// Definir nuevas variables
				if (capturado_en) {
					horarioInicial = new Date(capturado_en)
					// Configurar el horario final
					horarioFinal = horarioInicial;
					horarioFinal.setHours(horarioInicio.getHours() + 1);
					// Convertir a string
					horarioInicio = horarioTexto(horarioInicio);
					horarioFinal = horarioTexto(horarioFinal);
				}
				// PROBLEMA 4: El registro está capturado por otro usuario en forma 'activa'
				if (
					capturado_en > haceUnaHora &&
					registro.capturado_por_id != userID &&
					registro.captura_activa
				)
					informacion = {
						mensajes: [
							"El registro está en revisión por el usuario " +
								registro.capturado_por.apodo +
								", desde el " +
								horarioInicio.slice(0, horarioInicio.indexOf(" ")) +
								" a las " +
								horarioInicio.slice(horarioInicio.indexOf(" ")) +
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
				// REGISTRO ENCONTRADO + CREADO POR OTRO USUARIO + APTO PARA SER REVISADO + NO CAPTURADO POR OTRO USUARIO
				// PROBLEMA 5: El usuario dejó inconclusa la revisión luego de la hora y no transcurrieron aún las 2 horas
				else if (
					capturado_en < haceUnaHora &&
					capturado_en > haceDosHoras &&
					registro.capturado_por_id == userID
				) {
					informacion = {
						mensajes: [
							"Esta revisión quedó inconclusa desde el " +
								horarioFinal.slice(0, horarioFinal.indexOf(" ")) +
								" a las " +
								horarioFinal.slice(horarioFinal.indexOf(" ")) +
								"hs.. ",
							"Quedó a disposición de que lo continúe revisando otra persona.",
							"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás volver a revisarlo.",
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
					capturado_en < haceDosHoras
				) {
					let datos = {captura_activa: 1};
					// 2. Cambiar de usuario si estaba capturado por otro
					if (registro.capturado_por_id != userID) datos.capturado_por_id = userID;
					// 3. Fijarle la nueva hora de captura si corresponde
					if (registro.capturado_por_id != userID || capturado_en < haceDosHoras)
						datos.capturado_en = funciones.ahora();
					// CAPTURA DEL REGISTRO
					BD_genericas.actualizarPorId(entidad, prodID, datos);
				}
			}
		}

		// Problema 3: ¿Registro en status 'aprobado'?
		if (registro.status_registro.aprobado) {
			// Problema 3.1: EL REVISOR NO DEBE REVISAR UN REGISTRO AGREGADO O EDITADO POR ÉL
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	next();
};
