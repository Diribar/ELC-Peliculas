"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const id = req.query.id;
	const {baseUrl, ruta} = comp.reqBasePathUrl(req);
	const statusEsperados_id = FN_statusEsperados_id(baseUrl, ruta);
	let informacion;

	// Obtiene el statusActual
	const registro = await baseDeDatos.obtienePorId(entidad, id);
	const {statusRegistro_id} = registro;
	const statusActual =
		entidad == "usuarios"
			? statusRegistrosUs.find((n) => n.id == registro.statusRegistro_id)
			: statusRegistros.find((n) => n.id == registro.statusRegistro_id);

	// Obtiene un registro del historial
	const regHistorial = await baseDeDatos.obtienePorCondicion("statusHistorial", {entidad, entidad_id: id});

	// Acciones si el status del registro no es el esperado
	if (
		!statusEsperados_id.includes(statusActual.id) && // el status del registro no es el esperado
		((statusRegistro_id > aprobado_id && // el status del registro es mayor que aprobado
			!!regHistorial) || // existe historial
			statusRegistro_id <= aprobado_id)
	) {
		// Variables para el mensaje
		const statusActualNombre = statusActual.nombre;

		// Variables para el ícono
		const origen = req.query.origen
			? req.query.origen
			: baseUrl == "/revision/usuarios"
			? "TU"
			: baseUrl == "/revision"
			? "TE"
			: baseUrl == "/rclv"
			? "DTR"
			: "PDT";
		const link = "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen;
		const vistaEntendido = variables.vistaEntendido(link);

		// Información a mostrar
		informacion = {
			mensajes: ["El registro no está en el status esperado.", "Está en el status '" + statusActualNombre + "'."],
			iconos: [vistaEntendido],
		};
	}

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};

// Funciones
let FN_statusEsperados_id = (baseUrl, ruta) => {
	return false
		? false
		: baseUrl == "/producto" || baseUrl == "/rclv" // Preguntas para 'CRUD'
		? ruta == "/edicion/"
			? activos_ids
			: ruta == "/inactivar/"
			? aprobados_ids
			: ruta == "/recuperar/" || ruta == "/eliminar/"
			? [inactivo_id]
			: ruta == "/eliminadoPorCreador/"
			? [creado_id]
			: ruta == "/calificar/"
			? activos_ids
			: []
		: baseUrl == "/links" && ruta == "/abm/" // Preguntas para 'Links'
		? activos_ids
		: baseUrl == "/revision" // Preguntas para 'Revisión'
		? ruta.includes("/alta/") || ruta.includes("/rechazar/") // para 'producto' y 'rclv'
			? [creado_id]
			: ruta.includes("/edicion/")
			? aprobados_ids
			: ruta.includes("/inactivar/")
			? [inactivar_id]
			: ruta.includes("/recuperar/")
			? [recuperar_id]
			: ruta.includes("/links/")
			? aprobados_ids
			: ruta.includes("/solapamiento/")
			? activos_ids
			: []
		: baseUrl == "/correccion" && ruta == "/motivo/"
		? [inactivo_id]
		: [];
};
