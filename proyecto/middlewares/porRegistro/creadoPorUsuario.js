"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id} = req.params;
	const usuario_id = req.session.usuario.id;
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
	let informacion;

	// Revisa si fue creado por el usuario
	const registro = await baseDeDatos.obtienePorId(entidad, id);
	if (registro.creadoPor_id != usuario_id)
		informacion = {
			mensajes: ["El registro no fue creado por vos."],
			iconos: [vistaAnterior],
		};
	// Revisa si está capturado en forma 'activa' por otra persona
	else {
		// Variables
		const condicion = {
			capturadoEn: {[Op.gt]: haceUnaHora},
			capturadoPor_id: {[Op.ne]: usuario_id},
			activa: {[Op.ne]: 1},
		};

		// Acciones si existe una captura activa
		const captura = await baseDeDatos.obtienePorCondicion("capturas", condicion, "capturadoPor");
		if (captura) {
			const horarioFinalCaptura = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, captura.capturadoEn));
			informacion = {
				mensajes: [
					"El registro está capturado por " + captura.capturadoPor.apodo + ".",
					"Estará liberado a más tardar el " + horarioFinalCaptura,
				],
				iconos: [vistaAnterior],
			};
		}
	}

	// Si corresponde, muestra el mensaje
	if (informacion) return res.render("CMP-0Estructura", {informacion});

	// Fin
	return next();
};
