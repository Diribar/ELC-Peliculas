"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	statusCorrecto: (status_id) => {
		return async (req, res, next) => {
			// Variables
			const entidad = req.query.entidad;
			const id = req.query.id;
			let informacion;

			// Obtiene el registro
			const registro = await BD_genericas.obtienePorId(entidad, id);
			const statusActual = status_registro.find((n) => n.id == registro.status_registro_id);

			// Verifica si el registro está en un status incorrecto
			if (statusActual.id != status_id) {
				let statusEsperadoNombre = status_registro.find((n) => n.id == status_id).nombre;
				let statusActualNombre = statusActual.nombre;
				let vistaInactivar = variables.vistaInactivar(req);

				// Información a mostrar
				informacion = {
					mensajes: [
						"El registro no está en el status esperado.",
						"Se esperaba que estuviera en el status '" + statusEsperadoNombre + "'.",
						"Está en el status '" + statusActualNombre + "'.",
					],
					iconos: [vistaInactivar],
				};
			}

			// Conclusiones
			if (informacion) res.render("CMP-0Estructura", {informacion});
			else next();
		};
	},
};
