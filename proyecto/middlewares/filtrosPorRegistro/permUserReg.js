"use strict";

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
	if (v.usuario.rolUsuario.autTablEnts) v.vistaAnteriorTablero.push(v.vistaTablero);
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
	// 1. El registro fue creado hace menos de una hora y otro usuario quiere acceder
	if (v.entidad != "usuarios" && v.creadoEn > v.haceUnaHora && !creadoPorElUsuario)
		informacion = {
			mensajes: [
				"Por ahora, el registro sólo está accesible para su creador.",
				"Estará disponible para su revisión el " + v.horarioFinalCreado + ".",
			],
			iconos: [v.vistaAnterior],
		};
	// 2. El registro fue creado hace más de una hora, está en status 'creado', otro usuario quiere acceder y la ruta no es de revisión
	else if (
		v.creadoEn < v.haceUnaHora && // creado hace más de una hora
		v.registro.statusRegistro_id == creado_id && // en status creado
		!creadoPorElUsuario && // otro usuario quiere acceder
		baseUrl != "/revision" // la ruta no es de revisión
	) {
		let nombre = comp.nombresPosibles(v.registro);
		if (nombre) nombre = "'" + nombre + "'";
		let mensajes = [
			"El registro todavía no está revisado.",
			"Estará disponible luego de ser revisado, en caso de ser aprobado.",
		];
		informacion = {mensajes, iconos: [v.vistaAnterior]};
	}

	// 3. El registro está capturado en forma 'activa', y otro usuario quiere acceder a él
	else if (v.capturadoEn > v.haceUnaHora && v.registro.capturadoPor_id != v.userID && v.registro.capturaActiva)
		informacion = {
			mensajes: [
				"El registro está capturado por " + (v.registro.capturado_por ? v.registro.capturado_por.apodo : "") + ".",
				"Estará liberado a más tardar el " + v.horarioFinalCaptura,
			],
			iconos: v.vistaAnteriorInactivar,
		};
	// 4. El usuario quiere acceder a la entidad que capturó hace más de una hora y menos de dos horas
	else if (v.capturadoEn < v.haceUnaHora && v.capturadoEn > v.haceDosHoras && v.registro.capturadoPor_id == v.userID)
		informacion = {
			mensajes: [
				"Esta captura terminó el " + v.horarioFinalCaptura,
				"Quedó a disposición de los demás " + v.tipoUsuario + ".",
				"Si nadie lo captura hasta 1 hora después, podrás volver a capturarlo.",
			],
			iconos: [v.vistaEntendido],
		};
	// 5. El usuario tiene capturado otro registro en forma activa
	else {
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

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
