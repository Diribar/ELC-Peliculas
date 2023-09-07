"use strict";
// Requires
const BD_genericas = require("../../funciones/1-BD/Genericas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const variables = require("../../funciones/2-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	let v = {
		// Generales
		entidad: req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "",
		entID: req.query.id,
		haceUnaHora: comp.fechaHora.nuevoHorario(-1),
		haceDosHoras: comp.fechaHora.nuevoHorario(-2),
		usuario: req.session.usuario,
		userID: req.session.usuario.id,
		tipoUsuario: req.originalUrl.startsWith("/revision/") ? "revisores" : "usuarios",
		// Registro
		include: ["statusRegistro", "capturado_por"],
		// Vistas
		vistaAnterior: variables.vistaAnterior(req.session.urlSinCaptura),
		vistaInactivar: variables.vistaInactivar(req),
		vistaEntendido: variables.vistaEntendido(req.session.urlSinCaptura),
		vistaTablero: variables.vistaTablero,
	};
	const {baseUrl, url} = comp.reqBasePathUrl(req);
	v = {
		...v,
		entidadNombreMinuscula: comp.obtieneDesdeEntidad.entidadNombre(v.entidad).toLowerCase(),
		articulo: v.entidad == "peliculas" || v.entidad == "colecciones" ? " la " : "l ",
		vistaAnteriorTablero: [v.vistaAnterior],
		vistaAnteriorInactivar: [v.vistaAnterior, v.vistaInactivar],
	};

	// Más variables
	if (v.entidad != "usuarios") v.include.push("ediciones");
	if (v.entidad == "capitulos") v.include.push("coleccion");
	if (v.usuario.rolUsuario.revisorEnts) v.vistaAnteriorTablero.push(v.vistaTablero);
	v.registro = await BD_genericas.obtienePorIdConInclude(v.entidad, v.entID, v.include);
	v.creadoEn = v.registro.creadoEn;
	v.creadoEn.setSeconds(0);
	v.horarioFinalCreado = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, v.creadoEn));
	v.capturadoEn = v.registro.capturadoEn;
	v.horarioFinalCaptura = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, v.registro.capturadoEn));
	const creadoPorElUsuario1 = v.registro.creadoPor_id == v.userID;
	const creadoPorElUsuario2 = v.entidad == "capitulos" && v.registro.coleccion.creadoPor_id == v.userID;
	const creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;
	let informacion;

	// Fórmula
	let buscaOtrasCapturasActivasDelUsuario = async () => {
		// Se revisa solamente en esa familia de entidades
		// Asociaciones
		let entidades = variables.entidades.prods.includes(v.entidad) ? variables.entidades.prods : variables.entidades.rclvs;
		// Variables
		let objetoNull = {capturadoEn: null, capturadoPor_id: null, capturaActiva: null};
		let resultado;
		// Rutina por cada asociación
		for (let entidad of entidades) {
			let registros = await BD_genericas.obtieneTodosPorCondicion(entidad, {capturadoPor_id: v.userID});
			for (let registro of registros) {
				// Si fue capturado hace más de 2 horas y no es el registro actual, limpia los tres campos
				if (registro.capturadoEn < v.haceDosHoras && registro.id != v.entID)
					BD_genericas.actualizaPorId(entidad, registro.id, objetoNull);
				// Si fue capturado hace menos de 1 hora, está activo y no es el registro actual, informa el caso
				else if (
					registro.capturadoEn > v.haceUnaHora &&
					registro.capturaActiva &&
					(entidad != v.entidad || registro.id != v.entID)
				) {
					resultado = {
						entidad,
						id: registro.id,
						capturadoEn: registro.capturadoEn,
						nombre: registro.nombre,
						nombreCastellano: registro.nombreCastellano,
						nombreOriginal: registro.nombreOriginal,
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
	if (!informacion) {
		if (v.entidad != "usuarios" && v.creadoEn > v.haceUnaHora && !creadoPorElUsuario)
			informacion = {
				mensajes: [
					"Por ahora, el registro sólo está accesible para su creador.",
					"Estará disponible para su revisión el " + v.horarioFinalCreado + ".",
				],
				iconos: [v.vistaAnterior],
			};
	}

	// El registro fue creado hace más de una hora
	// 2. El registro está en status 'creado' y la vista no es de revisión
	if (!informacion) {
		if (
			v.creadoEn < v.haceUnaHora && // creado hace más de una hora
			v.registro.statusRegistro.codigo == "creado" && // en status creado
			!["/revision", "/links"].includes(baseUrl) // la ruta no es de revisión
		) {
			let nombre = comp.nombresPosibles(v.registro);
			if (nombre) nombre = "'" + nombre + "'";
			let mensajes = creadoPorElUsuario
				? [
						"Se cumplió el plazo de 1 hora desde que se creó el registro de" +
							v.articulo +
							v.entidadNombreMinuscula +
							" " +
							nombre,
				  ]
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
		if (v.capturadoEn > v.haceUnaHora && v.registro.capturadoPor_id != v.userID && v.registro.capturaActiva)
			informacion = {
				mensajes: [
					"El registro está capturado por " + (v.registro.capturado_por ? v.registro.capturado_por.apodo : "") + ".",
					"Estará liberado a más tardar el " + v.horarioFinalCaptura,
				],
				iconos: v.vistaAnteriorInactivar,
			};
	}

	// 4. El usuario quiere acceder a la entidad que capturó hace más de una hora y menos de dos horas
	if (!informacion) {
		if (v.capturadoEn < v.haceUnaHora && v.capturadoEn > v.haceDosHoras && v.registro.capturadoPor_id == v.userID)
			informacion = {
				mensajes: [
					"Esta captura terminó el " + v.horarioFinalCaptura,
					"Quedó a disposición de los demás " + v.tipoUsuario + ".",
					"Si nadie lo captura hasta 1 hora después, podrás volver a capturarlo.",
				],
				iconos: [v.vistaEntendido],
			};
	}

	// 5. El usuario tiene capturado otro registro en forma activa
	if (!informacion) {
		let prodCapturado = await buscaOtrasCapturasActivasDelUsuario();
		if (prodCapturado) {
			// Datos para el mensaje
			const pc_entidad = prodCapturado.entidad;
			const pc_entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(pc_entidad);
			const pc_entidadID = prodCapturado.id;
			const originalUrl = encodeURIComponent(req.originalUrl);
			const linkInactivar =
				"/inactivar-captura/?entidad=" + pc_entidad + "&id=" + pc_entidadID + "&urlDestino=" + originalUrl;
			const liberar = {
				nombre: "fa-circle-check",
				link: linkInactivar,
				titulo: "Liberar automáticamente",
				autofocus: true,
			};
			const horario = comp.fechaHora.fechaHorario(prodCapturado.capturadoEn);
			// Preparar la información
			const terminacion =
				pc_entidad == "peliculas" || pc_entidad == "colecciones"
					? {entidad: "la ", reservado: "a"}
					: {entidad: "el ", reservado: "o"};
			const nombre = comp.nombresPosibles(prodCapturado);
			informacion = {
				mensajes: [
					"Tenés que liberar " +
						terminacion.entidad +
						pc_entidadNombre.toLowerCase() +
						" '" +
						nombre +
						"', que está reservad" +
						terminacion.reservado +
						" desde el " +
						horario,
				],
				iconos: [v.vistaAnterior, liberar],
			};
		}
	}

	// 6. Verificaciones exclusivas de las vistas de Revisión
	if (!informacion && baseUrl == "/revision" && !url.startsWith("/tablero-de-control")) {
		// 1. El registro está en un status 'creados', creado por el Revisor
		if (v.registro.statusRegistro.creados && creadoPorElUsuario)
			informacion = {
				mensajes: ["El registro debe ser revisado por otro revisor, no por su creador"],
				iconos: v.vistaAnteriorTablero,
			};
		// 2. El registro está en un status provisorio, sugerido por el Revisor
		else if (v.registro.statusRegistro.provisorios && v.registro.statusSugeridoPor_id == v.userID)
			informacion = {
				mensajes: ["El registro debe ser revisado por otro revisor, no por quien propuso el cambio de status"],
				iconos: v.vistaAnteriorTablero,
			};
		// 3. El registro sólo tiene una edición, es del Revisor, y quiere acceder a una vista de edición
		else if (
			v.registro.ediciones &&
			v.registro.ediciones.length == 1 &&
			v.registro.ediciones[0].editadoPor_id == v.userID &&
			!url.startsWith("/links/") &&
			!url.startsWith("/producto/alta/")
		) {
			informacion = {
				mensajes: ["El registro tiene una sola edición y fue realizada por vos.", "La tiene que revisar otra persona"],
				iconos: v.vistaAnteriorTablero,
			};
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
