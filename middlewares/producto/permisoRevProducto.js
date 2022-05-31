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
	const horarioDisponible = funcionHorarioCreacion(creado_en);
	// Variables - Captura
	let capturado_en = registro.capturado_en;
	capturado_en.setSeconds(0);
	const [horarioInicial, horarioFinal] = funciones.horariosCaptura(capturado_en);
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaTablero = variables.vistaTablero();

	// Detectar los problemas
	// PROBLEMA 1: El revisor no debe revisar un registro creado por sí mismo y que no esté en status aprobado
	// ¿Creado por el usuario actual?
	let creadoPorElUsuario1 = registro.creado_por_id == userID;
	let creadoPorElUsuario2 = entidad == "capitulos" && registro.coleccion.creado_por_id == userID;
	if ((creadoPorElUsuario1 || creadoPorElUsuario2) && !registro.status_registro.aprobado)
		informacion = {
			mensajes: ["El registro debe ser analizado por otro revisor, no por su creador"],
			iconos: [vistaAnterior, vistaTablero],
		};
	else {
		// REGISTRO ENCONTRADO + CREADO POR OTRO USUARIO
		// PROBLEMA 2: El registro todavía está en manos de su creador
		// ¿Creado > haceUnaHora?
		if (creado_en > haceUnaHora) {
			// Información
			informacion = {
				mensajes: ["El registro estará disponible para su revisión el " + horarioDisponible],
				iconos: [vistaAnterior, vistaTablero],
			};
		}
		// --------------------------------------------------------------------
		else {
			// DETECTAR PROBLEMAS DE CAPTURA
			// PROBLEMA 1: El registro está capturado por otro usuario en forma 'activa'
			let info1 = {
				mensajes: [
					"El registro está en revisión por el usuario " +
						registro.capturado_por.apodo +
						", desde el " +
						horarioInicial,
				],
				iconos: [vistaAnterior, vistaTablero],
			};
			// PROBLEMA 2: El usuario dejó inconclusa la revisión luego de la hora y no transcurrieron aún las 2 horas
			let info2 = {
				mensajes: [
					"Esta revisión quedó inconclusa desde el " + horarioFinal,
					"Quedó a disposición de que lo continúe revisando otra persona.",
					"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás volver a revisarlo.",
				],
				iconos: [vistaAnterior, vistaTablero],
			};
			// Conclusión
			informacion = funciones.detectarProblemasDeCaptura(informacion, info1, info2);
		}
	}

	if (informacion) return res.render("Errores", {informacion});

	// Continuar
	next();
};

let funcionHorarioCreacion = (creado_en) => {
	// Obtener el horario de creación
	let horarioCreacion = new Date(creado_en);
	// Obtener el horario en que estará disponible para revisar
	let horarioDisponible = new Date(horarioCreacion);
	horarioDisponible.setHours(horarioCreacion.getHours() + 1);
	// Configurar los horarios con formato texto
	horarioDisponible = funciones.horarioTexto(horarioDisponible);
	return horarioDisponible;
};
