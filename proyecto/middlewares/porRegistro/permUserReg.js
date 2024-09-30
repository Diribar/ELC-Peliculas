"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.params.entidad ? req.params.entidad : req.baseUrl.slice(1);
	const {id} = req.query;
	const familia = comp.obtieneDesdeEntidad.familia(entidad);
	const rubro = req.originalUrl.startsWith("/revision/")
		? "revision"
		: req.originalUrl.startsWith("/producto/") || req.originalUrl.startsWith("/links/abm/")
		? "producto"
		: req.originalUrl.startsWith("/rclv/")
		? "rclv"
		: null;

	let v = {
		// Generales
		origen: req.query.origen,
		haceUnaHora: comp.fechaHora.nuevoHorario(-1),
		haceDosHoras: comp.fechaHora.nuevoHorario(-2),
		usuario: req.session.usuario,
		usuario_id: req.session.usuario.id,
		tipoUsuario: req.originalUrl.startsWith("/revision/") ? "revisores" : "usuarios",
		include: ["statusRegistro"],
		baseUrl: comp.partesDelUrl(req).baseUrl,

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
		vistaInactivar: rubro ? variables.vistaInactivar[rubro](entidad, id) : {},
		vistaAnteriorTablero: v.usuario.rolUsuario.autTablEnts ? [v.vistaSinCaptura, v.vistaTablero] : [v.vistaSinCaptura],
	};

	// Más variables
	if (entidad != "usuarios") v.include.push("ediciones");
	if (entidad == "capitulos") v.include.push("coleccion");
	v.registro = await baseDeDatos.obtienePorId(entidad, id, v.include);
	v.creadoEn = v.registro.creadoEn;
	v.creadoEn.setSeconds(0);
	v.horarioFinalCreado = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, v.creadoEn));

	// Corrige el link de 'entendido'
	if (req.originalUrl.startsWith("/" + familia + "/edicion"))
		v.vistaEntendido.link =
			v.origen == "TE" ? "/revision/tablero-de-entidades" : "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

	// CRITERIO: registro en status 'creado' y otro usuario quiere acceder
	const creadoPorElUsuario1 = v.registro.creadoPor_id == v.usuario_id;
	const creadoPorElUsuario2 = entidad == "capitulos" && v.registro.coleccion.creadoPor_id == v.usuario_id;
	const creadoPorElUsuario = creadoPorElUsuario1 || creadoPorElUsuario2;
	if (v.registro.statusRegistro_id == creado_id && !creadoPorElUsuario)
		if (v.creadoEn > v.haceUnaHora) {
			// No transcurrió una hora
			informacionm = {
				mensajes: [
					"Por ahora," + v.elLa + v.entidadNombreMinuscula + " sólo está accesible para su creador.",
					"Estará disponible para su revisión el " + v.horarioFinalCreado + ".",
				],
				iconos: [v.vistaEntendido],
			};
			return res.render("CMP-0Estructura", {informacion});
		}
		// Transcurrió una hora y la ruta no es de revisión
		else if (v.baseUrl != "/revision") {
			informacion = {
				mensajes: [
					"Este registro fue creado por otro usuario y todavía no está revisado.",
					"En caso de ser aprobado cuando se lo revise, estará disponible.",
				],
				iconos: [v.vistaEntendido],
			};
			return res.render("CMP-0Estructura", {informacion});
		}

	// CRITERIOS BASADOS EN LAS CAPTURAS
	const condicion = {
		[Op.or]: [
			{entidad, entidad_id: id},
			{familia, capturadoPor_id: v.usuario_id, capturadoEn: {[Op.gte]: v.haceUnaHora}, activa: true},
		],
	};
	const capturas = await baseDeDatos.obtieneTodosPorCondicion("capturas", condicion, "capturadoPor");
	const captsEsteProdRclv = capturas.filter((n) => n.entidad == entidad && n.entidad_id == id);
	const captsOtroProdRclv = capturas.find((n) => n.entidad != entidad || n.entidad_id != id);
	let captura;

	// CRITERIO: el registro está capturado en forma 'activa' por otro usuario
	captura = captsEsteProdRclv.find((n) => n.capturadoEn > v.haceUnaHora && n.capturadoPor_id != v.usuario_id && n.activa);
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

	// CRITERIO: el usuario quiere acceder al registro que capturó hace más de una hora y menos de dos horas
	captura = captsEsteProdRclv.find(
		(n) => n.capturadoEn < v.haceUnaHora && n.capturadoEn > v.haceDosHoras && n.capturadoPor_id == v.usuario_id
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
		return res.render("CMP-0Estructura", {informacion});
	}

	// CRITERIO: el usuario tiene otro registro de la misma familia, capturado en forma activa
	captura = captsOtroProdRclv;
	if (captura) {
		// Prepara el mensaje
		const {entidad: capturaEnt, entidad_id: capturaEnt_id} = captura;
		const prodRclvCapturado = await baseDeDatos.obtienePorId(capturaEnt, capturaEnt_id);
		// Acciones si no existe ese registro
		if (!prodRclvCapturado) {
			await baseDeDatos.eliminaPorCondicion("capturas", {entidad: capturaEnt, entidad_id: capturaEnt_id});
			return res.redirect(req.originalUrl);
		}
		const mensajes = [
			"Tenés que liberar" +
				comp.obtieneDesdeEntidad.elLa(capturaEnt) +
				comp.obtieneDesdeEntidad.entidadNombre(capturaEnt).toLowerCase() +
				" '" +
				comp.nombresPosibles(prodRclvCapturado) +
				"', que está reservad" +
				comp.obtieneDesdeEntidad.oa(capturaEnt) +
				" desde el " +
				comp.fechaHora.fechaHorario(captura.capturadoEn),
		];

		// Datos para el link
		const originalUrl = encodeURIComponent(req.originalUrl);
		const linkInactivar = "/miscelaneas/ic/" + capturaEnt + "/?id=" + capturaEnt_id + "&urlDestino=" + originalUrl;
		const liberar = {
			clase: iconos.check,
			link: linkInactivar,
			titulo: "Liberar automáticamente",
			autofocus: true,
		};
		const iconosInfo = [v.vistaSinCaptura, liberar];

		// Fin
		return res.render("CMP-0Estructura", {informacion: {mensajes, iconos: iconosInfo}});
	}

	// Fin
	return next();
};
// Variables
let informacion;
