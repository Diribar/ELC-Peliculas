"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	// ControlVista: loginGuardar, altaPerennesGuardar, altaEditablesGuardar
	actualizaElStatusDelUsuario: async (usuario, status, novedades) => {
		// Obtiene el nuevo status
		let statusNuevo = status_registro_us.find((n) => n[status]);
		// Genera la info a actualizar
		novedades = {...novedades, status_registro_id: statusNuevo.id};
		// Actualiza la info
		await BD_genericas.actualizaPorId("usuarios", usuario.id, novedades);
		usuario = {...usuario, ...novedades, status_registro: statusNuevo};
		// Fin
		return usuario;
	},
	// ControlVista: loginGuardar
	actualizaElContadorDeLogins: (usuario, hoyAhora) => {
		let fechaUltimoLogin = usuario.fecha_ultimo_login;
		//new Date(usuario.fecha_ultimo_login).toISOString().slice(0, 10);
		if (hoyAhora != fechaUltimoLogin) {
			BD_genericas.aumentaElValorDeUnCampo("usuarios", usuario.id, "dias_login");
			BD_genericas.actualizaPorId("usuarios", usuario.id, {fecha_ultimo_login: hoyAhora});
		}
		return;
	},
	// ControlVista: altaMail y olvidoContr
	enviaMailConContrasena: async (req) => {
		// Prepara los datos
		let asunto = "Contraseña para ELC";
		let email = req.body.email;
		let contrasena = Math.round(Math.random() * Math.pow(10, 10)).toString();
		console.log(contrasena);
		// Envía el mail al usuario con la contraseña
		let comentario = "La contraseña del mail " + email + " es: " + contrasena;
		let feedbackEnvioMail = await comp.enviarMail(asunto, email, comentario, req);
		// Obtiene el horario de envío de mail
		let ahora = comp.ahora().setSeconds(0); // Descarta los segundos en el horario
		// Genera el registro
		contrasena = bcryptjs.hashSync(contrasena, 10);
		// Fin
		return {ahora, contrasena, feedbackEnvioMail};
	},
	// Genera el cartel de información
	cartelNuevaContrasena: {
		mensajes: [
			"Te hemos enviado una contraseña por mail.",
			"Por favor, usala para ingresar al login.",
			"Haciendo click abajo de este mensaje, vas al Login.",
		],
		iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
		titulo: "La generación de una nueva contraseña fue exitosa",
		check: true,
	},
	cartelAltaExitosa: {
		mensajes: [
			"Hemos generado tu usuario con éxito, con esa dirección de mail.",
			"También hemos generado un contraseña, te la hemos enviado por mail.",
			"Con el ícono de abajo accedes al Login. Usá esa contraseña.",
		],
		iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
		titulo: "Alta exitosa de Usuario",
		check: true,
	},
};
