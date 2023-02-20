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
		entID: req.query.id,
		haceUnaHora: comp.nuevoHorario(-1),
		haceDosHoras: comp.nuevoHorario(-2),
		usuario: req.session.usuario,
		userID: req.session.usuario.id,
		tipoUsuario: req.originalUrl.startsWith("/revision/") ? "revisores" : "usuarios",
		// url
		urlBase: req.baseUrl,
		url: req.url,
		// Registro
		includes: ["status_registro", "capturado_por"],
		// Vistas
		vistaAnterior: variables.vistaAnterior(req.session.urlSinCaptura),
		vistaInactivar: variables.vistaInactivar(req),
		vistaEntendido: variables.vistaEntendido(req.session.urlSinCaptura),
		vistaTablero: variables.vistaTablero,
	};

	// Variables - Registro
	if (v.entidad != "usuarios") v.includes.push("ediciones");
	if (v.entidad == "capitulos") v.includes.push("coleccion");
	v.registro = await BD_genericas.obtienePorIdConInclude(v.entidad, v.entID, v.includes);
	v.capturado_en = v.registro.capturado_en;
	v.horarioFinalCaptura = comp.fechaHorarioTexto(comp.nuevoHorario(1, v.registro.capturado_en));
	v.creado_en = v.registro.creado_en;
	v.horarioFinalCreado = comp.fechaHorarioTexto(comp.nuevoHorario(1, v.creado_en));
	if (v.creado_en) v.creado_en.setSeconds(0);
	v.vistaAnteriorTablero = (() => {
		let vista = [v.vistaAnterior];
		if (v.usuario.rol_usuario.revisor_ents) vista.push(v.vistaTablero);
		return vista;
	})();
	// Otras variables
	v.vistaAnteriorInactivar = [v.vistaAnterior, v.vistaInactivar];
	let informacion;

	// Creado por el usuario
	let creadoPorElUsuario1 = v.registro.creado_por_id == v.userID;
	let creadoPorElUsuario2 = v.entidad == "capitulos" && v.registro.coleccion.creado_por_id == v.userID;
	let creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;

	// Fórmula
	let buscaOtrasCapturasActivasDelUsuario = async () => {
		// Se revisa solamente en esa familia de entidades
		// Asociaciones
		let entidades = variables.entidadesProd.includes(v.entidad) ? variables.entidadesProd : variables.entidadesRCLV;
		// Variables
		let objetoNull = {capturado_en: null, capturado_por_id: null, captura_activa: null};
		let resultado;
		// Rutina por cada asociación
		for (let entidad of entidades) {
			let registros = await BD_genericas.obtieneTodosPorCampos(entidad, {capturado_por_id: v.userID});
			for (let registro of registros) {
				// Si fue capturado hace más de 2 horas y no es el registro actual, limpia los tres campos
				if (registro.capturado_en < v.haceDosHoras && registro.id != v.entID)
					BD_genericas.actualizaPorId(entidad, registro.id, objetoNull);
				// Si fue capturado hace menos de 1 hora, está activo y no es el registro actual, informa el caso
				else if (
					registro.capturado_en > v.haceUnaHora &&
					registro.captura_activa &&
					(entidad != v.entidad || registro.id != v.entID)
				) {
					resultado = {
						entidad,
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
		// Fin
		return resultado;
	};

	// CAMINO CRÍTICO
	// 1. El registro fue creado hace menos de una hora y otro usuario quiere acceder como escritura
	if (!informacion && v.entidad != "usuarios") {
		informacion =
			v.creado_en > v.haceUnaHora && !creadoPorElUsuario
				? {
						mensajes: [
							"Por ahora, el registro sólo está accesible para su creador",
							"Estará disponible para su revisión el " + v.horarioFinalCreado,
						],
						iconos: [v.vistaAnterior],
				  }
				: "";
	}
	// 2. El registro fue creado hace más de una hora
	//    El registro está en status creado y la vista no es de revisión
	//    El registro está en status creadoAprob y el usuario no es revisor
	if (!informacion) {
		if (
			v.creado_en < v.haceUnaHora && // creado hace más de una hora
			((v.registro.status_registro.creado && v.urlBase != "/revision") || // en status creado y la ruta no es de revisión
				(v.registro.status_registro.creado_aprob && !v.usuario.rol_usuario.revisor_ents)) // en status creadoAprob y no es un usuario revisor
		) {
			let mensajes = creadoPorElUsuario
				? ["Se cumplió el plazo de 1 hora desde que se creó el registro."]
				: ["El registro todavía no está revisado."];
			mensajes.push("Estará disponible luego de ser revisado, en caso de ser aprobado.");
			informacion = {
				mensajes,
				iconos: [v.vistaAnterior],
			};
		}
	}
	// 3. El registro está capturado en forma 'activa', y otro usuario quiere acceder a él
	if (!informacion) {
		informacion =
			v.capturado_en > v.haceUnaHora && v.registro.capturado_por_id != v.userID && v.registro.captura_activa
				? {
						mensajes: [
							"El registro está capturado por " +
								(v.registro.capturado_por ? v.registro.capturado_por.apodo : "") +
								".",
							"Estará liberado a más tardar el " + v.capturado_en,
						],
						iconos: v.vistaAnteriorInactivar,
				  }
				: "";
	}
	// 4. El usuario quiere acceder a la entidad que capturó hace más de una hora y menos de dos horas
	if (!informacion) {
		informacion =
			v.capturado_en < v.haceUnaHora && v.capturado_en > v.haceDosHoras && v.registro.capturado_por_id == v.userID
				? {
						mensajes: [
							"Esta captura terminó el " + v.capturado_en,
							"Quedó a disposición de los demás " + v.tipoUsuario + ".",
							"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
						],
						iconos: [v.vistaEntendido],
				  }
				: "";
	}
	// 5. El usuario tiene capturado otro registro en forma activa
	if (!informacion) {
		let prodCapturado = await buscaOtrasCapturasActivasDelUsuario();
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
				iconos: [v.vistaAnterior, liberar],
			};
		}
	}
	// 6. Verificaciones exclusivas de las vistas de Revisión
	if (!informacion && v.urlBase == "/revision" && !v.url.startsWith("/tablero-de-control")) {
		// 1. El registro está en un status gr_creado, creado por el Revisor
		if (v.registro.status_registro.gr_creado && creadoPorElUsuario)
			informacion = {
				mensajes: ["El registro debe ser revisado por otro revisor, no por su creador"],
				iconos: v.vistaAnteriorTablero,
			};
		// 2. El registro está en un status provisorio, sugerido por el Revisor
		else if (v.registro.status_registro.gr_provisorios && v.registro.sugerido_por_id == v.userID)
			informacion = {
				mensajes: ["El registro debe ser revisado por otro revisor, no por quien propuso el cambio de status"],
				iconos: v.vistaAnteriorTablero,
			};
		// 3. El registro sólo tiene una edición y es del Revisor
		else if (
			v.registro.ediciones &&
			v.registro.ediciones.length == 1 &&
			v.registro.ediciones[0].editado_por_id == v.userID &&
			!v.url.startsWith("links/") &&
			!v.url.startsWith("/producto/alta/")
		) {
			informacion = {
				mensajes: ["El registro tiene una sola edición y fue realizada por vos.", "La tiene que revisar otra persona"],
				iconos: v.vistaAnteriorTablero,
			};
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	next();
};
