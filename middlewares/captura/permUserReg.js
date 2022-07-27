"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad_codigo = req.query.entidad;
	const entidad_id = req.query.id;
	const haceUnaHora = funciones.nuevoHorario(-1);
	const haceDosHoras = funciones.nuevoHorario(-2);
	const userID = req.session.usuario.id;
	const familia = funciones.obtenerFamiliaEnSingular(entidad_codigo);
	let informacion;
	// Variables de url
	const urlBase = req.baseUrl;
	const url = req.url;
	// Variables - Registro
	let includes = ["status_registro", "ediciones", "capturado_por"];
	if (entidad_codigo == "capitulos") includes.push("coleccion");
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad_codigo, entidad_id, includes);
	const creado_en = registro.creado_en;
	const capturado_en = registro.capturado_en;
	const horarioFinal = funciones.horarioTexto(funciones.nuevoHorario(1, capturado_en));
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaInactivar = variables.vistaInactivar(req);
	const vistaAnteriorInactivar = () => {
		let vista = [vistaAnterior];
		if (urlBase != "/rclv") vista.push(vistaInactivar);
		return vista;
	};
	const vistaTablero = variables.vistaTablero();
	const vistaAnteriorTablero = () => {
		let vista = [vistaAnterior];
		let usuario = req.session.usuario;
		if (usuario.rol_usuario.aut_gestion_prod) vista.push(vistaTablero);
		return vista;
	};

	// Creado por el usuario
	let creadoPorElUsuario1 = registro.creado_por_id == userID;
	let creadoPorElUsuario2 = entidad_codigo == "capitulos" && registro.coleccion.creado_por_id == userID;
	let creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;

	// Fórmulas
	let creadoHaceMenosDeUnaHora = () => {
		// No rige para RCLV porque para ellos el status inicial es 'aprobado'
		return creado_en > haceUnaHora && !creadoPorElUsuario && familia != "rclv"
			? {
					mensajes: ["Por ahora, el registro sólo está accesible para su creador"],
					iconos: [vistaAnterior],
			  }
			: "";
	};
	let capturadoPorOtroUsuario = () => {
		return capturado_en > haceUnaHora && registro.capturado_por_id != userID && registro.captura_activa
			? {
					mensajes: [
						"El registro está capturado por " +
							(registro.capturado_por ? registro.capturado_por.apodo : "") +
							".",
						"Estará liberado a más tardar el " + horarioFinal,
					],
					iconos: vistaAnteriorInactivar(),
			  }
			: "";
	};
	let capturaExcedida = () => {
		return capturado_en < haceUnaHora &&
			capturado_en > haceDosHoras &&
			registro.capturado_por_id == userID
			? {
					mensajes: [
						"Esta captura terminó el " + horarioFinal,
						"Quedó a disposición de los demás usuarios.",
						"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
					],
					iconos: vistaAnteriorInactivar(),
			  }
			: "";
	};
	let otroRegistroCapturado = async () => {
		let informacion;
		let prodCapturado = await funciones.buscaAlgunaCapturaVigenteDelUsuario(
			entidad_codigo,
			entidad_id,
			userID
		);
		if (prodCapturado) {
			// Datos para el mensaje
			const pc_entidadCodigo = prodCapturado.entidad;
			const pc_entidadNombre = funciones.obtenerEntidadNombre(pc_entidadCodigo);
			const pc_entidadID = prodCapturado.id;
			const originalUrl = encodeURIComponent(req.originalUrl);
			const linkInactivar =
				"/inactivar/?entidad=" + pc_entidadCodigo + "&id=" + pc_entidadID + "&url=" + originalUrl;
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
						" desde el " +
						horario,
				],
				iconos: [vistaAnterior, liberar],
			};
		}
		return informacion;
	};
	let verificacionesDeRevision = () => {
		let informacion;
		if (urlBase == "/revision" && !url.startsWith("/tablero-de-control")) {
			// 1. El registro está en un status gr_pend_aprob, creado por el Revisor
			if (registro.status_registro.gr_pend_aprob && creadoPorElUsuario)
				informacion = {
					mensajes: ["El registro debe ser revisado por otro revisor, no por su creador"],
					iconos: vistaAnteriorTablero(),
				};
			// 2. El registro está en un status provisorio, sugerido por el Revisor
			else if (registro.status_registro.gr_provisorios && registro.sugerido_por_id == userID)
				informacion = {
					mensajes: [
						"El registro debe ser revisado por otro revisor, no por quien propuso el cambio de status",
					],
					iconos: vistaAnteriorTablero(),
				};
			// 3. El registro sólo tiene una sola edición y es del Revisor
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
					iconos: vistaAnteriorTablero(),
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
	if (!informacion) informacion = capturaExcedida();
	// 4. El usuario tiene capturado otro registro en forma activa
	if (!informacion) informacion = await otroRegistroCapturado();
	// Verificaciones exclusivas de las vistas de Revisión
	if (!informacion) informacion = verificacionesDeRevision();

	// Continuar
	if (informacion) return res.render("Errores", {informacion});
	next();
};
