"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.params;
	const familia = comp.obtieneDesdeEntidad.familia(entidad);
	const entidades = variables.entidades.todos;
	let statusEsperados_id = [];
	let informacion;

	// Obtiene la 'baseUrl' y la 'ruta'
	let {baseUrl, ruta} = comp.partesDelUrl(req);
	baseUrl = baseUrl.slice(1);
	ruta = ruta.slice(1);
	console.log(7, {baseUrl, ruta});

	// Obtiene el status esperado - CRUD
	if (!statusEsperados_id && entidades.includes(baseUrl)) {
		statusEsperados_id = ruta.startsWith("ed") // edición
			? activos_ids
			: ruta.startsWith("in") // inactivar
			? aprobados_ids
			: ["rc", "el"].some((n) => ruta.startsWith(n)) // recuperar y eliminar
			? [inactivo_id]
			: ruta.startsWith("ec") // eliminar por el creador
			? [creado_id]
			: ruta == "clp" // calificar producto
			? activos_ids
			: ruta == "abp" // abm links
			? activos_ids
			: ["cm", "cs"].some((n) => ruta.startsWith(n)) // correcciones
			? [inactivo_id]
			: [];
	}

	// Obtiene el status esperado - Revisión de Entidades
	if (!statusEsperados_id && baseUrl == "revision") {
		statusEsperados_id = ["ag", "ch"].some((n) => ruta.startsWith(n)) // revisar alta y rechazar
			? [creado_id]
			: ruta.startsWith("ed") // edición
			? aprobados_ids
			: ruta.startsWith("in") // inactivar
			? [inactivar_id]
			: ruta.startsWith("rc") // recuperar
			? [recuperar_id]
			: ruta == "lkp" // links
			? activos_ids
			: ruta == "rsr" // solapamiento
			? activos_ids
			: [];
	}

	// Obtiene el statusActual
	const registro = await baseDeDatos.obtienePorId(entidad, id);
	const {statusRegistro_id} = registro;

	// Acciones si el status del registro no es el esperado
	if (!statusEsperados_id.includes(statusRegistro_id)) {
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
			: baseUrl == "/revision"
			? familia
				? "TE"
				: "TU"
			: familia == "rclv"
			? "RDT"
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
	else return next();
};
