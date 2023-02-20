"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	let v = {
		// Generales
		entidad: req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "",
		entidadID: req.query.id,
		haceUnaHora: comp.nuevoHorario(-1),
		haceDosHoras: comp.nuevoHorario(-2),
		usuario: req.session.usuario,
		userID: usuario.id,
		tipoUsuario: req.originalUrl.startsWith("/revision/") ? "revisores" : "usuarios",
		// url
		urlBase: req.baseUrl,
		url: req.url,
		// Registro
		includes: ["status_registro", "capturado_por"],
		horarioFinalCreado: comp.fechaHorarioTexto(comp.nuevoHorario(1, creado_en)),
		capturado_en: registro.capturado_en,
		horarioFinalCaptura: comp.fechaHorarioTexto(comp.nuevoHorario(1, capturado_en)),
		// Vistas
		vistaAnterior: variables.vistaAnterior(req.session.urlSinCaptura),
		vistaInactivar: variables.vistaInactivar(req),
		vistaEntendido: variables.vistaEntendido(req.session.urlSinCaptura),
		vistaTablero: variables.vistaTablero,
		vistaAnteriorInactivar: [vistaAnterior, vistaInactivar],
		vistaAnteriorTablero: (() => {
			let vista = [vistaAnterior];
			let usuario = req.session.usuario;
			if (usuario.rol_usuario.revisor_ents) vista.push(vistaTablero);
			return vista;
		})(),
	};

	// Otras variables
	let informacion;
	// Variables - Registro
	if (v.entidad != "usuarios") includes.push("ediciones");
	if (v.entidad == "capitulos") includes.push("coleccion");
	let creado_en = registro.creado_en;
	if (creado_en) creado_en.setSeconds(0);
	let registro = await BD_genericas.obtienePorIdConInclude(v.entidad, entidadID, includes);

	// Creado por el usuario
	let creadoPorElUsuario1 = registro.creado_por_id == userID;
	let creadoPorElUsuario2 = v.entidad == "capitulos" && registro.coleccion.creado_por_id == userID;
	let creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;

	// Fórmula
	let buscaAlgunaCapturaVigenteDelUsuarioParaEsaFamilia = async () => {
		// Se revisa solamente en esa familia de entidades
		// Asociaciones
		let entidades = variables.entidadesProd.includes(v.entidad) ? variables.entidadesProd : variables.entidadesRCLV;
		let asociaciones = [];
		entidades.forEach((entidad) => asociaciones.push("captura_" + entidad));
		// Variables
		let objetoNull = {capturado_en: null, capturado_por_id: null, captura_activa: null};
		let resultado;
		// Obtiene el usuario con los includes
		let usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, asociaciones);
		// Rutina por cada asociación
		let i = 0;
		for (let asociacion of asociaciones) {
			if (usuario[asociacion].length) {
				// Rutina por cada entidad dentro de la asociación
				for (let registro of usuario[asociacion]) {
					// Si fue capturado hace más de 2 horas y no es el registro actual, limpia los tres campos
					if (registro.capturado_en < haceDosHoras && registro.id != entidadID) {
						BD_genericas.actualizaPorId(entidades[i], registro.id, objetoNull);
						// Si fue capturado hace menos de 1 hora, informar el caso
					} else if (
						registro.capturado_en > haceUnaHora &&
						registro.captura_activa &&
						(entidades[i] != v.entidad || registro.id != entidadID)
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
	// 1. El registro fue creado hace menos de una hora y otro usuario quiere acceder como escritura
	if (!informacion && v.entidad != "usuarios") {
		informacion =
			creado_en > haceUnaHora && !creadoPorElUsuario
				? {
						mensajes: [
							"Por ahora, el registro sólo está accesible para su creador",
							"Estará disponible para su revisión el " + horarioFinalCreado,
						],
						iconos: [vistaAnterior],
				  }
				: "";
	}
	// 2. El registro fue creado hace más de una hora
	//    El registro está en status creado y la vista no es de revisión
	//    El registro está en status creadoAprob y el usuario no es revisor
	if (!informacion) {
		if (
			creado_en < haceUnaHora && // creado hace más de una hora
			((registro.status_registro.creado && urlBase != "/revision") || // en status creado y la ruta no es de revisión
				(registro.status_registro.creado_aprob && !usuario.rol_usuario.revisor_ents)) // en status creadoAprob y no es un usuario revisor
		) {
			let mensajes = creadoPorElUsuario
				? ["Se cumplió el plazo de 1 hora desde que se creó el registro."]
				: ["El registro todavía no está revisado."];
			mensajes.push("Estará disponible luego de ser revisado, en caso de ser aprobado.");
			informacion = {
				mensajes,
				iconos: [vistaAnterior],
			};
		}
	}
	// 3. El registro está capturado en forma 'activa', y otro usuario quiere acceder a él
	if (!informacion) {
		informacion =
			capturado_en > haceUnaHora && registro.capturado_por_id != userID && registro.captura_activa
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
	}
	// 4. El usuario quiere acceder a la entidad que capturó hace más de una hora y menos de dos horas
	if (!informacion) {
		informacion =
			capturado_en < haceUnaHora && capturado_en > haceDosHoras && registro.capturado_por_id == userID
				? {
						mensajes: [
							"Esta captura terminó el " + horarioFinalCaptura,
							"Quedó a disposición de los demás " + tipoUsuario + ".",
							"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
						],
						iconos: [vistaEntendido],
				  }
				: "";
	}
	// 5. El usuario tiene capturado otro registro en forma activa
	if (!informacion) {
		let prodCapturado = await buscaAlgunaCapturaVigenteDelUsuarioParaEsaFamilia();
		if (prodCapturado) {
			// Datos para el mensaje
			const pc_entidad = prodCapturado.entidad;
			const pc_entidadNombre = comp.obtieneEntidadNombre(pc_entidad);
			const pc_entidadID = prodCapturado.id;
			const originalUrl = encodeURIComponent(req.originalUrl);
			const linkInactivar = "/inactivar-captura/?entidad=" + pc_entidad + "&id=" + pc_entidadID + "&origen=" + originalUrl;
			const liberar = {
				nombre: "fa-circle-check",
				link: linkInactivar,
				titulo: "Liberar automáticamente",
				autofocus: true,
			};
			const horario = comp.fechaHorarioTexto(prodCapturado.capturado_en);
			// Preparar la información
			const terminacion = pc_entidad == "capitulos" ? {entidad: "el ", reservado: "o"} : {entidad: "la ", reservado: "a"};
			const nombre = prodCapturado.nombre
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
	}
	// 6. Verificaciones exclusivas de las vistas de Revisión
	if (!informacion && urlBase == "/revision" && !url.startsWith("/tablero-de-control")) {
		// 1. El registro está en un status gr_creado, creado por el Revisor
		if (registro.status_registro.gr_creado && creadoPorElUsuario)
			informacion = {
				mensajes: ["El registro debe ser revisado por otro revisor, no por su creador"],
				iconos: vistaAnteriorTablero,
			};
		// 2. El registro está en un status provisorio, sugerido por el Revisor
		else if (registro.status_registro.gr_provisorios && registro.sugerido_por_id == userID)
			informacion = {
				mensajes: ["El registro debe ser revisado por otro revisor, no por quien propuso el cambio de status"],
				iconos: vistaAnteriorTablero,
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
				mensajes: ["El registro tiene una sola edición y fue realizada por vos.", "La tiene que revisar otra persona"],
				iconos: vistaAnteriorTablero,
			};
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	next();
};
