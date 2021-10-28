// ************ Requires ************
let fs = require("fs");
let path = require("path");
let BD_usuarios = require(path.join(__dirname, "../../funciones/BD/usuarios"));
let BD_varios = require(path.join(__dirname, "../../funciones/BD/varios"));
let rutaImagenes = path.join(__dirname, "../public/imagenes/2-Usuarios/");
let funciones = require("../../funciones/varias/funcionesVarias");
let validarUsuarios = require("../../funciones/varias/Usuarios-errores");

// *********** Controlador ***********
module.exports = {
	loginForm: (req, res) => {
		// 1. Tema y Código
		tema = "usuario";
		codigo = "login";
		// 2. Data Entry propio y errores
		data_entry = req.session.email
			? { email: req.session.email, contrasena: req.session.contrasena }
			: null;
		errores = req.session.errores ? req.session.errores : false;
		// 3. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
		});
	},

	loginGuardar: async (req, res) => {
		// 1. Obtener los datos del usuario
		let usuario = await BD_usuarios.obtenerPorMail(req.body.email);
		//return res.send(usuario)
		// 2. Si hay errores de validación, redireccionar
		let errores = await validarUsuarios.login(req.body, usuario);
		if (errores.hay) {
			req.session.errores = errores;
			req.session.email = req.body.email;
			req.session.contrasena = req.body.contrasena;
			return res.redirect("/usuarios/login");
		}
		// Si corresponde, actualizar el Status del Usuario
		if (usuario.status_registro_id == 1) {
			await BD_usuarios.actualizarStatusUsuario(usuario.id, 2);
			usuario.status_registro_id =2;
		}
		// Iniciar la sesión
		req.session.usuario = usuario;
		res.cookie("email", req.body.email, { maxAge: 1000 * 60 * 60 * 24 });
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	logout: (req, res) => {
		url = req.session.urlReferencia ? req.session.urlReferencia : "/";
		res.clearCookie("email");
		req.session.destroy();
		return res.redirect(url);
	},

	altaRedireccionar: async (req, res) => {
		let usuario = req.session.usuario
			? req.session.usuario
			: req.session.email
			? await BD_usuarios.obtenerPorMail(req.session.email)
			: req.cookies.email
			? await BD_usuarios.obtenerPorMail(req.cookies.email)
			: null;
		!usuario ? res.redirect("/") : "";
		//return res.send(usuario)
		let status_registro = usuario.status_registro_id + "";
		// Redireccionar
		//console.log("status_registro: " + status_registro);
		status_registro == 1
			? res.redirect("/usuarios/login")
			: status_registro == 2
			? res.redirect("/usuarios/datos-perennes")
			: status_registro == 3
			? res.redirect("/usuarios/datos-editables")
			: req.session.urlReferencia
			? res.redirect(req.session.urlReferencia)
			: res.redirect("/");
	},

	altaMailForm: (req, res) => {
		tema = "usuario";
		codigo = "mail";
		let data_entry = req.session.data_entry
			? req.session.data_entry
			: false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
		});
	},

	altaMailGuardar: async (req, res) => {
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validarUsuarios.mail(datos.email);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.data_entry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		// Enviar la contraseña por mail
		asunto = "Contraseña para ELC";
		email = req.body.email;
		codigo = Math.round(Math.random() * Math.pow(10, 10)) + "";
		comentario = "La contraseña del mail " + email + " es: " + codigo;
		funciones.enviarMail(asunto, email, comentario).catch(console.error);
		// Guardar el registro
		await BD_usuarios.altaMail(email, codigo);
		// Obtener los datos del usuario
		req.session.email = email;
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaPerennesForm: async (req, res) => {
		!req.session.usuario
			? (req.session.usuario = await BD_usuarios.obtenerPorMail(
					req.cookies.email
			  ))
			: "";
		delete req.session["email"];
		tema = "usuario";
		codigo = "perennes";
		let data_entry = req.session.data_entry
			? req.session.data_entry
			: false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
		});
	},

	altaPerennesGuardar: async (req, res) => {
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validarUsuarios.perennes(datos);
		//return res.send(errores)
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.data_entry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		// Actualizar el registro
		await BD_usuarios.datosPerennes(req.session.usuario.id, req.body);
		// Actualizar el status de usuario
		await BD_usuarios.actualizarStatusUsuario(req.session.usuario.id, 3);
		// Actualizar los datos del usuario en la sesión
		req.session.usuario = await BD_usuarios.obtenerPorId(
			req.session.usuario.id
		);
		//return res.send(req.session.usuario)
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaEditablesForm: async (req, res) => {
		tema = "usuario";
		codigo = "editables";
		!req.session.usuario
			? (req.session.usuario = await BD_usuarios.obtenerPorMail(
					req.cookies.email
			  ))
			: "";
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let estados_eclesiales = await BD_varios.ObtenerTodos(
			"estados_eclesiales",
			"orden"
		);
		let data_entry = req.session.data_entry
			? req.session.data_entry
			: false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry,
			errores,
			hablaHispana,
			hablaNoHispana,
			estados_eclesiales,
		});
	},

	altaEditablesGuardar: async (req, res) => {
		let usuario = req.session.usuario;
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validarUsuarios.editables(datos);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.file ? borrarArchivoDeImagen(req.file.filename) : null;
			req.body.avatar = req.file
				? req.file.filename
				: "/imagenes/0-Base/Avatar genérico.png";
			req.session.data_entry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		req.body.avatar = req.file ? req.file.filename : "-";
		await BD_usuarios.datosEditables(usuario.id, req.body);
		await BD_usuarios.actualizarStatusUsuario(usuario.id, 4);
		req.session.usuario = await BD_usuarios.obtenerPorId(usuario.id);
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	detalle: async (req, res) => {
		tema = "usuario";
		codigo = "detalle";
		if (!req.session.usuario) {
			req.session.usuario = await BD_usuarios.obtenerPorMail(
				req.cookies.email
			);
		}
		res.render("Home", {
			tema,
			codigo,
			usuario: req.session.usuario,
		});
	},

	editarForm: async (req, res) => {
		tema = "usuario";
		codigo = "editar";
		if (!req.session.usuario) {
			req.session.usuario = await BD_usuarios.obtenerPorMail(
				req.cookies.email
			);
		}
		res.render("Home", {
			tema,
			codigo,
			usuario: req.session.usuario,
		});
	},

	editarGuardar: (req, res) => {
		res.send("/editar/guardar");
	},

	baja: (req, res) => {
		req.session.destroy();
		guardar(ruta_nombre, nuevaBD);
		res.redirect("/");
	},
};

// ************ Funciones ************
let borrarArchivoDeImagen = (n) => {
	let archivoImagen = path.join(rutaImagenes, n);
	n && fs.existsSync(archivoImagen) ? fs.unlinkSync(archivoImagen) : "";
};
