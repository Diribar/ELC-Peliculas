"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const datos = req.session.datosOriginales
		? req.session.datosOriginales
		: req.cookies.datosOriginales
		? req.cookies.datosOriginales
		: "";
	let informacion;

	// Controles
	if (!datos)
		informacion = {
			mensajes: ["No podemos identificar la película.", "Necesitamos que retrocedas un paso"],
			iconos: [variables.vistaEntendido(req.session.urlAnterior)],
		};
	else if (datos.fuente != "IM") {
		// Averigua si existe
		const fuente_id = datos.fuente + "_id";
		const existe = await baseDeDatos.obtienePorCondicion(datos.entidad, {[fuente_id]: datos[fuente_id]});

		// Acciones si existe
		if (existe) {
			// Variables
			const linkAnterior = "agregar-ds";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(datos.entidad);
			const vistaAnterior = variables.vistaAnterior(linkAnterior);
			const vistaInactivar = variables.vistaInactivar.prodRclv(datos.entidad, existe.id, "p");

			// Información para el cartel
			informacion = {
				mensajes: [
					"La " + entidadNombre + " ya está en nuestra BD.",
					"Podés ver el detalle, con el ícono de abajo a la derecha",
				],
				iconos: [vistaAnterior, vistaInactivar],
			};

			// Elimina los hallazgos anteriores
			delete req.session.desambiguar;
		}
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
