"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad;
	const id = req.query.id;
	const baseUrl = req.baseUrl;
	let informacion;
	let statusEsperados_id = [];

	// Obtiene el registro
	const registro = await BD_genericas.obtienePorId(entidad, id);
	const statusActual = status_registros.find((n) => n.id == registro.status_registro_id);

	// Status Esperado
	(() => {
		const ruta = req.path;
		statusEsperados_id = false
			? false
			: // Preguntas para 'CRUD'
			baseUrl == "/producto" || baseUrl == "/rclv"
			? ruta == "/edicion/"
				? [creado_id, creado_aprob_id, aprobado_id]
				: ruta == "/inactivar/"
				? [creado_aprob_id, aprobado_id]
				: ruta == "/recuperar/" || ruta == "/eliminar/"
				? [inactivo_id]
				: [99]
			: baseUrl == "/links" && ruta == "/abm/"
			? [creado_id, aprobado_id]
			: // Preguntas para 'Revisión'
			baseUrl == "/revision"
			? ruta.includes("/alta/") // para 'producto' y 'rclv'
				? [creado_id]
				: ruta.includes("/edicion/")
				? [creado_aprob_id, aprobado_id]
				: ruta.includes("/inactivar-o-recuperar/")
				? [inactivar_id, recuperar_id]
				: ruta.includes("/links/")
				? [aprobado_id]
				: ruta.includes("/rechazo/")
				? [creado_id]
				: ruta.includes("/solapamiento/")
				? [creado_id, aprobado_id]
				: [99]
			: [99];
	})();

	// Verifica si el registro está en un status incorrecto
	if (!statusEsperados_id.includes(statusActual.id)) {
		// Variables para el mensaje
		let statusActualNombre = statusActual.nombre;
		let statusEsperadoNombres = "";
		statusEsperados_id.forEach((statusEsperado_id, i) => {
			// Si es el segundo status, le antepone la palabra 'o'
			if (i) statusEsperadoNombres += "' o '";
			// Le agrega un nombre de status
			statusEsperadoNombres += status_registros.find((n) => n.id == statusEsperado_id).nombre;
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
