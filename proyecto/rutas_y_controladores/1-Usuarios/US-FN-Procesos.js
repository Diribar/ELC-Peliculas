"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");

module.exports = {
	// ControlVista: loginGuardar, altaPerennesGuardar, altaEditablesGuardar
	actualizaElStatusDelUsuario: async (usuario, status, novedades) => {
		// Obtiene el nuevo status
		let statusNuevo = statusRegistrosUs.find((n) => n.codigo == status);

		// Genera la info a actualizar
		novedades = {...novedades, statusRegistro_id: statusNuevo.id};

		// Actualiza la info
		await BD_genericas.actualizaPorId("usuarios", usuario.id, novedades);
		usuario = {...usuario, ...novedades};

		// Fin
		return usuario;
	},
	// ControlVista: loginGuardar
	actualizaElContadorDeLogins: (usuario) => {
		// Variables
		const ahoraUTC = comp.fechaHora.ahora().getTime();
		const zonaHorariaUsuario = paises.find((n) => n.id == usuario.pais_id).zonaHoraria;
		const ahoraUsuario = ahoraUTC + zonaHorariaUsuario * unaHora;
		const hoyUsuario = new Date(ahoraUsuario).toISOString().slice(0, 10);
		const fechaUltimoLogin = usuario.fechaUltimoLogin;

		// Acciones si el último login fue anterior a hoy
		if (hoyUsuario != fechaUltimoLogin) {
			BD_genericas.aumentaElValorDeUnCampo("usuarios", usuario.id, "diasLogin");
			BD_genericas.actualizaPorId("usuarios", usuario.id, {fechaUltimoLogin: hoyUsuario});
		}

		// Fin
		return;
	},
	// ControlVista: altaMail y olvidoContr
	envioDeMailConContrasena: async (email) => {
		// Variables
		const asunto = "Contraseña para ELC";

		// Contraseña
		let contrasena = Math.round(Math.random() * Math.pow(10, 6))
			.toString()
			.padStart(6, "0"); // más adelante cambia por la codificada
		const comentario = "La contraseña para el mail " + email + " es: " + contrasena;
		console.log("Contraseña: " + contrasena);
		contrasena = bcryptjs.hashSync(contrasena, 10);

		// Envía el mail al usuario con la contraseña
		const mailEnviado = await comp.enviaMail({asunto, email, comentario});
		const ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario

		// Fin
		return {ahora, contrasena, mailEnviado};
	},

	// Carteles de información
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
	envioExitoso: {
		mensajes: [
			"Hemos generado tu usuario con tu dirección de mail.",
			"Te hemos enviado por mail la contraseña.",
			"Con el ícono de abajo accedés al Login.",
		],
		iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
		titulo: "Alta exitosa de Usuario",
		check: true,
	},
	envioFallido: {
		mensajes: [
			"No pudimos enviarte un mail con la contraseña.",
			"Revisá tu conexión a internet y volvé a intentarlo.",
			"Con el ícono de abajo regresás a la vista anterior.",
		],
		iconos: [{...variables.vistaEntendido("/usuarios/alta-mail"), titulo: "Entendido e ir a la vista anterior"}],
		titulo: "Alta de Usuario fallida",
	},
	infoNoPerenne: (req) => {
		// Variables
		const {entidad, id, origen} = req.query;
		const linkVolver =
			entidad && id
				? "/inactivar-captura/?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "")
				: req.session.urlSinPermInput;

		// Fin
		return {
			mensajes: [
				"El ingreso de información pública requiere responsabilidad.",
				"Te pedimos que cuides la reputación de tu usuario.",
				"Podés iniciar el trámite con la flecha hacia la derecha.",
			],
			iconos: [
				{
					nombre: "fa-circle-left",
					link: linkVolver,
					titulo: "Ir a la vista anterior",
				},
				{
					nombre: "fa-circle-right",
					link: "/usuarios/perennes",
					titulo: "Ir a 'Solicitud de Autorización de Inputs'",
					autofocus: true,
				},
			],
			titulo: "Aviso",
			trabajando: true,
		};
	},
};
