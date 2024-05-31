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
			usuario = await procesos.actualizaElStatusDelUsuario(usuario, "editables", req.body);

			// Actualización de session
			req.session.usuario = usuario;
			delete req.session.editables;

			// Redirecciona
			return res.redirect("/usuarios/editables-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let informacion = {
				mensajes: [
					"Estimad" + usuario.genero.letraFinal + " " + usuario.apodo + ", completaste el alta satisfactoriamente.",
					"Bienvenid" + usuario.genero.letraFinal + " a nuestro sitio como usuario.",
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
			BD_genericas.actualizaPorId("usuarios", usuario.id, novedades);
			req.session.usuario = {...usuario, ...novedades};

			// Redirecciona
			return res.redirect("/usuarios/perennes-bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let letra = comp.letras.ao(usuario);
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
			// Variables
			const datos = req.body;
			const {errores, usuario} = await valida.login(datos);
			let intentosLogin;

			// Acciones si hay errores de credenciales
			if (errores.hay) {
				// intentosLogin - cookie
				intentosLogin = req.cookies && req.cookies.iintentosLogin ? req.cookies.intentosLogin + 1 : 1;
				if (intentosLogin <= intentosCookies) res.cookie("intentosLogin", intentosLogin, {maxAge: unDia});
				const intentosPendsCookie = Math.max(0, intentosCookies - intentosLogin);

				// intentosLogin - usuario
				let intentosPendsBD = intentosBD;
				if (usuario && errores.contr_BD) {
					intentosLogin = usuario.intentosLogin + 1;
					if (intentosLogin <= intentosBD) BD_genericas.actualizaPorId("usuarios", usuario.id, {intentosLogin});
					intentosPendsBD = Math.max(0, intentosBD - intentosLogin);
				}

				// Convierte el resultado en texto
				const intentosPendsCons = Math.min(intentosPendsCookie, intentosPendsBD);
				errores.credenciales =
					procesos.comentarios.credsInvalidas.login + "<br>Intentos disponibles: " + intentosPendsCons;

				// session - guarda la info
				req.session.login = {datos, errores, usuario};

				// Redirecciona
				return res.redirect("/usuarios/login");
			}

			// cookies - no se actualiza 'session'', para que se ejecute el middleware 'loginConCookie'
			res.cookie("email", req.body.email, {maxAge: unDia});
			res.clearCookie("intentosLogin");
			delete req.session.login;

			// Si corresponde, le cambia el status a 'mailValidado'
			if (usuario.statusRegistro_id == mailPendValidar_id)
				usuario = await procesos.actualizaElStatusDelUsuario(usuario, "mailValidado");

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
	miscelaneas: {
		accesosSuspendidos: (req, res) => {
			// Variables
			const codigo = req.params.id;
			const mensajeCola = "Con el ícono de entendido salís a la vista de inicio.";

			// Feedback
			const mensajes = false
				? false
				: codigo == "alta-mail"
				? [procesos.comentarios.accesoSuspendido("para dar de alta tu mail"), mensajeCola]
				: codigo == "login"
				? [procesos.comentarios.accesoSuspendido("para realizar el login"), mensajeCola]
				: codigo == "olvido-contrasena"
				? [procesos.comentarios.accesoSuspendido("para validar tus datos"), mensajeCola]
				: [];
			const titulo = false
				? false
				: codigo == "alta-mail"
				? "Alta de Mail suspendida por 24hs"
				: codigo == "login"
				? "Login suspendido por 24hs"
				: codigo == "olvido-contrasena"
				? "Olvido de Contraseña suspendido por 24hs"
				: "";
			const iconos = false
				? false
				: codigo == "alta-mail"
				? [{...variables.vistaEntendido(), titulo: "Ir a la vista de inicio"}]
				: codigo == "login"
				? [{...variables.vistaEntendido(), titulo: "Ir a la vista de inicio"}]
				: codigo == "olvido-contrasena"
				? [
						{...variables.vistaAnterior("/usuarios/login"), titulo: "Ir a la vista de Login"},
						{...variables.vistaEntendido(), titulo: "Ir a la vista de inicio"},
				  ]
				: "";
			const informacion = {mensajes, iconos, titulo};

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