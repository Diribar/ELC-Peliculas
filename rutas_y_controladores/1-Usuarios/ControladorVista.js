"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

module.exports = {
	// Login
	loginForm: (req, res) => {
		// 1. Tema y Código
		let tema = "usuario";
		let codigo = "login";
		// 2. Data Entry propio y errores
		let dataEntry =
			req.session.email !== undefined || req.session.contrasena !== undefined
				? {email: req.session.email, contrasena: req.session.contrasena}
				: "";
		let errores = req.session.errores ? req.session.errores : false;
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
		let errores = await validar.login(req.body);
		if (!errores.hay) {
			// 2. Si no hay error => averigua el usuario
			var usuario = await BD_especificas.obtenerUsuarioPorMail(req.body.email);
			// 3. Si existe el usuario => averigua si la contraseña es válida
			if (usuario) {
				errores.credenciales = !bcryptjs.compareSync(req.body.contrasena, usuario.contrasena);
				if (errores.credenciales) errores.hay = true;
			}
			// Si el usuario no existe => Credenciales Inválidas
			else errores = {credenciales: true, hay: true};
		}
		// 4. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			req.session.email = req.body.email;
			req.session.contrasena = req.body.contrasena;
			return res.redirect("/usuarios/login");
		}
		// 5. Si corresponde, actualizar el Status del Usuario
		if (!usuario.status_registro.mail_validado) {
			let mail_validado_id = await BD_genericas.obtenerPorCampos("status_registro_us", {
				mail_validado: true,
				datos_perennes: false,
			}).then((n) => n.id);
			BD_genericas.actualizarPorId("usuarios", usuario.id, {status_registro_id: mail_validado_id});
			usuario.status_registro_id = mail_validado_id;
		}
		// 6. Iniciar la sesión
		req.session.usuario = usuario;
		res.cookie("email", req.body.email, {maxAge: unDia});
		delete req.session.email;
		// 7. Notificar al contador de logins
		let hoyAhora = compartidas.ahora();
		procesos.actualizarElContadorDeLogins(req.session.usuario, hoyAhora);
		// 8. Redireccionar
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
				{nombre: "fa-circle-left", link: req.session.urlActual, titulo: "Cancelar"},
				{nombre: "fa-circle-right", link: "/usuarios/logout", titulo: "Logout"},
			],
			titulo: "Logout",
			colorFondo: "gris",
		};
		// Fin
		return res.render("MI9-Cartel", {informacion});
	},
	logout: (req, res) => {
		let url = req.session.urlActual
			? req.session.urlActual
			: req.session.urlAnterior
			? req.session.urlAnterior
			: "/";
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
		await BD_genericas.agregarRegistro("usuarios", {email, contrasena});
		// Obtener los datos del usuario
		req.session.email = email;
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
	redireccionar: async (req, res) => {
		let status_registro_usuario = req.session.usuario.status_registro;
		// Redireccionar
		console.log(167, status_registro_usuario);
		status_registro_usuario.datos_editables
			? req.session.urlActual
				? res.redirect(req.session.urlActual)
				: req.session.urlAnterior
				? res.redirect(req.session.urlAnterior)
				: res.redirect("/")
			: status_registro_usuario.datos_perennes
			? res.redirect("/usuarios/datos-editables")
			: status_registro_usuario.mail_validado
			? res.redirect("/usuarios/datos-perennes")
			: res.redirect("/usuarios/login");
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
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validar.perennes(datos);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/redireccionar");
		}
		// Si no hubieron errores de validación...
		// Actualizar el registro
		req.body.status_registro_id = 3;
		await BD_genericas.actualizarPorId("usuarios", usuario.id, req.body);
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		// Redireccionar
		return res.redirect("/usuarios/redireccionar");
	},
	altaEditablesForm: async (req, res) => {
		let tema = "usuario";
		let codigo = "editables";
		let paises = await BD_genericas.obtenerTodos("paises", "nombre");
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden").then((n) =>
			n.filter((m) => m.sexo_id == req.session.usuario.sexo_id && m.usuario)
		);
		let errores = req.session.errores ? req.session.errores : false;
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
		// Si no hubieron errores de validación...
		// Grabar novedades en el usuario
		req.body.status_registro_id = 4;
		req.body.avatar = req.file ? req.file.filename : "-";
		await BD_genericas.actualizarPorId("usuarios", usuario.id, req.body);
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		// Mover el archivo a la carpeta definitiva
		if (req.file) compartidas.moverImagen(req.body.avatar, "9-Provisorio", "1-Usuarios");
		// Redireccionar
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
