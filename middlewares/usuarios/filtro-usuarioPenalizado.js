"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	req.session.usuario = await BD_especificas.obtieneUsuarioPorMail(req.session.usuario.email);
	let usuario = req.session.usuario;
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinLogin);
	let informacion;

	// Penalidad acumulada. Debe ser await para que primero se bloquee y después se fije si está bloqueado
	await (async () => {
		let datos = {};
		let penalizac_acum = parseInt(usuario.penalizac_acum);
		if (penalizac_acum) {
			// Variables
			let ahora = comp.ahora().setHours(0, 0, 0);
			// Agregar valores en datos
			let penalizadoDesde = Math.max(ahora, usuario.penalizado_hasta);
			datos.penalizado_hasta = penalizadoDesde + penalizac_acum * unDia;
			datos.penalizac_acum = usuario.penalizac_acum - penalizac_acum;
			// Si el usuario no tenía una penalización vigente, se actualiza la fecha 'penalizado_en'
			if (usuario.penalizado_hasta <= ahora) datos.penalizado_en = ahora;
			// Activa el cartel de Responsabilidad para la siguiente vez que se quiera agregar una entidad
			datos.mostrar_cartel_respons = true;
		}
		// Actualiza el registro
		await BD_genericas.actualizaPorId("usuarios", usuario.id, datos);
		// Actualizar la variable usuario
		usuario = {...usuario, ...datos};
	})();

	// VERIFICACIÓN
	if (!informacion) {
		if (usuario.penalizado_hasta && usuario.penalizado_hasta > comp.ahora()) {
			let fecha = comp.fechaTexto(usuario.penalizado_hasta);
			informacion = {
				mensajes: [
					"Hemos recibido información tuya, a la que le hemos hecho observaciones comunicadas por mail.",
					"Podrás volver a ingresar información el día " + fecha + ".",
				],
				iconos: [vistaAnterior],
			};
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
