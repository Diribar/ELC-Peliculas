"use strict";
// Variables
const procesos = require("./US-FN-Procesos");
const valida = require("./US-FN-Validar");

module.exports = {
	// Circuito de alta de usuario
	altaMail_olvidoContr: async (req, res) => {
		// Variables
		const tema = "usuario";
		const {ruta} = comp.reqBasePathUrl(req);
		const codigo = ruta.slice(1) == "alta-mail" ? "altaMail" : "olvidoContr";
		const altaMail = codigo == "altaMail";
		const olvidoContr = codigo == "olvidoContr";
		const titulo = altaMail ? "Alta de Usuario - Mail" : olvidoContr ? "Olvido de Contraseña" : "";
		const datosGrales = altaMail ? req.session.altaMail : olvidoContr ? req.session.olvidoContr : {};

		// Info para la vista
		const dataEntry = datosGrales && datosGrales.datos ? datosGrales.datos : {};
		const errores = datosGrales && datosGrales.errores ? datosGrales.errores : {};
		const validarDatosPerennes = datosGrales && datosGrales.validarDatosPerennes;

		// Vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, hablaHispana, hablaNoHispana, dataEntry, errores, validarDatosPerennes},
			urlSalir: "/usuarios/login",
		});
	},
	editables: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const codigo = "editables";
			const usuario = req.session.usuario;
			const {editables} = req.session;

			// Generar la info para la vista
			const dataEntry = editables && editables.datos ? editables.datos : {};
			const errores = editables && editables.errores ? editables.errores : {};
			const avatar = usuario.avatar
				? "/Externa/1-Usuarios/" + usuario.avatar
				: "/publico/imagenes/Avatar/Usuario-Generico.jpg";

			// Va a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo: "Alta de Usuario - Datos Editables"},
				...{dataEntry, errores, avatar, hablaHispana, hablaNoHispana, generos},
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const usuario = req.session.usuario;

			// Acciones si hay errores de validación
			let datos = {...req.body};
			if (req.file) {
				datos.tamano = req.file.size;
				datos.avatar = req.file.filename;
			}
			let errores = await valida.editables(datos);
			if (errores.hay) {
				if (req.file) comp.gestionArchivos.elimina(req.file.destination, req.file.filename);
				req.session.editables = {datos: req.body, errores};
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

			// Actualización de session
			req.session.usuario = await comp.obtieneUsuarioPorMail(usuario.email);
			delete req.session.editables;

			// Redirecciona
			return res.redirect("/usuarios/editables-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			const usuario = req.session.usuario;
			const informacion = {
				mensajes: [
					"Estimad" + usuario.genero.letraFinal + " " + usuario.apodo + ", completaste el alta satisfactoriamente.",
					"Bienvenid" + usuario.genero.letraFinal + " a nuestro sitio como usuario.",
					"Ya podés guardar tus consultas personalizadas.",
				],
				iconos: [variables.vistaEntendido(req.session.urlFueraDeUsuarios)],
				titulo: "Bienvenid" + usuario.genero.letraFinal + " a la familia ELC",
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

			// Genera info para la vista
			const {perennes} = req.session;
			const dataEntry = perennes && perennes.dataEntry ? perennes.dataEntry : {};
			const errores = perennes && perennes.errores ? perennes.errores : {};

			// Vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, dataEntry, errores, hablaHispana, hablaNoHispana},
				titulo: "Alta de Usuario - Datos Perennes",
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const dataEntry = req.body;
			const errores = await valida.perennesBE(dataEntry);

			// Redirecciona si hubo algún error de validación
			if (errores.hay) {
				req.session.perennes = {dataEntry, errores};
				return res.redirect("/usuarios/perennes");
			}
			// return res.send(errores);

			// Actualiza el rol y status del usuario
			const novedades = {...dataEntry, rolUsuario_id: rolPermInputs_id, statusRegistro_id: perennes_id}; // le sube el rol y el status
			const usuario = req.session.usuario;
			baseDeDatos.actualizaPorId("usuarios", usuario.id, novedades);
			req.session.usuario = {...usuario, ...novedades};

			// Redirecciona
			return res.redirect("/usuarios/perennes-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			const usuario = req.session.usuario;
			const letra = comp.letras.oa(usuario);
			const vistaEntendido = variables.vistaEntendido(req.session.urlFueraDeUsuarios);

			// Información
			const informacion = {
				titulo: "Permiso otorgado",
				mensajes: [
					"Estimad" + letra + usuario.apodo + ", gracias por completar tus datos.",
					"Ya podés ingresar información para compartir con el público.",
				],
				iconos: [vistaEntendido],
				check: true,
			};

			// Fin
			return res.render("CMP-0Estructura", {informacion});
		},
	},

	// Varios
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
	login: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const codigo = "login";
			const datosGrales = req.session && req.session.login ? req.session.login : {};

			// Info para la vista
			const dataEntry = datosGrales && datosGrales.datos ? datosGrales.datos : {};
			const errores = datosGrales && datosGrales.errores ? datosGrales.errores : {};
			const campos = [
				{titulo: "E-Mail", type: "text", name: "email", placeholder: "Correo Electrónico"},
				{titulo: "Contraseña", type: "password", name: "contrasena", placeholder: "Contraseña"},
			];

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, dataEntry, errores, campos, titulo: "Login"},
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Actualiza cookies - no se actualiza 'session'', para que se ejecute el middleware 'clientesSession'
			const {email} = req.body;
			res.cookie("email", email, {maxAge: unDia});

			// Actualiza y obtiene el usuario
			await baseDeDatos.actualizaTodosPorCondicion("usuarios", {email}, {diasSinCartelBeneficios: 0}); // debe hacerse con 'await' para que session lo tome bien
			const usuario = await comp.obtieneUsuarioPorMail(email);

			// Si corresponde, le cambia el status a 'mailValidado'
			if (usuario.statusRegistro_id == mailPendValidar_id)
				await procesos.actualizaElStatusDelUsuario(usuario, "mailValidado");

			// Limpia la información provisoria
			res.clearCookie("intentosLogin");
			delete req.session.login;

			// Redirecciona
			return res.redirect("/usuarios/garantiza-login-y-completo");
		},
		logout: (req, res) => {
			procesos.logout(req, res);
			return res.redirect("/usuarios/login");
		},
	},
	edicion: {
		form: async (req, res) => {
			const tema = "usuario";
			const codigo = "edicion";
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Edición de Usuario",
				usuario: req.session.usuario,
			});
		},
		guardar: (req, res) => {
			return res.send("/edicion/guardar");
		},
	},
	miscelaneas: {
		accesosSuspendidos: (req, res) => {
			// Variables
			const codigo = req.params.id;
			const mensajeCola = "Con el ícono de entendido salís del circuito de usuario.";
			let mensajes, titulo, iconosInfo; // la variable 'iconos' está definida en 'app'

			// Vista fuera de usuario
			const urlFueraDeUsuarios = req.session.urlFueraDeUsuarios ? req.session.urlFueraDeUsuarios : "";
			const vistaEntendido = [{...variables.vistaEntendido(urlFueraDeUsuarios), titulo: "Entendido"}];

			// Feedback Alta de Mail suspendida
			if (codigo == "alta-mail") {
				mensajes = [procesos.comentarios.accesoSuspendido("para dar de alta tu mail"), mensajeCola];
				titulo = "Alta de Mail suspendida por 24hs";
				iconosInfo = vistaEntendido;
			}

			// Feedback Login suspendido
			if (codigo == "login") {
				mensajes = [procesos.comentarios.accesoSuspendido("para realizar el login"), mensajeCola];
				titulo = "Login suspendido por 24hs";
				iconosInfo = vistaEntendido;
			}

			// Feedback Olvido de Contraseña suspendido
			if (codigo == "olvido-contrasena") {
				mensajes = [procesos.comentarios.accesoSuspendido("para validar tus datos"), mensajeCola];
				titulo = "Olvido de Contraseña suspendido por 24hs";
				iconosInfo = [{...variables.vistaAnterior("/usuarios/login"), titulo: "Ir a la vista de Login"}, vistaEntendido];
			}

			// Consolida la información
			const informacion = {mensajes, iconos: iconosInfo, titulo};

			// Logout
			procesos.logout(req, res);

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
		envioExitoso: (req, res) => {
			// Variables
			const {codigo} = req.query;
			const altaMail = codigo == "alta-mail";
			const olvidoContr = codigo == "olvido-contrasena";

			// Feedback
			const informacion = {
				mensajes: altaMail
					? [
							"Hemos generado tu usuario con tu dirección de mail.",
							"Te hemos enviado por mail la contraseña.",
							"Con el ícono de abajo accedés al Login.",
					  ]
					: olvidoContr
					? [
							"Hemos generado una nueva contraseña para tu usuario.",
							"Te la hemos enviado por mail.",
							"Con el ícono de abajo accedés al Login.",
					  ]
					: [],
				iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
				titulo: altaMail ? "Alta exitosa de Usuario" : olvidoContr ? "Actualización exitosa de Contraseña" : "",
				check: true,
			};

			// Elimina la cookie de intenciones
			const cookie = altaMail ? "intentosAM" : olvidoContr ? "intentosDP" : "";
			res.clearCookie(cookie);

			// Elimina la cookie de los datos y errores
			const session = altaMail ? "altaMail" : olvidoContr ? "olvidoContr" : "";
			delete req.session[session];

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
		envioFallido: (req, res) => {
			// Variables
			const {codigo} = req.query;
			const altaMail = codigo == "alta-mail";
			const olvidoContr = codigo == "olvido-contrasena";

			// Feedback
			const informacion = {
				mensajes: [
					"No pudimos enviarte un mail con la contraseña.",
					"Revisá tu conexión a internet y volvé a intentarlo.",
					"Con el ícono de abajo regresás a la vista anterior.",
				],
				iconos: [{...variables.vistaEntendido("/usuarios/alta-mail"), titulo: "Entendido e ir a la vista anterior"}],
				titulo: altaMail ? "Alta de Usuario fallida" : olvidoContr ? "Actualización de Contraseña fallida" : "",
			};

			// Vista
			return res.render("CMP-0Estructura", {informacion});
		},
		olvidoContr: (req, res) => res.redirect("/usuarios/olvido-contrasena"),
		altaMail: (req, res) => res.redirect("/usuarios/olvido-contrasena"),
	},
};
