"use strict";
// Variables
const procesos = require("./US-FN-Procesos");
const valida = require("./US-FN-Validar");

module.exports = {
	login_y_completo: async (req, res) => {
		// Enviar a Login si no está logueado
		if (!req.session.usuario) return res.redirect("/usuarios/login");
		// Redireccionar
		const statusUsuario_id = req.session.usuario.statusRegistro_id;
		statusUsuario_id == mailPendValidar_id
			? res.redirect("/usuarios/login")
			: statusUsuario_id == mailValidado_id
			? res.redirect("/usuarios/editables")
			: req.session.urlFueraDeUsuarios
			? res.redirect(req.session.urlFueraDeUsuarios)
			: res.redirect("/");
	},
	// Circuito de alta de usuario
	altaMail: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const {ruta} = comp.reqBasePathUrl(req);
			const codigo = ruta.slice(1);
			const titulo = codigo == "alta-mail" ? "Alta de Mail" : codigo == "olvido-contrasena" ? "Olvido de Contraseña" : "";
			const dataEntry = req.session["olvido-contrasena"] ? req.session["olvido-contrasena"] : {};
			const errores = dataEntry.errores ? dataEntry.errores : false;

			// Vista
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo,
				dataEntry, // debe ser un objeto para ocultar los íconos de OK/Error en el start-up de la vista
				errores,
				hablaHispana,
				hablaNoHispana,
				urlSalir: "/usuarios/login",
			});
		},
		envioExitoso: (req, res) => {
			// Vista
			return res.render("CMP-0Estructura", {informacion: procesos.envioExitoso});
		},
		envioFallido: (req, res) => {
			// Vista
			return res.render("CMP-0Estructura", {informacion: procesos.envioFallido});
		},
	},
	editables: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const codigo = "editables";
			let usuario = req.session.usuario;
			let errores = req.session.errores ? req.session.errores : false;

			// Generar la info para la vista
			let dataEntry = req.session.dataEntry ? req.session.dataEntry : usuario;
			let avatar = usuario.avatar
				? "/externa/1-Usuarios/" + usuario.avatar
				: "/publico/imagenes/Avatar/Usuario-Generico.jpg";

			// Va a la vista
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Datos Editables",
				dataEntry,
				errores,
				sexos: sexos.filter((m) => m.letra_final),
				hablaHispana,
				hablaNoHispana,
				avatar,
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Variables
			let usuario = req.session.usuario;

			// Acciones si hay errores de validación
			let datos = {...req.body};
			if (req.file) {
				datos.tamano = req.file.size;
				datos.avatar = req.file.filename;
			}
			let errores = await valida.editables(datos);
			if (errores.hay) {
				if (req.file) comp.gestionArchivos.elimina(req.file.destination, req.file.filename);
				req.session.dataEntry = req.body; // No guarda el avatar
				req.session.errores = errores;
				return res.redirect("/usuarios/garantiza-login-y-completo");
			}

			// Acciones con el archivo avatar
			if (req.file) {
				// Elimina el archivo 'avatar' anterior, si lo hubiera
				if (usuario.avatar) comp.gestionArchivos.elimina(req.file.destination, usuario.avatar);

				// Agrega el campo 'avatar' a los datos
				req.body.avatar = req.file.filename;

				// Mueve el archivo a la carpeta definitiva
				comp.gestionArchivos.mueveImagen(req.file.filename, "9-Provisorio", "1-Usuarios");
			}

			// Actualiza el usuario
			req.body.completadoEn = comp.fechaHora.ahora();
			await procesos.actualizaElStatusDelUsuario(usuario, "editables", req.body);
			req.session.usuario = await BD_especificas.obtieneUsuarioPorMail(usuario.email);

			// Redirecciona
			return res.redirect("/usuarios/editables-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let informacion = {
				mensajes: [
					"Estimad" + usuario.sexo.letra_final + " " + usuario.apodo + ", completaste el alta satisfactoriamente.",
					"Bienvenid" + usuario.sexo.letra_final + " a nuestro sitio como usuario.",
					"Con tu alta de usuario, ya podés guardar tus consultas personalizadas.",
				],
				iconos: [variables.vistaEntendido(req.session.urlFueraDeUsuarios)],
				titulo: "Bienvenido/a a la familia ELC",
				check: true,
			};

			// Fin
			return res.render("CMP-0Estructura", {informacion});
		},
	},
	perennes: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const codigo = "perennes";
			const usuario = req.session.usuario;
			const rolesIgl = rolesIglesia.filter((n) => n.usuario && n.id.slice(-1) == usuario.sexo_id);

			// Genera la info para la vista
			const errores = req.session.errores ? req.session.errores : false;
			const dataEntry = req.session.dataEntry ? req.session.dataEntry : usuario;

			// Va a la vista
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Solicitud de Autorización de Inputs",
				dataEntry,
				errores,
				hablaHispana,
				hablaNoHispana,
				rolesIgl,
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const usuario = req.session.usuario;
			let datos = {...req.body, id: usuario.id};

			// Averigua si hay errores de validación
			let errores = await valida.perenneBE(datos);

			// Redirecciona si hubo algún error de validación
			if (errores.hay) {
				req.session.dataEntry = req.body; // No guarda el documAvatar
				req.session.errores = errores;
				return res.redirect("/usuarios/perennes");
			}

			// Actualiza el usuario
			datos.rolUsuario_id = rolPermInputs_id; // Le sube el rol a permInputs
			req.session.usuario = await procesos.actualizaElStatusDelUsuario(usuario, "perennes", datos);

			// Redirecciona
			return res.redirect("/usuarios/perennes-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let letra = usuario.sexo_id == "M" ? "a " : "o ";
			let informacion = {
				mensajes: [
					"Estimad" + letra + usuario.apodo + ", gracias por completar tus datos.",
					"Ya podés ingresarnos información para compartir con el público.",
				],
				iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
				titulo: "Validación en Proceso",
				check: true,
			};
			// Fin
			return res.render("CMP-0Estructura", {informacion});
		},
	},
	// Edición
	edicion: {
		form: async (req, res) => {
			const tema = "usuario";
			const codigo = "edicion";
			res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Edición de Usuario",
				usuario: req.session.usuario,
			});
		},
		guardar: (req, res) => {
			res.send("/edicion/guardar");
		},
	},

	// Login
	login: {
		form: async (req, res) => {
			// 1. Tema y Código
			const tema = "usuario";
			const codigo = "login";
			let dataEntry = {}; // es necesario que sea un array para que dé error si está vacío

			// 2. Obtiene el Data Entry procesado en 'loginGuardar'
			if (req.session.email || req.session.contrasena) {
				dataEntry = {email: req.session.email, contrasena: req.session.contrasena};
				delete req.session.email;
				delete req.session.contrasena;
			}

			// 3. Variables para la vista
			let errores = await valida.login(dataEntry);
			let variables = [
				{titulo: "E-Mail", type: "text", name: "email", placeholder: "Correo Electrónico"},
				{titulo: "Contraseña", type: "password", name: "contrasena", placeholder: "Contraseña"},
			];

			// 4. Render del formulario
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Login",
				dataEntry,
				errores,
				urlSalir: req.session.urlSinLogin,
				variables,
			});
		},
		guardar: async (req, res) => {
			// Averigua si hay errores de data-entry
			let errores = await valida.login(req.body);

			// Si hay errores de validación, redirecciona
			if (errores.hay) {
				req.session.email = req.body.email;
				req.session.contrasena = req.body.contrasena;
				return res.redirect("/usuarios/login");
			}

			// Obtiene el usuario con los include
			let usuario = await BD_especificas.obtieneUsuarioPorMail(req.body.email);

			// Si corresponde, le cambia el status a 'mailValidado'
			if (usuario.statusRegistro_id == mailPendValidar_id)
				usuario = await procesos.actualizaElStatusDelUsuario(usuario, "mailValidado");

			// Inicia la sesión del usuario y guarda el mail en cookies
			req.session.usuario = usuario;
			res.cookie("email", req.body.email, {maxAge: unDia});

			// Notifica al contador de logins y averigua si cambio la versión
			if (usuario.pais_id) procesos.actualizaElContadorDeLogins(usuario);

			// 9. Redireccionar
			return res.redirect("/usuarios/garantiza-login-y-completo");
		},
	},
	logout: (req, res) => {
		// Borra los datos del usuario, de session y cookie
		delete req.session.usuario;
		res.clearCookie("email");

		// Fin
		return res.redirect("/usuarios/login");
	},
};
