"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad_codigo = req.query.entidad;
	const regID = req.query.id;
	const haceUnaHora = funciones.nuevoHorario(-1);
	const haceDosHoras = funciones.nuevoHorario(-2);
	const userID = req.session.usuario.id;
	let informacion;
	// Obtener el urlBase
	const urlBase = req.baseUrl;
	// Obtener el url
	const url = req.url.slice(1);
	// Variables - Registro
	let includes = ["status_registro", "ediciones", "capturado_por"];
	if (entidad_codigo == "capitulos") includes.push("coleccion");
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad_codigo, regID, includes);
	const creado_en = registro.creado_en;
	const capturado_en = registro.capturado_en;
	const horarioFinal = funciones.horarioTexto(funciones.nuevoHorario(1, capturado_en));
	// Creado por el usuario
	let creadoPorElUsuario1 = registro.creado_por_id == userID;
	let creadoPorElUsuario2 = entidad_codigo == "capitulos" && registro.coleccion.creado_por_id == userID;
	let creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaTablero = variables.vistaTablero();

	// Fórmulas
	let creadoHaceMenosDeUnaHora = () => {
		return creado_en > haceUnaHora && !creadoPorElUsuario
			? {
					mensajes: ["Por ahora, el registro sólo está accesible para su creador"],
					iconos: [vistaAnterior, vistaTablero],
			  }
			: "";
	};
	let capturadoPorOtroUsuario = () => {
		return capturado_en > haceUnaHora && registro.capturado_por_id != userID && registro.captura_activa
			? {
					mensajes: [
						"El registro está capturado por otro usuario " +
							(registro.capturado_por ? "(" + registro.capturado_por.apodo + ")" : "") +
							". Estará liberado a partir de las " +
							horarioFinal,
					],
					iconos: [vistaAnterior, vistaTablero],
			  }
			: "";
	};
	let capturaEnPausa = () => {
		return capturado_en < haceUnaHora &&
			capturado_en > haceDosHoras &&
			registro.capturado_por_id == userID
			? {
					mensajes: [
						"Esta captura terminó el " + horarioFinal,
						"Quedó a disposición de los demás usuarios.",
						"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
					],
					iconos: [vistaAnterior, vistaTablero],
			  }
			: "";
	};
	let otroRegistroCapturado = async () => {
		let informacion;
		let prodCapturado = await funciones.buscaAlgunaCapturaVigenteDelUsuario(
			entidad_codigo,
			regID,
			userID
		);
		if (prodCapturado) {
			// Datos para el mensaje
			const pc_entidadCodigo = prodCapturado.entidad;
			const pc_entidadNombre = funciones.obtenerEntidadNombre(pc_entidadCodigo);
			const pc_entidadID = prodCapturado.id;
			const url = encodeURIComponent(req.originalUrl);
			const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
			const linkInactivar =
				"/inactivar/?entidad=" + pc_entidadCodigo + "&id=" + pc_entidadID + "&url=" + url;
			const liberar = {
				nombre: "fa-circle-check",
				link: linkInactivar,
				titulo: "Liberar automáticamente",
			};
			const horario = funciones.horarioTexto(prodCapturado.capturado_en);
			// Preparar la información
			const terminacion =
				pc_entidadCodigo == "peliculas" || pc_entidadCodigo == "colecciones"
					? {entidad: "la ", reservado: "a"}
					: {entidad: "el ", reservado: "o"};
			const nombre =
				pc_entidadCodigo == "personajes" ||
				pc_entidadCodigo == "hechos" ||
				pc_entidadCodigo == "valores"
					? "nombre"
					: prodCapturado.nombre_castellano
					? "nombre_castellano"
					: "nombre_original";
			informacion = {
				mensajes: [
					"Tenés que liberar " +
						terminacion.entidad +
						pc_entidadNombre.toLowerCase() +
						" " +
						prodCapturado[nombre] +
						", que está reservad" +
						terminacion.reservado +
						" desde las " +
						horario,
				],
				iconos: [vistaAnterior, liberar],
			};
		}
		return informacion;
	};
	let verificacionesDeRevision = () => {
		let informacion;
		if (urlBase == "/revision" && url != "tablero-de-control") {
			// El registro está en un status gr_pend_aprob, creado por el Revisor
			if (registro.status_registro.gr_pend_aprob && creadoPorElUsuario)
				informacion = {
					mensajes: ["El registro debe ser analizado por otro revisor, no por su creador"],
					iconos: [vistaAnterior, vistaTablero],
				};
			// El registro está en un status provisorio, sugerido por el Revisor
			else if (registro.status_registro.gr_provisorios && registro.sugerido_por_id == userID)
				informacion = {
					mensajes: [
						"El registro debe ser analizado por otro revisor, no por quien propuso el cambio de status",
					],
					iconos: [vistaAnterior, vistaTablero],
				};
			// El registro sólo tiene una sola edición y es del Revisor
			else if (
				registro.ediciones &&
				registro.ediciones.length == 1 &&
				registro.ediciones[0].editado_por_id == userID &&
				!url.startsWith("links/")
			) {
				informacion = {
					mensajes: [
						"El registro tiene una sola edición y fue realizada por vos.",
						"La tiene que revisar otra persona",
					],
					iconos: [vistaAnterior, vistaTablero],
				};
			}
		}
		return informacion;
	};
	// 1. El registro fue creado hace menos de una hora por otro usuario
	if (!informacion) informacion = creadoHaceMenosDeUnaHora();
	// 2. El registro está capturado por otro usuario en forma 'activa'
	if (!informacion) informacion = capturadoPorOtroUsuario();
	// 3. El usuario capturó la entidad hace más de una hora y menos de dos horas
	if (!informacion) informacion = capturaEnPausa();
	// 4. El usuario tiene capturado otro registro en forma activa
	if (!informacion) informacion = await otroRegistroCapturado();
	// Verificaciones exclusivas de las vistas de Revisión
	if (!informacion) informacion = verificacionesDeRevision();

	// Continuar
	if (informacion) return res.render("Errores", {informacion});
	next();
};
