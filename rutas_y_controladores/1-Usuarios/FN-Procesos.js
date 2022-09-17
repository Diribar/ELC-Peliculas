"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	// ControladorVista: loginGuardar, altaPerennesGuardar, altaEditablesGuardar
	actualizaElUsuario: async (statusDeseado, statusPosterior, usuario, novedades) => {
		// Obtiene el nuevo status
		let statusNuevo = status_registro_us.find((n) => n[statusDeseado] && !n[statusPosterior]);
		// Genera la info a actualizar
		novedades = {
			...novedades,
			status_registro_id: statusNuevo.id,
		};
		// Actualiza la info
		await BD_genericas.actualizarPorId("usuarios", usuario.id, novedades);
		usuario = {...usuario, ...novedades, status_registro: statusNuevo};
		// Fin
		return usuario;
	},
	// ControladorVista: loginGuardar
	actualizarElContadorDeLogins: (usuario, hoyAhora) => {
		let hoyUsuario = usuario.fecha_ultimo_login;
		//new Date(usuario.fecha_ultimo_login).toISOString().slice(0, 10);
		if (hoyAhora != hoyUsuario) {
			BD_genericas.aumentarElValorDeUnCampo("usuarios", usuario.id, "dias_login");
			BD_genericas.actualizarPorId("usuarios", usuario.id, {fecha_ultimo_login: hoyAhora});
		}
		return;
	},
	// ControladorVista: altaMail y olvidoContr
	enviaMailConContrasena: (req) => {
		// Prepara los datos
		let asunto = "Contraseña para ELC";
		let email = req.body.email;
		let contrasena = Math.round(Math.random() * Math.pow(10, 10)).toString();
		// Envía el mail al usuario con la contraseña
		let comentario = "La contraseña del mail " + email + " es: " + contrasena;
		compartidas.enviarMail(asunto, email, comentario).catch(console.error);
		// Obtiene el horario de envío de mail
		let ahora = compartidas.ahora().setSeconds(0); // Descarta los segundos en el horario
		// Genera el registro
		contrasena = bcryptjs.hashSync(contrasena, 10);
		// Fin
		return {ahora, contrasena};
	},
	// Genera el cartel de información
	cartelInformacion: (codigo) => {
		// Datos para la vista
		let informacion = {
			mensajes: ["Te hemos enviado una contraseña por mail.", "Usala para ingresar al login."],
			iconos: [variables.vistaEntendido("/usuarios/login")],
			titulo: "La generación de una nueva contraseña fue exitosa",
			colorFondo: "verde",
		};
		// Agrega un mensaje
		let agregarMensaje =
			codigo == "mail"
				? "Luego de terminar el alta de usuario, podrás cambiarla."
				: codigo == "olvido-contrasena"
				? "Podrás editarla luego del login."
				: "";
		informacion.mensajes.push(agregarMensaje);
		// Fin
		return informacion;
	},
};
