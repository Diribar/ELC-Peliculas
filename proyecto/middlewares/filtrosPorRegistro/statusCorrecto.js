"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad ? req.query.entidad : req.originalUrl.startsWith("/revision/usuarios") ? "usuarios" : "";
	const id = req.query.id;
	const {baseUrl, ruta} = comp.reqBasePathUrl(req);
	const statusEsperados_id = FN_statusEsperados_id(baseUrl, ruta);
	let informacion;

	// Obtiene el statusActual
	const registro = await BD_genericas.obtienePorId(entidad, id);
	const statusActual =
		entidad == "usuarios"
			? statusRegistrosUs.find((n) => n.id == registro.statusRegistro_id)
			: statusRegistros.find((n) => n.id == registro.statusRegistro_id);

	// Verifica si el registro está en un status incorrecto
	if (!statusEsperados_id.includes(statusActual.id)) {
		// Variables para el mensaje
		const statusActualNombre = statusActual.nombre;
		let statusEsperadoNombres = "";
		statusEsperados_id.forEach((statusEsperado_id, i) => {
			if (i) statusEsperadoNombres += i < statusEsperados_id.length - 1 ? "', '" : "' o '"; // Si es el penúltimo status, le antepone la palabra 'o'
			statusEsperadoNombres +=
				entidad == "usuarios"
					? statusRegistrosUs.find((n) => n.id == statusEsperado_id).nombre
					: statusRegistros.find((n) => n.id == statusEsperado_id).nombre; // Le agrega un nombre de status
		});
		let articulo = statusEsperados_id.length == 1 ? "el" : "los";

		// Variables para el ícono
		let origen = req.query.origen;
		if (!origen)
			origen = baseUrl == "/revision/usuarios" ? "TU" : baseUrl == "/revision" ? "TE" : baseUrl == "/rclv" ? "DTR" : "DTP";
		let link = "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen;
		let vistaEntendido = variables.vistaEntendido(link);

		// Información a mostrar
		informacion = {
			mensajes: [
				"El registro no está en el status esperado.",
				"Se esperaba que estuviera en " + articulo + " status '" + statusEsperadoNombres + "'.",
				"Está en el status '" + statusActualNombre + "'.",
			],
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
			? [creado_id, ...aprobados_ids]
			: ruta == "/inactivar/"
			? aprobados_ids
			: ruta == "/recuperar/" || ruta == "/eliminar/"
			? [inactivo_id]
			: ruta == "/calificar/"
			? [creado_id, ...aprobados_ids]
			: [99]
		: baseUrl == "/links" && ruta == "/abm/" // Preguntas para 'Links'
		? [creado_id, ...aprobados_ids]
		: baseUrl == "/revision" // Preguntas para 'Revisión'
		? ruta.includes("/alta/") // para 'producto' y 'rclv'
			? [creado_id]
			: ruta.includes("/edicion/")
			? aprobados_ids
			: ruta.includes("/inactivar-o-recuperar/")
			? [inactivar_id, recuperar_id]
			: ruta.includes("/links/")
			? aprobados_ids
			: ruta.includes("/rechazo/")
			? [creado_id]
			: ruta.includes("/solapamiento/")
			? [creado_id, ...aprobados_ids]
			: [99]
		: [99];
};
