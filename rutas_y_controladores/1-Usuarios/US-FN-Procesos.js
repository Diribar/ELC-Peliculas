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
	enviaMailConContrasena: async (req) => {
		// Variables
		const asunto = "Contraseña para ELC";
		const email = req.body.email;
		const pausa = 200;
		const tiempoEstimado = 10 * 1000;

		// Contraseña
		let contrasena = Math.round(Math.random() * Math.pow(10, 6)).toString(); // más adelante cambia por la codificada
		const comentario = "La contraseña del mail " + email + " es: " + contrasena;
		console.log("Contraseña: " + contrasena);
		contrasena = bcryptjs.hashSync(contrasena, 10);

		// Envía el mail al usuario con la contraseña
		let feedbackEnvioMail = comp.enviarMail(asunto, email, comentario, req);
		const inicio = Date.now();

		for (let repeticion = 0; repeticion < parseInt(tiempoEstimado / pausa); repeticion++) {
			await espera(200);
		}
		const fin1 = Date.now();
		const dif1 = fin1 - inicio;
		console.log(59, dif1, parseInt((dif1 / tiempoEstimado - 1) * 100) + "%");
		feedbackEnvioMail = await feedbackEnvioMail;
		const fin2 = Date.now();
		console.log(62, fin2 - fin1);

		// Obtiene el horario de envío de mail
		let ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario

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
let espera = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
