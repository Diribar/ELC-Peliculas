"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const rubro = req.originalUrl.startsWith("/revision/")
		? "revision"
		: req.originalUrl.startsWith("/producto/") || req.originalUrl.startsWith("/links/abm/")
		? "producto"
		: req.originalUrl.startsWith("/rclv/")
		? "rclv"
		: null;

	let v = {
		// Generales
		entidad: req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "",
		entID: req.query.id,
		origen: req.query.origen,
		haceUnaHora: comp.fechaHora.nuevoHorario(-1),
		haceDosHoras: comp.fechaHora.nuevoHorario(-2),
		usuario: req.session.usuario,
		userID: req.session.usuario.id,
		tipoUsuario: req.originalUrl.startsWith("/revision/") ? "revisores" : "usuarios",
		include: ["statusRegistro", "capturadoPor"],
		baseUrl: comp.reqBasePathUrl(req).baseUrl,

		// Vistas
		vistaSinCaptura: variables.vistaAnterior(req.session.urlSinCaptura),
		vistaEntendido: variables.vistaEntendido(req.session.urlSinCaptura),
		vistaTablero: variables.vistaTablero,
	};
	v.vistaInactivar = rubro ? variables.vistaInactivar[rubro](v.entidad, v.entID) : {};
	v = {
		...v,
		entidadNombreMinuscula: comp.obtieneDesdeEntidad.entidadNombre(v.entidad).toLowerCase(),
		familia: comp.obtieneDesdeEntidad.familia(v.entidad),
		elLa: comp.obtieneDesdeEntidad.elLa(v.entidad),
		oa: comp.obtieneDesdeEntidad.oa(v.entidad),
		ea: comp.obtieneDesdeEntidad.oa(v.entidad),

		vistaAnteriorTablero: v.usuario.rolUsuario.autTablEnts ? [v.vistaSinCaptura, v.vistaTablero] : [v.vistaSinCaptura],
	};

	// Más variables
	if (v.entidad != "usuarios") v.include.push("ediciones");
	if (v.entidad == "capitulos") v.include.push("coleccion");
	v.registro = await baseDeDatos.obtienePorId(v.entidad, v.entID, v.include);
	v.creadoEn = v.registro.creadoEn;
	v.creadoEn.setSeconds(0);
	v.horarioFinalCreado = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, v.creadoEn));
	v.capturadoEn = v.registro.capturadoEn;
	v.horarioFinalCaptura = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, v.registro.capturadoEn));
	const creadoPorElUsuario1 = v.registro.creadoPor_id == v.userID;
	const creadoPorElUsuario2 = v.entidad == "capitulos" && v.registro.coleccion.creadoPor_id == v.userID;
	const creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;
	let informacion;

	// Corrige el link de 'entendido'
	if (req.originalUrl.startsWith("/" + v.familia + "/edicion"))
		v.vistaEntendido.link =
			v.origen == "TE"
				? "/revision/tablero-de-entidades"
				: "/" + v.familia + "/detalle/?entidad=" + v.entidad + "&id=" + v.entID;

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
			let registros = await baseDeDatos.obtieneTodosPorCondicion(entidad, {capturadoPor_id: v.userID});
			for (let registro of registros) {
				// Si fue capturado hace más de 2 horas y no es el registro actual, limpia los tres campos
				if (registro.capturadoEn < v.haceDosHoras && registro.id != v.entID)
					baseDeDatos.actualizaPorId(entidad, registro.id, objetoNull);
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
				"Por ahora," + v.elLa + v.entidadNombreMinuscula + " sólo está accesible para su creador.",
				"Estará disponible para su revisión el " + v.horarioFinalCreado + ".",
			],
			iconos: [v.vistaEntendido],
		};
	// 2. El registro fue creado hace más de una hora, está en status 'creado', otro usuario quiere acceder y la ruta no es de revisión
	else if (
		v.creadoEn < v.haceUnaHora && // creado hace más de una hora
		v.registro.statusRegistro_id == creado_id && // en status creado
		!creadoPorElUsuario && // otro usuario quiere acceder
		v.baseUrl != "/revision" // la ruta no es de revisión
	) {
		let nombre = comp.nombresPosibles(v.registro);
		if (nombre) nombre = "'" + nombre + "'";
		let mensajes = [
			"Est" + v.ea + " " + v.entidadNombreMinuscula + " todavía no está revisad" + v.oa + ".",
			"En caso de ser aprobad" + v.oa + " cuando se l" + v.oa + " revise, estará disponible.",
		];
		informacion = {mensajes, iconos: [v.vistaEntendido]};
	}

	// 3. El registro está capturado en forma 'activa', y otro usuario quiere acceder a él
	else if (v.capturadoEn > v.haceUnaHora && v.registro.capturadoPor_id != v.userID && v.registro.capturaActiva)
		informacion = {
			mensajes: [
				"Est" +
					v.ea +
					" " +
					v.entidadNombreMinuscula +
					" está capturad" +
					v.oa +
					" por el usuario " +
					v.registro.capturadoPor.apodo,
				"Estará liberad" + v.oa + " a más tardar el " + v.horarioFinalCaptura,
			],
			iconos: [v.vistaSinCaptura, v.vistaInactivar],
		};
	// 4. El usuario quiere acceder a la entidad que capturó hace más de una hora y menos de dos horas
	else if (v.capturadoEn < v.haceUnaHora && v.capturadoEn > v.haceDosHoras && v.registro.capturadoPor_id == v.userID)
		informacion = {
			mensajes: [
				"Esta captura terminó el " + v.horarioFinalCaptura,
				"Quedó a disposición de los demás " + v.tipoUsuario + ".",
				"Si nadie l" + v.oa + " captura hasta 1 hora después, podrás volver a capturarl" + v.oa + ".",
			],
			iconos: [v.vistaEntendido],
		};
	// 5. El usuario tiene capturado otro registro en forma activa
	else {
		let prodCapturado = await buscaOtrasCapturasActivasDelUsuario();
		if (prodCapturado) {
			// Datos para el mensaje
			const pc = {
				entidad: prodCapturado.entidad,
				id: prodCapturado.id,
				entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(prodCapturado.entidad),
				elLa: comp.obtieneDesdeEntidad.elLa(prodCapturado.entidad),
				oa: comp.obtieneDesdeEntidad.oa(prodCapturado.entidad),
			};
			const originalUrl = encodeURIComponent(req.originalUrl);
			const linkInactivar = "/inactivar-captura/?entidad=" + pc.entidad + "&id=" + pc.id + "&urlDestino=" + originalUrl;
			const liberar = {
				clase: "fa-circle-check",
				link: linkInactivar,
				titulo: "Liberar automáticamente",
				autofocus: true,
			};
			const horario = comp.fechaHora.fechaHorario(prodCapturado.capturadoEn);
			// Preparar la información
			const nombre = comp.nombresPosibles(prodCapturado);
			informacion = {
				mensajes: [
					"Tenés que liberar" +
						pc.elLa +
						pc.entidadNombre.toLowerCase() +
						" '" +
						nombre +
						"', que está reservad" +
						pc.oa +
						" desde el " +
						horario,
				],
				iconos: [v.vistaSinCaptura, liberar],
			};
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
