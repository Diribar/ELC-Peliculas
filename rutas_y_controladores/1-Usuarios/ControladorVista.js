// ************ Requires ************
let fs = require("fs");
let path = require("path");
let BD_especificas = require("../../funciones/BD/especificas");
let BD_varias = require("../../funciones/BD/varias");
let rutaImagenes = "../public/imagenes/1-Usuarios/";
let funciones = require("../../funciones/Varias/varias");
let validarUsuarios = require("../../funciones/Varias/usuarios-Errores");
let bcryptjs = require("bcryptjs");

// *********** Controlador ***********
module.exports = {
	altaMailForm: (req, res) => {
		tema = "usuario";
		codigo = "mail";
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
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
		asunto = "Contraseña para ELC";
		email = req.body.email;
		contrasena = Math.round(Math.random() * Math.pow(10, 10)) + "";
		//console.log(contrasena);
		comentario = "La contraseña del mail " + email + " es: " + contrasena;
		funciones.enviarMail(asunto, email, comentario).catch(console.error);
		// Guardar el registro
		contrasena = bcryptjs.hashSync(contrasena, 10);
		await BD_varias.agregarRegistro({entidad: "usuarios", email, contrasena});
		// Obtener los datos del usuario
		req.session.email = email;
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaRedireccionar: async (req, res) => {
		!req.session.usuario ? res.redirect("/usuarios/login") : "";
		let status_registro = req.session.usuario.status_registro_id + "";
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

	loginForm: (req, res) => {
		// 1. Tema y Código
		tema = "usuario";
		codigo = "login";
		// 2. Data Entry propio y errores
		dataEntry = req.session.email
			? {email: req.session.email, contrasena: req.session.contrasena}
			: null;
		errores = req.session.errores ? req.session.errores : false;
		// 3. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
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
		contrasena = usuario ? usuario.contrasena : "";
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
			await BD_varias.actualizarRegistro("usuario", {status_registro_id: 2}, usuario.id);
		}
		// 5. Iniciar la sesión
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		res.cookie("email", req.body.email, {maxAge: 1000 * 60 * 60 * 24});
		delete req.session["email"];
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	logout: (req, res) => {
		url = req.session.urlReferencia ? req.session.urlReferencia : "/";
		res.clearCookie("email");
		req.session.destroy();
		return res.redirect(url);
	},

	altaPerennesForm: async (req, res) => {
		!req.session.usuario ? res.redirect("/usuarios/login") : "";
		tema = "usuario";
		codigo = "perennes";
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry,
			errores,
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
		await BD_varias.actualizarRegistro("usuarios", req.body, usuario.id);
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaEditablesForm: async (req, res) => {
		!req.session.usuario ? res.redirect("/usuarios/login") : "";
		tema = "usuario";
		codigo = "editables";
		let paises = await BD_varias.obtenerTodos("paises", "nombre");
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let roles_iglesia = await BD_varias.obtenerTodos("roles_iglesia", "orden");
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let errores = req.session.errores ? req.session.errores : false;
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry,
			errores,
			hablaHispana,
			hablaNoHispana,
			roles_iglesia,
		});
	},

	altaEditablesGuardar: async (req, res) => {
		!req.session.usuario ? res.redirect("/usuarios/login") : "";
		let usuario = req.session.usuario;
		// Averiguar si hay errores de validación
		let datos = req.body;
		let errores = await validarUsuarios.editables(datos);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.file ? borrarArchivoDeImagen(req.file.filename, req.file.path) : null;
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/altaredireccionar");
		}
		// Si no hubieron errores de validación...
		// Grabar novedades en el usuario
		req.body.status_registro_id = 4;
		req.body.avatar = req.file ? req.file.filename : "-";
		await BD_varias.actualizarRegistro("usuarios", req.body, usuario.id);
		req.session.usuario = await BD_especificas.obtenerUsuarioPorID(usuario.id);
		// Pendiente mover el archivo a la carpeta definitiva
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	detalle: async (req, res) => {
		tema = "usuario";
		codigo = "detalle";
		if (!req.session.usuario) {
			req.session.usuario = await BD_especificas.obtenerUsuarioPorMail(req.cookies.email);
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
			req.session.usuario = await BD_especificas.obtenerUsuarioPorMail(req.cookies.email);
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
let borrarArchivoDeImagen = (archivo, ruta) => {
	let archivoImagen = path.join(ruta, archivo);
	console.log("Archivo " + archivoImagen + " borrado");
	archivo && fs.existsSync(archivoImagen) ? fs.unlinkSync(archivoImagen) : "";
};
