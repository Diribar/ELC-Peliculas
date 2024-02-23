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
		const hoy = new Date().toISOString().slice(0, 10);
		let fechaUltimoLogin = usuario.fechaUltimoLogin;

		// Acciones si el último login fue anterior a hoy
		if (hoy != fechaUltimoLogin) {
			fechaUltimoLogin = hoy;

			// Actualiza el usuario
			BD_genericas.actualizaPorId("usuarios", usuario.id, {fechaUltimoLogin});
			BD_genericas.aumentaElValorDeUnCampo("usuarios", usuario.id, "diasLogin");

			// Agrega un registro de login del día
			BD_genericas.agregaRegistro("loginsDelDia", {usuario_id: usuario.id});
		}

		// Fin
		return {...usuario, fechaUltimoLogin};
	},
	// ControlVista: altaMail y olvidoContr
	envioDeMailConContrasena: async (email) => {
		// Variables
		const asunto = "Contraseña para ELC";

		// Contraseña
		let contrasena = Math.round(Math.random() * Math.pow(10, 6))
			.toString()
			.padStart(6, "0"); // más adelante cambia por la codificada

		// Comentario
		let comentario = "";
		comentario += "<br>" + "¡Hola!";
		comentario += "<br>" + "Ya tenés tu usuario para usar en nuestro sitio.";
		comentario += "<br>" + "La contraseña es: <bold><u>" + contrasena +"</u></bold>"
		comentario += "<br>" + "Necesitamos que la uses antes de que transcurran 24hs.";
		comentario += "<br>" + "Si no se usa dentro de ese plazo, se dará de baja el usuario.";

		// Envía el mail al usuario con la contraseña
		const mailEnviado = await comp.enviaMail({asunto, email, comentario});

		// Fin
		console.log("Contraseña: " + contrasena);
		contrasena = bcryptjs.hashSync(contrasena, 10);
		return {contrasena, mailEnviado};
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
				"El ingreso de información a compartir con nuestros usuarios, requiere responsabilidad y será revisada por nuestro equipo de revisores.",
				"Te pedimos que cuides nuestra reputación.",
				"Podés gestionar el permiso con la flecha hacia la derecha.",
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
