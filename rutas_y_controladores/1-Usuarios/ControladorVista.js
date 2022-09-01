"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

module.exports = {
	redireccionar: async (req, res) => {
		let status_registro_usuario = req.session.usuario.status_registro;
		//return res.send(status_registro_usuario);
		// Redireccionar
		!status_registro_usuario.mail_validado
			? res.redirect("/usuarios/login")
			: !status_registro_usuario.datos_perennes
			? res.redirect("/usuarios/datos-perennes")
			: !status_registro_usuario.datos_editables
			? res.redirect("/usuarios/datos-editables")
			: req.session.urlSinUsuario
			? res.redirect(req.session.urlSinUsuario)
			: res.redirect("/");
	},

	// Login
	loginForm: async (req, res) => {
		// 1. Tema y Código
		let tema = "usuario";
		let codigo = "login";
		// 2. Data Entry propio y errores
		let dataEntry =
			req.session.email !== undefined || req.session.contrasena !== undefined
				? {email: req.session.email, contrasena: req.session.contrasena}
				: "";
		let {errores} = dataEntry ? await validar.validadMailContrasena_y_ObtieneUsuario(dataEntry) : "";
		// 3. Variables para la vista
		let variables = [
			{titulo: "E-Mail", type: "text", name: "email", placeholder: "Correo Electrónico"},
			{titulo: "Contraseña", type: "password", name: "contrasena", placeholder: "Contraseña"},
		];
		// 4. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Login",
			link: req.originalUrl,
			dataEntry,
			errores,
			urlSalir: req.session.urlSinLogin,
			variables,
		});
	},
	loginGuardar: async (req, res) => {
		// 1. Averiguar si hay errores de data-entry
		let {errores, usuario} = await validar.validadMailContrasena_y_ObtieneUsuario(req.body);
		// 4. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.email = req.body.email;
			req.session.contrasena = req.body.contrasena;
			return res.redirect("/usuarios/login");
		}
		// 5. Si corresponde, le cambia el status a 'mail_validado'
		if (!usuario.status_registro.mail_validado)
			usuario = await procesos.actualizaElUsuario("mail_validado", "datos_perennes", usuario);
		// 6. Inicia la sesión del usuario
		req.session.usuario = usuario;
		// 7. Guarda el mail en cookie
		res.cookie("email", req.body.email, {maxAge: unDia});
		delete req.session.email;
		// 8. Notificar al contador de logins
		let hoyAhora = compartidas.ahora();
		procesos.actualizarElContadorDeLogins(req.session.usuario, hoyAhora);
		// 9. Redireccionar
		return res.redirect("/usuarios/redireccionar");
	},
	preLogout: (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		let informacion = {
			mensajes: [
				"¿Estás segur" + (usuario.sexo_id == "M" ? "a" : "o") + " de que te querés desloguear?",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Cancelar"},
				{nombre: "fa-circle-right", link: "/usuarios/logout", titulo: "Logout"},
			],
			titulo: "Logout",
			colorFondo: "gris",
		};
		// Fin
		return res.render("MI9-Cartel", {informacion});
	},
	logout: (req, res) => {
		let url = req.session.urlSinLogin;
		req.session.destroy();
		res.clearCookie("email");
		return res.redirect(url);
	},
	olvidoContr: (req, res) => {
		return res.send("olvidó contraseña");
	},

	// Circuito de alta de usuario
	altaMailForm: (req, res) => {
		let tema = "usuario";
		let codigo = "mail";
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Registro de Mail",
			link: req.originalUrl,
			dataEntry,
			errores,
			urlSalir: req.session.urlSinLogin,
		});
	},
	altaMailGuardar: async (req, res) => {
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validar.registroMail(datos.email);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect(req.originalUrl);
		}
		// Si no hubieron errores de validación...
		// Enviar la contraseña por mail
		let asunto = "Contraseña para ELC";
		let email = req.body.email;
		//let contrasena = "123456789";
		let contrasena = Math.round(Math.random() * Math.pow(10, 10)).toString();
		let comentario = "La contraseña del mail " + email + " es: " + contrasena;
		compartidas.enviarMail(asunto, email, comentario).catch(console.error);
		// Guardar el registro
		contrasena = bcryptjs.hashSync(contrasena, 10);
		let status_registro_id = status_registro_us.find((n) => !n.mail_validado).id;
		await BD_genericas.agregarRegistro("usuarios", {email, contrasena, status_registro_id});
		// Obtener los datos del usuario
		req.session.email = email;
		//req.session.contrasena = "";
		res.cookie("email", email, {maxAge: unDia});
		// Datos para la vista
		let informacion = {
			mensajes: [
				"Te hemos enviado una contraseña por mail.",
				"Usala para ingresar al login.",
				"Luego de terminar el alta de usuario, podrás cambiarla.",
			],
			iconos: [variables.vistaEntendido("/usuarios/login")],
			titulo: "Alta de mail exitosa",
			colorFondo: "verde",
		};
		// Redireccionar
		return res.render("MI9-Cartel", {informacion});
	},
	altaPerennesForm: async (req, res) => {
		let tema = "usuario";
		let codigo = "perennes";
		// Preparar datos para la vista
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : "";
		let errores = req.session.errores ? req.session.errores : "";
		let sexos = await BD_genericas.obtenerTodos("sexos", "orden");
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Registro de Datos Perennes",
			link: req.originalUrl,
			dataEntry,
			errores,
			sexos,
			urlSalir: req.session.urlSinLogin,
		});
	},
	altaPerennesGuardar: async (req, res) => {
		!req.session.usuario ? res.redirect("/usuarios/login") : "";
		let usuario = req.session.usuario;
		// Averigua si hay errores de validación
		let datos = req.body;
		let errores = await validar.perennes(datos);
		// Redirecciona si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/redireccionar");
		}
		// Actualiza el usuario
		req.session.usuario = await procesos.actualizaElUsuario(
			"datos_perennes",
			"datos_editables",
			usuario,
			req.body
		);
		// Redirecciona
		return res.redirect("/usuarios/redireccionar");
	},
	altaEditablesForm: async (req, res) => {
		let tema = "usuario";
		let codigo = "editables";
		// Variables
		let paises = await BD_genericas.obtenerTodos("paises", "nombre");
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let errores = req.session.errores ? req.session.errores : false;
		// Roles de Iglesia
		let condicionesRolIglesia = {sexo_id: req.session.usuario.sexo_id, usuario: true};
		let roles_iglesia = await BD_genericas.obtenerTodosPorCampos("roles_iglesia", condicionesRolIglesia);
		roles_iglesia.sort((a, b) => (a.orden < b.orden ? -1 : a.orden > b.orden ? 1 : 0));
		// Generar la info para la vista
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let avatar = dataEntry.avatar
			? "/imagenes/9-Provisorio/" + dataEntry.avatar
			: "/imagenes/0-Base/AvatarGenericoUsuario.png";
		// Ir a la vista
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Registro de Datos Editables",
			link: req.originalUrl,
			dataEntry,
			errores,
			hablaHispana,
			hablaNoHispana,
			roles_iglesia,
			avatar,
			urlSalir: req.session.urlSinLogin,
		});
	},
	altaEditablesGuardar: async (req, res) => {
		let usuario = req.session.usuario;
		if (req.file) req.body.avatar = req.file.filename;
		// Averiguar si hay errores de validación
		let errores = await validar.editables(req.body);
		if (errores.hay) {
			if (req.file) delete req.body.avatar;
			if (req.file) compartidas.borrarArchivo(req.file.path, req.file.filename);
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/redireccionar");
		}
		// Actualiza el usuario
		req.body.avatar = req.file ? req.file.filename : "-";
		req.session.usuario = await procesos.actualizaElUsuario(
			"datos_editables",
			"documento",
			usuario,
			req.body
		);
		// Mueve el archivo a la carpeta definitiva
		if (req.file) compartidas.moverImagen(req.body.avatar, "9-Provisorio", "1-Usuarios");
		// Redirecciona
		return res.redirect("/usuarios/redireccionar");
	},
	bienvenido: (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		let informacion = {
			mensajes: [
				"Estimad" +
					(usuario.sexo_id == "M" ? "a " : "o ") +
					usuario.apodo +
					", completaste el alta satisfactoriamente.",
				"Ya podés personalizar tu perfil.",
			],
			iconos: [variables.vistaEntendido(req.session.urlSinUsuario)],
			titulo: "Bienvenida al usuario",
			colorFondo: "verde",
		};
		// Fin
		return res.render("MI9-Cartel", {informacion});
	},

	// Edición
	edicionForm: async (req, res) => {
		let tema = "usuario";
		let codigo = "edicion";
		res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Edición de Usuario",
			usuario: req.session.usuario,
		});
	},
	edicionGuardar: (req, res) => {
		res.send("/edicion/guardar");
	},

	// Baja
	baja: (req, res) => {
		req.session.destroy();
		guardar(ruta_nombre, nuevaBD);
		res.redirect("/");
	},

	// Actualización de roles
	autInputForm: (req, res) => {
		let informacion = {
			mensajes: ["Vista pendiente de contrucción, prevista para más adelante"],
			iconos: [variables.vistaAnterior(req.session.urlAnterior)],
		};
		// Fin
		return res.render("MI9-Cartel", {informacion});
	},
	autRevisionForm: (req, res) => {
		let informacion = {
			mensajes: ["Vista pendiente de contrucción, prevista para más adelante"],
			iconos: [variables.vistaAnterior(req.session.urlAnterior)],
			colorFondo: "gris",
		};
		// Fin
		return res.render("MI9-Cartel", {informacion});
	},
};
