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
		await baseDeDatos.actualizaPorId("usuarios", usuario.id, novedades);

		// Fin
		return;
	},
	// ControlVista: loginGuardar
	contadorDePersonas: async (usuario_id, visita_id, hoy) => {
		// Actualiza el usuario
		const fechaUltimoLogin = hoy;
		if (usuario_id) baseDeDatos.actualizaPorId("usuarios", usuario_id, {fechaUltimoLogin});

		// Valida que no exista ya un registro de la 'visita_id' en esta fecha
		const condicion = {fecha: hoy, visita_id};
		const existe = await baseDeDatos.obtienePorCondicion("visitasDelDia", condicion);
		if (usuario_id) condicion.usuario_id = usuario_id;

		// Si no existe, lo agrega
		if (!existe) baseDeDatos.agregaRegistro("visitasDelDia", condicion);

		// Si es 'usuario_id' y existe sin ese campo, lo actualiza
		if (existe && usuario_id && !existe.usuario_id) baseDeDatos.actualizaPorId("visitasDelDia", existe.id, {usuario_id});

		// Si no existe o existe sin 'usuario_id', aumenta el valor del campo 'diasLogin' en el usuario
		if (!existe || (usuario_id && !existe.usuario_id))
			baseDeDatos.aumentaElValorDeUnCampo("usuarios", usuario_id, "diasLogin");

		// Fin
		return;
	},
	// ControlVista: altaMail y olvidoContr
	envioDeMailConContrasena: async ({email, altaMail}) => {
		// Variables
		const asunto = "Contraseña para ELC";

		// Contraseña
		let contrasena = Math.round(Math.random() * Math.pow(10, 6))
			.toString()
			.padStart(6, "0"); // más adelante cambia por la codificada

		// Comentario
		let comentario = "";
		comentario += "¡Hola!";
		if (altaMail) {
			comentario += "<br>" + "Ya tenés tu usuario para usar en nuestro sitio.";
			comentario += "<br>" + "Necesitamos que completes el alta antes de que transcurran 24hs.";
			comentario += "<br>" + "Si no se completa en ese plazo, se dará de baja.";
		}
		comentario += "<br>" + "La contraseña de tu usuario es: <bold><u>" + contrasena + "</u></bold>";

		// Envía el mail al usuario y actualiza la contraseña
		const mailEnviado = await comp.enviaMail({email, asunto, comentario});

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
				: req.session.urlSinLogin;

		// Fin
		return {
			mensajes: [
				"El ingreso de información a compartir con nuestros usuarios, requiere responsabilidad y será revisada por nuestro equipo de revisores.",
				"Te pedimos que cuides nuestra reputación.",
				"Podés gestionar el permiso con la flecha hacia la derecha.",
			],
			iconos: [
				variables.vistaAnterior(linkVolver),
				{
					clase: "fa-circle-right",
					link: "/usuarios/perennes",
					titulo: "Ir a 'Solicitud de Autorización de Inputs'",
					autofocus: true,
				},
			],
			titulo: "Aviso",
			trabajando: true,
		};
	},
	logout: (req, res) => {
		// Borra los datos de session y cookie
		for (let prop in req.session) if (prop != "cookie") delete req.session[prop];
		res.clearCookie("email");
		//res.clearCookie("visita");

		// Fin
		return;
	},
	comentarios: {
		credsInvalidas: {
			altaMail: "Esa dirección de email ya existe en nuestra base de datos.",
			login: "Credenciales inválidas.",
			olvidoContr: "Algún dato no coincide con el de nuestra base de datos.",
			datosPer: "Ya existe un usuario con esas credenciales. De ser necesario, comunicate con nosotros.",
		},
		accesoSuspendido: (tema) =>
			"Por motivos de seguridad debido a los intentos fallidos " +
			tema +
			", te pedimos que esperes para volver a intentarlo.",
	},
};
