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
		let statusNuevo = statusRegistrosUs.find((n) => n[status]);
		// Genera la info a actualizar
		novedades = {...novedades, statusRegistro_id: statusNuevo.id};
		// Actualiza la info
		await BD_genericas.actualizaPorId("usuarios", usuario.id, novedades);
		usuario = {...usuario, ...novedades, statusRegistro: statusNuevo};
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
	usuarioDelMail: async (email) => {
		const usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
		return usuario;
	},
	envioDeMailConContrasena: async (email) => {
		// Variables
		const asunto = "Contraseña para ELC";

		// Contraseña
		let contrasena = Math.round(Math.random() * Math.pow(10, 6)).toString(); // más adelante cambia por la codificada
		const comentario = "La contraseña para el mail " + email + " es: " + contrasena;
		console.log("Contraseña: " + contrasena);
		contrasena = bcryptjs.hashSync(contrasena, 10);

		// Envía el mail al usuario con la contraseña
		const feedbackEnvioMail = await comp.enviarMail({asunto, email, comentario});
		const ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario

		// Fin
		return {ahora, contrasena, feedbackEnvioMail};
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
			"Hemos generado un contraseña para tu uso, que te hemos enviado por mail.",
			"Con ella y tu dirección de mail, hemos generado tu usuario.",
			"Con el ícono de abajo accedes al Login.",
		],
		iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
		titulo: "Alta exitosa de Usuario",
		check: true,
	},
	envioFallido: {
		mensajes: [
			"No pudimos enviarte un mail con la contraseña generada por nuestro sistema.",
			"Por esa razón no podemos avanzar.",
			"Con el ícono de abajo regresas a la vista anterior.",
		],
		iconos: [{...variables.vistaEntendido("/usuarios/alta-mail"), titulo: "Entendido e ir a la vista anterior"}],
		titulo: "Alta de Usuario fallida",
	},
	feedbackSobreIdentidadValidada: (req) => {
		// Variables
		const usuario = req.session.usuario;
		const {entidad, id, origen} = req.query;
		const linkVolver = entidad && id ? "/inactivar-captura/?entidad=" + entidad + "&id=" + id : "/";
		let informacion;

		// Mensaje si el usuario está en status "identidad a validar"
		if (usuario.statusRegistro.identPendValidar)
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
		else if (usuario.statusRegistro.editables)
			informacion = {
				mensajes: [
					"El ingreso de información para otras personas, requiere responsabilidad.",
					"Para asegurarnos eso, cada persona debe tener un único usuario de por vida, cuya reputación debe cuidar.",
					"Si querés avanzar, necesitamos validar tu identidad con tu documento.",
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
