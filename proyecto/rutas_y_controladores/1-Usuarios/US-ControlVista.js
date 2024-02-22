"use strict";
// Variables
const procesos = require("./US-FN-Procesos");
const valida = require("./US-FN-Validar");

module.exports = {
	loginCompleto: async (req, res) => {
		// Envía a Login si no está logueado
		if (!req.session.usuario) return res.redirect("/usuarios/login");

		// Variables
		const statusUsuario_id = req.session.usuario.statusRegistro_id;
		const url =
			statusUsuario_id == mailPendValidar_id
				? "/usuarios/login"
				: statusUsuario_id == mailValidado_id
				? "/usuarios/editables"
				: req.session.urlFueraDeUsuarios
				? req.session.urlFueraDeUsuarios
				: "/";

		// Redirecciona
		return res.redirect(url);
	},
	// Circuito de alta de usuario
	altaMail: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const {ruta} = comp.reqBasePathUrl(req);
			const codigo = ruta.slice(1);
			const titulo = codigo == "alta-mail" ? "Alta de Usuario - Mail" : "Olvido de Contraseña";
			const dataEntry = req.session["olvido-contrasena"] ? req.session["olvido-contrasena"] : {};
			const errores = dataEntry.errores ? dataEntry.errores : false;
			const mostrarCampos = errores.faltanCampos || errores.credenciales;

			// Vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, dataEntry, errores, hablaHispana, hablaNoHispana, mostrarCampos},
				urlSalir: "/usuarios/login",
			});
		},
		envioExitoso: (req, res) => {
			// Variables
			const informacion = {
				mensajes: [
					"Hemos generado tu usuario con tu dirección de mail.",
					"Te hemos enviado por mail la contraseña.",
					"Con el ícono de abajo accedés al Login.",
				],
				iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
				titulo: "Alta exitosa de Usuario",
				check: true,
			};

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
		envioFallido: (req, res) => {
			// Variables
			const informacion = {
				mensajes: [
					"No pudimos enviarte un mail con la contraseña.",
					"Revisá tu conexión a internet y volvé a intentarlo.",
					"Con el ícono de abajo regresás a la vista anterior.",
				],
				iconos: [{...variables.vistaEntendido("/usuarios/alta-mail"), titulo: "Entendido e ir a la vista anterior"}],
				titulo: "Alta de Usuario fallida",
			};

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
	},
	editables: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const codigo = "editables";
			const usuario = req.session.usuario;
			const errores = req.session.errores ? req.session.errores : false;

			// Generar la info para la vista
			const dataEntry = req.session.dataEntry ? req.session.dataEntry : usuario;
			const avatar = usuario.avatar
				? "/Externa/1-Usuarios/" + usuario.avatar
				: "/publico/imagenes/Avatar/Usuario-Generico.jpg";

			// Va a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo: "Alta de Usuario - Datos Editables"},
				...{dataEntry, errores, avatar, hablaHispana, hablaNoHispana},
				sexos: sexos.filter((m) => m.letra_final),
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

			// Genera la info para la vista
			const errores = req.session.errores ? req.session.errores : false;
			const dataEntry = req.session.dataEntry ? req.session.dataEntry : usuario;

			// Va a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, dataEntry, errores, hablaHispana, hablaNoHispana},
				titulo: "Alta de Usuario - Datos Perennes",
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const datos = req.body;
			const errores = await valida.perennesBE(datos);

			// Redirecciona si hubo algún error de validación
			if (errores.hay) {
				req.session.dataEntry = req.body;
				req.session.errores = errores;
				return res.redirect("/usuarios/perennes");
			}

			// Actualiza el rol y status del usuario
			const novedades = {...datos, rolUsuario_id: rolPermInputs_id, statusRegistro_id: perennes_id}; // Le sube el rol a permInputs
			const usuario = req.session.usuario;
			BD_genericas.actualizaPorId("usuarios", usuario.id, novedades);
			req.session.usuario = {...usuario, ...novedades};

			// Redirecciona
			return res.redirect("/usuarios/perennes-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let letra = usuario.sexo_id == "M" ? "a " : "o ";
			let informacion = {
				titulo: "Permiso otorgado",
				mensajes: [
					"Estimad" + letra + usuario.apodo + ", gracias por completar tus datos.",
					"Ya podés ingresar información para compartir con el público.",
				],
				iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
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

			// 2. Obtiene el Data Entry procesado en 'loginGuardar'
			const dataEntry =
				req.session.email || req.session.contrasena ? {email: req.session.email, contrasena: req.session.contrasena} : {}; // es necesario que sea un array para que dé error si está vacío
			delete req.session.email;
			delete req.session.contrasena;

			// 3. Variables para la vista
			let errores = await valida.login(dataEntry);
			console.log(241, errores);
			let variables = [
				{titulo: "E-Mail", type: "text", name: "email", placeholder: "Correo Electrónico"},
				{titulo: "Contraseña", type: "password", name: "contrasena", placeholder: "Contraseña"},
			];

			// 4. Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, dataEntry, errores, variables, titulo: "Login"},
				urlSalir: req.session.urlSinLogin,
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

			// Guarda el mail en cookies
			res.cookie("email", req.body.email, {maxAge: unDia});

			// Redirecciona
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
