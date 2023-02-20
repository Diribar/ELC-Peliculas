"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad;
	const id = req.query.id;
	const baseUrl = req.baseUrl;
	let informacion;
	let statusEsperados_id = [];

	// Obtiene el registro
	const registro = await BD_genericas.obtienePorId(entidad, id);
	const statusActual = status_registro.find((n) => n.id == registro.status_registro_id);

	// Status Esperado
	// console.log(17, req.baseUrl, req.path);
	(() => {
		const path = req.path;
		statusEsperados_id =
			baseUrl == "/revision"
				? path.includes("/alta/")
					? [creado_id]
					: path.includes("/edicion/")
					? [creado_aprob_id, aprobado_id]
					: path.includes("/inactivar-o-recuperar/")
					? [inactivar_id, recuperar_id]
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
			statusEsperadoNombres += status_registro.find((n) => n.id == statusEsperado_id).nombre;
		});
		let articulo = statusEsperados_id.length == 1 ? "el" : "los";

		// Variables para el ícono
		let origen = FN_origen(baseUrl);
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
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};

// Funciones
let FN_origen = (baseUrl) => {
	return baseUrl == "/revision/usuarios"
		? "tableroUs"
		: baseUrl == "/revision"
		? "tableroEnts"
		: baseUrl == "/producto"
		? "DT_prod"
		: baseUrl == "/rclv"
		? "DT_RCLV"
		: "";
};
