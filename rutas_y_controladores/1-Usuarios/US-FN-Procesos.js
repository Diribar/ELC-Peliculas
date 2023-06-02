"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

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
	actualizaElContadorDeLogins: (usuario) => {
		// Variables
		const ahoraUTC = comp.fechaHora.ahora().getTime();
		const zonaHorariaUsuario = paises.find((n) => n.id == usuario.pais_id).zona_horaria;
		const ahoraUsuario = ahoraUTC + zonaHorariaUsuario * unaHora;
		const hoyUsuario = new Date(ahoraUsuario).toISOString().slice(0, 10);
		const fechaUltimoLogin = usuario.fecha_ultimo_login;

		// Acciones si el último login fue anterior a hoy
		if (hoyUsuario != fechaUltimoLogin) {
			BD_genericas.aumentaElValorDeUnCampo("usuarios", usuario.id, "dias_login");
			BD_genericas.actualizaPorId("usuarios", usuario.id, {fecha_ultimo_login: hoyUsuario});
		}

		// Fin
		return;
	},
	// ControlVista: altaMail y olvidoContr
	enviaMailConContrasena: async (req) => {
		// Prepara los datos
		let asunto = "Contraseña para ELC";
		let email = req.body.email;
		let contrasena = Math.round(Math.random() * Math.pow(10, 10)).toString();
		console.log("Contraseña: " + contrasena);
		// Envía el mail al usuario con la contraseña
		let comentario = "La contraseña del mail " + email + " es: " + contrasena;
		let feedbackEnvioMail = await comp.enviarMail(asunto, email, comentario, req);
		// Obtiene el horario de envío de mail
		let ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario
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
	feedbackSobreIdentidadValidada: (req) => {
		// Variables
		const usuario = req.session.usuario;
		const {entidad, id, origen} = req.query;
		const linkVolver =
			entidad && id && origen
				? "/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen
				: req.session.urlSinPermInput;
		let informacion;

		// Mensaje si el usuario está en status "identidad a validar"
		if (usuario.status_registro.ident_a_validar)
			informacion = {
				mensajes: [
					"Para ingresar información, se requiere tener tus datos validados.",
					"Nos informaste tus datos el " + comp.fechaHora.fechaHorario(usuario.fechaRevisores) + ".",
					"Tenés que esperar a que el equipo de Revisores haga la validación.",
					"Luego de la validación, recibirás un mail de feedback.",
					"En caso de estar aprobado, podrás ingresarnos información.",
				],
				iconos: [variables.vistaEntendido(linkVolver)],
				titulo: "Aviso",
				trabajando: true,
			};
		// Mensaje si el usuario está en status "editable"
		else if (usuario.status_registro.editables)
			informacion = {
				mensajes: [
					"El ingreso de información para otras personas, requiere responsabilidad.",
					"Para asegurarnos eso, cada persona debe tener un único usuario de por vida, cuya reputación debe cuidar.",
					"Por eso, necesitamos validar tu identidad con tu documento.",
					"Podés iniciar el trámite haciendo click en la flecha hacia la derecha.",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: linkVolver,
						titulo: "Ir a la vista anterior",
					},
					{
						nombre: "fa-circle-right",
						link: "/usuarios/identidad",
						titulo: "Ir a 'Solicitud de Validación de Identidad'",
						autofocus: true,
					},
				],
				titulo: "Aviso",
				trabajando: true,
			};

		// Fin
		return informacion;
	},
};
