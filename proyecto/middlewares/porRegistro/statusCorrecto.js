"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const {id} = req.query;
	const familia = comp.obtieneDesdeEntidad.familia(entidad);
	const entidades = variables.entidades.todos;
	let statusEsperado_ids, informacion;

	// Obtiene la 'baseUrl' y la 'tarea'
	let {baseUrl, tarea} = comp.partesDelUrl(req);
	baseUrl = baseUrl.slice(1);
	tarea = tarea.slice(1);

	// Obtiene el status esperado - Familia CRUD
	if (!statusEsperado_ids && entidades.includes(baseUrl)) {
		statusEsperado_ids =
			tarea == "edicion"
				? activos_ids
				: tarea == "inactivar"
				? aprobados_ids
				: ["recuperar ", "eliminado"].includes(tarea)
				? [inactivo_id]
				: tarea == "eliminado-por-creador"
				? [creado_id]
				: tarea == "calificar"
				? activos_ids
				: tarea == "abm-links" // abm links
				? activos_ids
				: ["correcion-del-motivo", "correccion-del-status"].includes(tarea) // correcciones
				? [inactivo_id]
				: null;
	}

	// Obtiene el status esperado - Revisión de Entidades
	if (!statusEsperado_ids && baseUrl == "revision") {
		statusEsperado_ids = ["alta", "rechazar"].includes(tarea) // revisar alta y rechazar
			? [creado_id]
			: tarea == "edicion" // edición
			? aprobados_ids
			: tarea == "inactivar" // inactivar
			? [inactivar_id]
			: tarea == "recuperar" // recuperar
			? [recuperar_id]
			: tarea == "links" // links
			? activos_ids
			: tarea == "solapamiento" // solapamiento
			? activos_ids
			: null;
	}

	// Obtiene el status esperado - Solución trivial
	if (!statusEsperado_ids) statusEsperado_ids = [];

	// Obtiene el statusActual
	const registro = await baseDeDatos.obtienePorId(entidad, id);
	const {statusRegistro_id} = registro;

	// Acciones si el status del registro no es el esperado
	if (!statusEsperado_ids.includes(statusRegistro_id)) {
		// Si el status es mayor que 'aprobado' y no existe un historial, interrumpe la función
		if (statusRegistro_id > aprobado_id) {
			const regHistorial = await baseDeDatos.obtienePorCondicion("statusHistorial", {entidad, entidad_id: id});
			if (!regHistorial) return next();
		}

		// Variables para el mensaje
		const statusActual =
			entidad == "usuarios"
				? statusRegistrosUs.find((n) => n.id == statusRegistro_id)
				: statusRegistros.find((n) => n.id == statusRegistro_id);
		const statusActualNombre = statusActual.nombre;

		// Variables para el ícono
		const origen = req.query.origen
			? req.query.origen
			: baseUrl == "revision"
			? familia
				? "TE"
				: "TU"
			: familia == "rclv"
			? "RDT"
			: "PDT";
		const link = "/miscelaneas/ic/" + entidad + "/?id=" + id + "&origen=" + origen;
		const vistaEntendido = variables.vistaEntendido(link);

		// Información a mostrar
		informacion = {
			mensajes: ["El registro no está en el status esperado.", "Está en el status '" + statusActualNombre + "'."],
			iconos: [vistaEntendido],
		};
	}

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else return next();
};
