"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const haceUnaHora = funciones.haceUnaHora();
	const haceDosHoras = funciones.haceDosHoras();
	let informacion;
	// Variables - Registro
	let includes = ["status_registro", "capturado_por"];
	if (entidad == "capitulos") includes.push("coleccion");
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	let creado_en = registro.creado_en;
	if (creado_en) creado_en.setSeconds(0);
	let capturado_en = registro.capturado_en;
	capturado_en.setSeconds(0);
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaTablero = variables.vistaTablero();

	// Detectar los problemas
	// PROBLEMA 1: Registro no encontrado ----------------------------------------------
	if (!registro)
		informacion = {
			mensajes: ["Registro no encontrado"],
			iconos: [vistaAnterior],
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
				iconos: [vistaAnterior, vistaTablero],
			};
		else {
			// REGISTRO ENCONTRADO + CREADO POR OTRO USUARIO
			// DETECTAR PROBLEMAS DE CAPTURA
			// Configurar el horario inicial
			let horarioInicial = new Date(capturado_en);
			// Configurar el horario final
			let horarioFinal = horarioInicial;
			horarioFinal.setHours(horarioInicial.getHours() + 1);
			// Configurar los horarios con formato texto
			horarioInicial = funciones.horarioTexto(horarioInicial);
			horarioFinal = funciones.horarioTexto(horarioFinal);
			// PROBLEMA 1: El registro está capturado por otro usuario en forma 'activa'
			if (capturado_en > haceUnaHora && registro.capturado_por_id != userID && registro.captura_activa)
				informacion = {
					mensajes: [
						"El registro está en revisión por el usuario " +
							registro.capturado_por.apodo +
							", desde el " +
							horarioInicial,
					],
					iconos: [vistaAnterior, vistaTablero],
				};
			// REGISTRO ENCONTRADO + CREADO POR OTRO USUARIO + APTO PARA SER REVISADO + NO CAPTURADO POR OTRO USUARIO
			// PROBLEMA 2: El usuario dejó inconclusa la revisión luego de la hora y no transcurrieron aún las 2 horas
			else if (
				capturado_en < haceUnaHora &&
				capturado_en > haceDosHoras &&
				registro.capturado_por_id == userID
			) {
				informacion = {
					mensajes: [
						"Esta revisión quedó inconclusa desde el " + horarioFinal,
						"Quedó a disposición de que lo continúe revisando otra persona.",
						"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás volver a revisarlo.",
					],
					iconos: [vistaAnterior, vistaTablero],
				};
			}
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	// SI NO HAY INFORMACIÓN, ENTONCES EL USUARIO PUEDE CAPTURAR EL REGISTRO
	else if (!informacion) await funciones.activarCapturaSiNoLoEsta(registro, userID, entidad, prodID);

	// Continuar
	next();
};
