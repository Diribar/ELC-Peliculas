"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = req.query.entidad;
	const entID = req.query.id;
	const userID = req.session.usuario.id;
	const registro = await BD_genericas.obtienePorId(entidad, entID);
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const haceUnaHora = comp.fechaHora.nuevoHorario(-1);
	const horarioFinalCaptura = comp.fechaHora.fechaHorario(comp.fechaHora.nuevoHorario(1, registro.capturadoEn));
	let informacion;

	// Revisa si fue creado por el usuario
	if (registro.creadoPor_id != userID)
		informacion = {
			mensajes: ["El registro no fue creado por vos."],
			iconos: [vistaAnterior],
		};
	// El registro está capturado en forma 'activa' por otra persona
	else if (registro.capturadoEn > haceUnaHora && registro.capturadoPor_id != userID && registro.capturaActiva)
		informacion = {
			mensajes: [
				"El registro está capturado por " + registro.capturadoPor.apodo + ".",
				"Estará liberado a más tardar el " + horarioFinalCaptura,
			],
			iconos: [vistaAnterior],
		};

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
