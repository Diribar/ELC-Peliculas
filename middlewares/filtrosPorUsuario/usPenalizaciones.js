"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinLogin);
	const vistaEntendido = variables.vistaEntendido(req.session.urlActual);
	req.session.usuario = await BD_especificas.obtieneUsuarioPorMail(req.session.usuario.email);
	let usuario = req.session.usuario;
	let informacion;

	// Penalidad acumulada. Transforma una penalidad acumulada en penalidad con fecha.
	// Debe ser await para que primero se bloquee y después se fije si está bloqueado
	await (async () => {
		// Variables
		let datos = {};
		let diasPenalizacion = parseInt(usuario.penalizacAcum);

		// Actualiza la penalizacion acumulada
		datos.penalizacAcum = usuario.penalizacAcum - diasPenalizacion;

		// Si la penalización es de 1 día y es un usuario con buen desempeño, se lo perdona
		if (diasPenalizacion == 1) {
			let desempeno = 1 - usuario.edics_rech / (usuario.edics_rech + usuario.edics_aprob);
			if (desempeno >= 0.9) diasPenalizacion--;
		}

		if (diasPenalizacion) {
			// Variables
			let ahora = comp.fechaHora.ahora().setHours(0, 0, 0);
			// Agregar valores en datos
			let penalizadoDesde = Math.max(ahora, usuario.penalizado_hasta);
			datos.penalizado_hasta = penalizadoDesde + diasPenalizacion * unDia;

			// Si el usuario no tenía una penalización vigente, se actualiza la fecha 'penalizado_en'
			if (usuario.penalizado_hasta <= ahora) datos.penalizado_en = ahora;
			// Activa el cartel de "Fin de la Penalización", para cuando ésta termine
			datos.cartel_fin_penaliz = true;
		}

		// Actualiza el usuario
		await BD_genericas.actualizaPorId("usuarios", usuario.id, datos);
		usuario = {...usuario, ...datos};
		req.session.usuario = usuario;

		// Fin
		return;
	})();

	// VERIFICACIÓN 1: Se fija si el usuario está penalizado
	if (!informacion && usuario.penalizado_hasta && usuario.penalizado_hasta > comp.fechaHora.ahora()) {
		let fecha = comp.fechaHora.fechaDiaMesAno(usuario.penalizado_hasta);
		informacion = {
			mensajes: [
				"Hemos procesado la información que nos fuiste brindando.",
				"Le hemos hecho observaciones, que te comunicamos por mail.",
				"Podrás volver a ingresar información el día " + fecha + ".",
			],
			iconos: [vistaAnterior],
		};
	}

	// VERIFICACIÓN 2: Se fija si se tiene que mostrar el cartel de "Fin de la Penalización"
	if (!informacion && usuario.cartel_fin_penaliz) {
		// Actualiza el usuario
		let datos = {cartel_fin_penaliz: false};
		await BD_genericas.actualizaPorId("usuarios", usuario.id, datos);
		usuario = {...usuario, ...datos};
		req.session.usuario = usuario;

		// Cartel de "Fin de la Penalización"
		let fecha = comp.fechaHora.fechaDiaMesAno(usuario.penalizado_hasta);
		informacion = {
			mensajes: ["La penalización concluyó el día " + fecha + ".", "Ya podés ingresar información en nuestro sistema."],
			iconos: [vistaEntendido],
			check: true,
		};
	}

	// Fin
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
