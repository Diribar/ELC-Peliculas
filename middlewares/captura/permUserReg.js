"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const entidadID = req.query.id;
	const haceUnaHora = compartidas.nuevoHorario(-1);
	const haceDosHoras = compartidas.nuevoHorario(-2);
	const usuario = req.session.usuario;
	const userID = usuario.id;
	let informacion;
	// Variables de url
	const urlBase = req.baseUrl;
	const url = req.url;
	// Variables - Registro
	let includes = ["status_registro", "ediciones", "capturado_por"];
	if (entidad == "capitulos") includes.push("coleccion");
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad, entidadID, includes);
	let creado_en = registro.creado_en;
	if (creado_en) creado_en.setSeconds(0);
	const horarioFinalCreado = compartidas.horarioTexto(compartidas.nuevoHorario(1, creado_en));
	const capturado_en = registro.capturado_en;
	const horarioFinalCaptura = compartidas.horarioTexto(compartidas.nuevoHorario(1, capturado_en));
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinCaptura);
	const vistaInactivar = variables.vistaInactivar(req);
	const vistaAnteriorInactivar = [vistaAnterior, vistaInactivar];

	const vistaTablero = variables.vistaTablero();
	const vistaAnteriorTablero = () => {
		let vista = [vistaAnterior];
		let usuario = req.session.usuario;
		if (usuario.rol_usuario.aut_gestion_prod) vista.push(vistaTablero);
		return vista;
	};

	// Creado por el usuario
	let creadoPorElUsuario1 = registro.creado_por_id == userID;
	let creadoPorElUsuario2 = entidad == "capitulos" && registro.coleccion.creado_por_id == userID;
	let creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;

	// Fórmulas de soporte
	let creadoHaceMenosDeUnaHora = () => {
		return creado_en > haceUnaHora && !creadoPorElUsuario
			? {
					mensajes: [
						"Por ahora, el registro sólo está accesible para su creador",
						"Estará disponible para su revisión el " + horarioFinalCreado,
					],
					iconos: [vistaAnterior],
			  }
			: "";
	};
	let creadoHaceMasDeUnaHora = () => {
		let informacion = "";
		if (
			creado_en < haceUnaHora && // creado hace más de una hora
			((registro.status_registro.creado && urlBase != "/revision") || // en status creado y la ruta no es de revisión
				(registro.status_registro.creado_aprob && !usuario.rol_usuario.aut_gestion_prod)) // en status creadoAprob y no es un usuario revisor
		) {
			let mensajes = creadoPorElUsuario
				? ["Se cumplió el plazo de 1 hora desde que se creó el registro."]
				: ["El registro todavía no está revisado."];
			mensajes.push("Estará disponible luego de ser revisado, en caso de ser aprobado.",)
			informacion = {
				mensajes,
				iconos: [vistaAnterior],
			};
		}
		return informacion;
	};
	let capturadoPorOtroUsuario = () => {
		return capturado_en > haceUnaHora && registro.capturado_por_id != userID && registro.captura_activa
			? {
					mensajes: [
						"El registro está capturado por " +
							(registro.capturado_por ? registro.capturado_por.apodo : "") +
							".",
						"Estará liberado a más tardar el " + horarioFinalCaptura,
					],
					iconos: vistaAnteriorInactivar,
			  }
			: "";
	};
	let capturaExcedida = () => {
		return capturado_en < haceUnaHora &&
			capturado_en > haceDosHoras &&
			registro.capturado_por_id == userID
			? {
					mensajes: [
						"Esta captura terminó el " + horarioFinalCaptura,
						"Quedó a disposición de los demás usuarios.",
						"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
					],
					iconos: vistaAnteriorInactivar,
			  }
			: "";
	};
	let otroRegistroCapturado = async () => {
		let informacion;
		let prodCapturado = await buscaAlgunaCapturaVigenteDelUsuarioParaEsaFamilia();
		if (prodCapturado) {
			// Datos para el mensaje
			const pc_entidadCodigo = prodCapturado.entidad;
			const pc_entidadNombre = compartidas.obtenerEntidadNombre(pc_entidadCodigo);
			const pc_entidadID = prodCapturado.id;
			const originalUrl = encodeURIComponent(req.originalUrl);
			const linkInactivar =
				"/inactivar-captura/?entidad=" +
				pc_entidadCodigo +
				"&id=" +
				pc_entidadID +
				"&origen=" +
				originalUrl;
			const liberar = {
				nombre: "fa-circle-check",
				link: linkInactivar,
				titulo: "Liberar automáticamente",
			};
			const horario = compartidas.horarioTexto(prodCapturado.capturado_en);
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
			// 1. El registro está en un status gr_creado, creado por el Revisor
			if (registro.status_registro.gr_creado && creadoPorElUsuario)
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
			// 3. El registro sólo tiene una edición y es del Revisor
			else if (
				registro.ediciones &&
				registro.ediciones.length == 1 &&
				registro.ediciones[0].editado_por_id == userID &&
				!url.startsWith("links/") &&
				!url.startsWith("/producto/alta/")
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
	// Fórmulas auxiliares
	let buscaAlgunaCapturaVigenteDelUsuarioParaEsaFamilia = async () => {
		// Se revisa solamente en la familia de entidades
		// Asociaciones
		let entidades = ["peliculas", "colecciones", "capitulos"].includes(entidad)
			? ["peliculas", "colecciones", "capitulos"]
			: ["personajes", "hechos", "valores"];
		let asociaciones = [];
		entidades.forEach((entidad) => asociaciones.push("captura_" + entidad));
		// Variables
		let objetoNull = {capturado_en: null, capturado_por_id: null, captura_activa: null};
		let resultado;
		// Obtener el usuario con los includes
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, asociaciones);
		// Rutina por cada asociación
		let i = 0;
		for (let asociacion of asociaciones) {
			if (usuario[asociacion].length) {
				// Rutina por cada entidad dentro de la asociación
				for (let registro of usuario[asociacion]) {
					// Si fue capturado hace más de 2 horas y no es el registro actual, limpiar los tres campos
					if (registro.capturado_en < haceDosHoras && registro.id != entidadID) {
						BD_genericas.actualizarPorId(entidades[i], registro.id, objetoNull);
						// Si fue capturado hace menos de 1 hora, informar el caso
					} else if (
						registro.capturado_en > haceUnaHora &&
						registro.captura_activa &&
						(entidades[i] != entidad || registro.id != entidadID)
					) {
						resultado = {
							entidad: entidades[i],
							id: registro.id,
							capturado_en: registro.capturado_en,
							nombre: registro.nombre,
							nombre_castellano: registro.nombre_castellano,
							nombre_original: registro.nombre_original,
						};
						break;
					}
				}
			}
			if (resultado) break;
			else i++;
		}
		// Fin
		return resultado;
	};

	// CAMINO CRÍTICO
	// 1. El registro fue creado hace menos de una hora por otro usuario
	if (!informacion) informacion = creadoHaceMenosDeUnaHora();
	// 2. El registro fue creado hace más de una hora
	//    El registro está en status creado y la vista no es de revisión
	//    El registro está en status creadoAprob y el usuario no es revisor
	if (!informacion) informacion = creadoHaceMasDeUnaHora();
	// 2. El registro está capturado por otro usuario en forma 'activa'
	if (!informacion) informacion = capturadoPorOtroUsuario();
	// 3. El usuario capturó la entidad hace más de una hora y menos de dos horas
	if (!informacion) informacion = capturaExcedida();
	// 4. El usuario tiene capturado otro registro en forma activa
	if (!informacion) informacion = await otroRegistroCapturado();
	// Verificaciones exclusivas de las vistas de Revisión
	if (!informacion) informacion = verificacionesDeRevision();

	// Fin
	if (informacion) return res.render("MI9-Cartel", {informacion});
	next();
};
