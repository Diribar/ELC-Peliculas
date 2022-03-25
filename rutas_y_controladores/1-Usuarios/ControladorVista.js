"use strict";
// Definir variables
const BD_especificas = require("../../funciones/BD/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");
const especificas = require("../../funciones/Varias/Especificas");
const validarUsuarios = require("../../funciones/Varias/ValidarUsuarios");
const bcryptjs = require("bcryptjs");

module.exports = {
	altaMailForm: (req, res) => {
		let tema = "usuario";
		let codigo = "mail";
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Registro de Mail",
			link: req.originalUrl,
			dataEntry,
			errores,
		});
	},

	altaMailGuardar: async (req, res) => {
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validarUsuarios.registroMail(datos.email);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		// Enviar la contraseña por mail
		let asunto = "Contraseña para ELC";
		let email = req.body.email;
		let contrasena = "123456789";
		//let contrasena = Math.round(Math.random() * Math.pow(10, 10)).toString();
		//console.log(contrasena);
		comentario = "La contraseña del mail " + email + " es: " + contrasena;
		especificas.enviarMail(asunto, email, comentario).catch(console.error);
		// Guardar el registro
		contrasena = bcryptjs.hashSync(contrasena, 10);
		await BD_genericas.agregarRegistro({entidad: "usuarios", email, contrasena});
		// Obtener los datos del usuario
		req.session.email = email;
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaRedireccionar: async (req, res) => {
		let status_registro = req.session.usuario.status_registro_id;
		// Redireccionar
		status_registro.datos_editables
			? req.session.urlReferencia
				? res.redirect(req.session.urlReferencia)
				: res.redirect("/")
			: status_registro.datos_perennes
			? res.redirect("/usuarios/datos-editables")
			: status_registro.mail_validado
			? res.redirect("/usuarios/datos-perennes")
			: res.redirect("/usuarios/login")

		// status_registro == 1
		// 	? res.redirect("/usuarios/login")
		// 	: status_registro == 2
		// 	? res.redirect("/usuarios/datos-perennes")
		// 	: status_registro == 3
		// 	? res.redirect("/usuarios/datos-editables")
		// 	: status_registro == 4
		// 	? req.session.urlReferencia
		// 		? res.redirect(req.session.urlReferencia)
		// 		: res.redirect("/")
		// 	: null
	},

	loginForm: (req, res) => {
		// 1. Tema y Código
		let tema = "usuario";
		let codigo = "login";
		// 2. Data Entry propio y errores
		let dataEntry = req.session.email
			? {email: req.session.email, contrasena: req.session.contrasena}
			: null;
		let errores = req.session.errores ? req.session.errores : false;
		// 3. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Login",
			link: req.originalUrl,
			dataEntry,
			errores,
		});
	},

	loginGuardar: async (req, res) => {
		// 1. Obtener los datos del usuario
		let usuario = await BD_especificas.obtenerUsuarioPorMail(req.body.email);
		// 2. Averiguar si hay errores de validación
		let errores = await validarUsuarios.login(req.body);
		let contrasena = usuario ? usuario.contrasena : "";
		errores.credencialesInvalidas =
			!errores.email && !errores.contrasena
				? !contrasena || !bcryptjs.compareSync(req.body.contrasena, contrasena)
				: false;
		errores.credencialesInvalidas ? (errores.hay = true) : "";
		// 3. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			req.session.email = req.body.email;
			req.session.contrasena = req.body.contrasena;
			return res.redirect("/usuarios/login");
		}
		// 4. Si corresponde, actualizar el Status del Usuario
		if (usuario.status_registro_id == 1) {
			await BD_genericas.actualizarPorId("usuarios", usuario.id, {status_registro_id: 2});
		}
		// 5. Iniciar la sesión
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		res.cookie("email", req.body.email, {maxAge: unDia});
		delete req.session["email"];
		// 6. Notificar al contador de logins
		BD_especificas.actualizarElContadorDeLogins(req.session.usuario)
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	logout: (req, res) => {
		let url = req.session.urlReferencia ? req.session.urlReferencia : "/";
		res.clearCookie("email");
		req.session.destroy();
		return res.redirect(url);
	},

	altaPerennesForm: async (req, res) => {
		let tema = "usuario";
		let codigo = "perennes";
		// Preparar datos para la vista
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : "";
		let errores = req.session.errores ? req.session.errores : "";
		let sexos = await BD_genericas.obtenerTodos("sexos", "orden");
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Registro de Datos Perennes",
			link: req.originalUrl,
			dataEntry,
			errores,
			sexos,
		});
	},

	altaPerennesGuardar: async (req, res) => {
		!req.session.usuario ? res.redirect("/usuarios/login") : "";
		let usuario = req.session.usuario;
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validarUsuarios.perennes(datos);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		// Actualizar el registro
		req.body.status_registro_id = 3;
		await BD_genericas.actualizarPorId("usuarios", usuario.id, req.body);
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
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
		//return res.send(dataEntry)
		return res.render("Home", {
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
		});
	},

	altaEG: async (req, res) => {
		let usuario = req.session.usuario;
		if (req.file) req.body.avatar = req.file.filename;
		// Averiguar si hay errores de validación
		let errores = await validarUsuarios.editables(req.body);
		if (errores.hay) {
			if (req.file) delete req.body.avatar;
			if (req.file) especificas.borrarArchivo(req.file.filename, req.file.path);
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		// Grabar novedades en el usuario
		req.body.status_registro_id = 4;
		req.body.avatar = req.file ? req.file.filename : "-";
		await BD_genericas.actualizarPorId("usuarios", usuario.id, req.body);
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		// Mover el archivo a la carpeta definitiva
		if (req.file) especificas.moverImagenCarpetaDefinitiva(req.body.avatar, "1-Usuarios");
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	detalle: async (req, res) => {
		let tema = "usuario";
		let codigo = "detalle";
		res.render("Home", {
			tema,
			codigo,
			titulo: "Detalle de Usuario",
			usuario: req.session.usuario,
		});
	},

	editarForm: async (req, res) => {
		let tema = "usuario";
		let codigo = "edicion";
		res.render("Home", {
			tema,
			codigo,
			usuario: req.session.usuario,
		});
	},

	editarGuardar: (req, res) => {
		res.send("/edicion/guardar");
	},

	baja: (req, res) => {
		req.session.destroy();
		guardar(ruta_nombre, nuevaBD);
		res.redirect("/");
	},
};
