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
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const entidad_id = req.query.id;
	const familia = comp.obtieneDesdeEntidad.familia(entidad);

	let v = {
		// Generales
		origen: req.query.origen,
		haceUnaHora: comp.fechaHora.nuevoHorario(-1),
		haceDosHoras: comp.fechaHora.nuevoHorario(-2),
		usuario: req.session.usuario,
		userId: req.session.usuario.id,
		tipoUsuario: req.originalUrl.startsWith("/revision/") ? "revisores" : "usuarios",
		include: ["statusRegistro"],
		baseUrl: comp.reqBasePathUrl(req).baseUrl,

		// Vistas
		vistaSinCaptura: variables.vistaAnterior(req.session.urlSinCaptura),
		vistaEntendido: variables.vistaEntendido(req.session.urlSinCaptura),
		vistaTablero: variables.vistaTablero,
	};
	v = {
		...v,
		entidadNombreMinuscula: comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase(),
		elLa: comp.obtieneDesdeEntidad.elLa(entidad),
		oa: comp.obtieneDesdeEntidad.oa(entidad),
		ea: comp.obtieneDesdeEntidad.oa(entidad),

		// Vistas
		vistaInactivar: rubro ? variables.vistaInactivar[rubro](entidad, entidad_id) : {},
		vistaAnteriorTablero: v.usuario.rolUsuario.autTablEnts ? [v.vistaSinCaptura, v.vistaTablero] : [v.vistaSinCaptura],
	};

	// Más variables
	if (entidad != "usuarios") v.include.push("ediciones");
	if (entidad == "capitulos") v.include.push("coleccion");
	v.registro = await baseDeDatos.obtienePorId(entidad, entidad_id, v.include);
	v.creadoEn = v.registro.creadoEn;
	v.creadoEn.setSeconds(0);
	v.horarioFinalCreado = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, v.creadoEn));

	// Corrige el link de 'entendido'
	if (req.originalUrl.startsWith("/" + familia + "/edicion"))
		v.vistaEntendido.link =
			v.origen == "TE"
				? "/revision/tablero-de-entidades"
				: "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + entidad_id;

	// CRITERIO: registro en status 'creado', otro usuario quiere acceder y no transcurrió una hora
	const creadoPorElUsuario1 = v.registro.creadoPor_id == v.userId;
	const creadoPorElUsuario2 = entidad == "capitulos" && v.registro.coleccion.creadoPor_id == v.userId;
	const creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;
	if (
		v.registro.statusRegistro_id == creado_id && // en status creado
		!creadoPorElUsuario && // otro usuario quiere acceder
		v.creadoEn > v.haceUnaHora && // no transcurrió una hora
		entidad != "usuarios"
	) {
		informacionm = {
			mensajes: [
				"Por ahora," + v.elLa + v.entidadNombreMinuscula + " sólo está accesible para su creador.",
				"Estará disponible para su revisión el " + v.horarioFinalCreado + ".",
			],
			iconos: [v.vistaEntendido],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// CRITERIO: registro en status 'creado', otro usuario quiere acceder y la ruta no es de revisión
	if (
		v.registro.statusRegistro_id == creado_id && // en status creado
		!creadoPorElUsuario && // otro usuario quiere acceder
		v.baseUrl != "/revision" // la ruta no es de revisión
	) {
		informacion = {
			mensajes: [
				"Este registro todavía no está revisado.",
				"En caso de ser aprobado cuando se lo revise, estará disponible.",
			],
			iconos: [v.vistaEntendido],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// CRITERIOS BASADOS EN LAS CAPTURAS
	const condicion = {[Op.or]: [{entidad, entidad_id}, {capturadoPor_id: v.userId}]};
	const capturas = await baseDeDatos.obtieneTodosPorCondicion("capturas", condicion, "capturadoPor");
	console.log(95, capturas);

	let captura;

	// CRITERIO: el registro está capturado en forma 'activa' por otro usuario
	captura = capturas.find(
		(n) =>
			n.entidad == entidad &&
			n.entidad_id == entidad_id &&
			n.capturadoEn > v.haceUnaHora &&
			n.capturadoPor_id != v.userId &&
			n.capturaActiva
	);
	if (captura) {
		const horarioFinalCaptura = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, captura.capturadoEn));
		informacion = {
			mensajes: [
				"Este registro está capturado por el usuario " + captura.capturadoPor.apodo,
				"Estará liberado a más tardar el " + horarioFinalCaptura,
			],
			iconos: [v.vistaSinCaptura, v.vistaInactivar],
		};
		return res.render("CMP-0Estructura", {informacion});
	}

	// CRITERIO: el usuario quiere acceder a la entidad que capturó hace más de una hora y menos de dos horas
	captura = capturas.find(
		(n) =>
			n.entidad == entidad &&
			n.entidad_id == entidad_id &&
			n.capturadoEn < v.haceUnaHora &&
			n.capturadoEn > v.haceDosHoras &&
			n.capturadoPor_id == v.userId
	);
	if (captura) {
		const horarioFinalCaptura = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, captura.capturadoEn));
		informacion = {
			mensajes: [
				"Esta captura terminó el " + horarioFinalCaptura,
				"Quedó a disposición de los demás " + v.tipoUsuario + ".",
				"Si nadie l" + v.oa + " captura hasta 1 hora después, podrás volver a capturarl" + v.oa + ".",
			],
			iconos: [v.vistaEntendido],
		};
		return res.render("CMP-0Estructura", {});
	}

	// CRITERIO: averigua si el usuario tiene otro registro capturado en forma activa
	captura = capturas.find(
		(n) =>
			(n.entidad != entidad || n.entidad_id != entidad_id) &&
			n.familia == familia &&
			n.capturadoPor_id == v.userId &&
			n.capturadoEn > v.haceUnaHora &&
			n.activa == true
	);
	if (captura) {
		// Prepara el mensaje
		const registroCapturado = await baseDeDatos.obtienePorId(captura.entidad, captura.entidad_id);
		const mensajes = [
			"Tenés que liberar" +
				comp.obtieneDesdeEntidad.elLa(captura.entidad) +
				comp.obtieneDesdeEntidad.entidadNombre(captura.entidad).toLowerCase() +
				" '" +
				comp.nombresPosibles(registroCapturado) +
				"', que está reservad" +
				comp.obtieneDesdeEntidad.oa(captura.entidad) +
				" desde el " +
				comp.fechaHora.fechaHorario(captura.capturadoEn),
		];

		// Datos para el link
		const originalUrl = encodeURIComponent(req.originalUrl);
		const linkInactivar =
			"/inactivar-captura/?entidad=" + captura.entidad + "&id=" + captura.entidad_id + "&urlDestino=" + originalUrl;
		const liberar = {
			clase: "fa-circle-check",
			link: linkInactivar,
			titulo: "Liberar automáticamente",
			autofocus: true,
		};
		const iconos = [v.vistaSinCaptura, liberar];

		// Fin
		return res.render("CMP-0Estructura", {informacion: {mensajes, iconos}});
	}

	// Fin
	next();
};
// Variables
let informacion;
