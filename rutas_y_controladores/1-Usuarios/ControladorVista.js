"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
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
	// Circuito de alta de usuario
	altaMailForm: async (req, res) => {
		// Tema y código
		const tema = "usuario";
		let codigo = req.path.slice(1);
		let titulo =
			codigo == "mail"
				? "Registro de Mail"
				: codigo == "olvido-contrasena"
				? "Olvido de Contraseña"
				: "";
		// Obtener el e-mail de session
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : "";
		// Errores
		let errores = req.session.errores ? req.session.errores : false;
		// Generar la info para la vista
		if (errores.documento) {
			let paises = await BD_genericas.obtenerTodos("paises", "nombre");
			var hablaHispana = paises.filter((n) => n.idioma == "Spanish");
			var hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		}
		// Vista
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo,
			link: req.originalUrl,
			dataEntry,
			errores,
			hablaHispana,
			hablaNoHispana,
			urlSalir: req.session.urlSinLogin,
		});
	},
	altaMailGuardar: async (req, res) => {
		// Averigua si hay errores de validación
		let email = req.body.email;
		let errores = await validar.registroMail(email);
		// Si no hay errores, verificar si ya existe en la BD
		if (!errores.hay && (await BD_especificas.obtenerELC_id("usuarios", {email})))
			errores = {email: "Esta dirección de email ya figura en nuestra base de datos", hay: true};
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect(req.originalUrl);
		}
		// Si no hubieron errores de validación...
		let {ahora, contrasena} = procesos.enviaMailConContrasena(req);
		let status_mail_validado = status_registro_us.find((n) => !n.mail_validado).id;
		await BD_genericas.agregarRegistro("usuarios", {
			contrasena,
			fecha_contrasena: ahora,
			email,
			status_registro_id: status_mail_validado,
		});
		// Guarda el mail en 'session'
		req.session.email = email;
		// Datos para la vista
		let codigo = req.path.slice(1);
		let informacion = procesos.cartelInformacion(codigo);
		// Redireccionar
		return res.render("MI-Cartel", {informacion});
	},
	altaPerennesForm: async (req, res) => {
		const tema = "usuario";
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
		const tema = "usuario";
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
			if (req.file) compartidas.borrarArchivo(req.file.destination, req.file.filename);
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
		return res.redirect("/usuarios/bienvenido");
	},
	bienvenido: (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		let letra = usuario.sexo_id == "M" ? "a " : "o ";
		let informacion = {
			mensajes: [
				"Estimad" + letra + usuario.apodo + ", completaste el alta satisfactoriamente.",
				"Bienvenid" + letra + "a la familia de usuarios de ELC",
				"Ya podés personalizar tu perfil.",
			],
			iconos: [variables.vistaEntendido(req.session.urlSinUsuario)],
			titulo: "Bienvenid" + letra + "a la familia ELC",
			colorFondo: "verde",
		};
		// Fin
		return res.render("MI-Cartel", {informacion});
	},
	responsab: async (req, res) => {
		// Ir a la vista
		return res.render("GN0-Estructura", {
			tema: "usuario",
			codigo: "responsabilidad",
			titulo: "Responsabilidad con nuestra BD",
			urlSalir: req.session.urlSinAutInput,
		});
	},
	autInputForm: async (req, res) => {
		const tema = "usuario";
		let codigo = "autInput";
		// Variables
		let paises = await BD_genericas.obtenerTodos("paises", "nombre");
		// Generar la info para la vista
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let errores = req.session.errores ? req.session.errores : false;
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : false;
		let avatar = dataEntry.avatar
			? "/imagenes/9-Provisorio/" + dataEntry.avatar
			: "/imagenes/0-Base/dni.jpg";
		// Ir a la vista
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Solicitud de ABM en nuestra BD",
			link: req.originalUrl,
			dataEntry: {},
			errores,
			hablaHispana,
			hablaNoHispana,
			avatar,
			urlSalir: req.session.urlSinLogin,
		});
	},
	autInputGuardar: async (req, res) => {
		let usuario = req.session.usuario;
		// Averiguar si hay errores de validación
		let errores = await validar.autInput({...req.body, avatar: req.file.filename});
		if (errores.hay) {
			if (req.file) compartidas.borrarArchivo(req.file.destination, req.file.filename);
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect("/usuarios/autorizado-input");
		}
		// Actualiza el usuario
		let datos = {
			numero_documento: req.body.pais_id + "-" + req.body.numero_documento,
			avatar_documento: req.file.filename,
			fecha_feedback_revisores: compartidas.ahora(),
		};
		req.session.usuario = await procesos.actualizaElUsuario("documento", "nada", usuario, datos);
		// Mueve el archivo a la carpeta definitiva
		compartidas.moverImagen(datos.avatar_documento, "9-Provisorio", "2-DocsUsuarios");
		// Redirecciona
		return res.redirect("/usuarios/dni-recibido");
	},
	documentoRecibido: (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		let letra = usuario.sexo_id == "M" ? "a " : "o ";
		let informacion = {
			mensajes: [
				"Estimad" + letra + usuario.apodo + ", gracias por completar tu solicitud.",
				"Queda en manos del equipo de Revisores validar tus datos.",
				"Luego de la validación, recibirás un mail de feedback.",
				"En caso de estar aprobado, podrás ingresar información.",
			],
			iconos: [variables.vistaEntendido(req.session.urlSinAutInput)],
			titulo: "Solicitud de ABM exitosa",
			colorFondo: "verde",
		};
		// Fin
		return res.render("MI-Cartel", {informacion});
	},
	autRevisionForm: (req, res) => {
		let informacion = {
			mensajes: ["Vista pendiente de contrucción, prevista para más adelante"],
			iconos: [variables.vistaAnterior(req.session.urlAnterior)],
			colorFondo: "gris",
		};
		// Fin
		return res.render("MI-Cartel", {informacion});
	},
	// Edición
	edicionForm: async (req, res) => {
		const tema = "usuario";
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

	// Revisión
	tablero:(req,res)=>{
		// Tema y Código
		const tema = "revisarUsuario";
		let codigo = "tableroControl";
		let userID = req.session.usuario.id;
		// Ir a la vista
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Usuarios - Tablero de Control",
		});
	},

	// Login
	loginForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "usuario";
		let codigo = "login";
		// Toma el mail desde cookies, si no está en session. Esto sirve para complementar el alta de usuario.
		if (!req.session.email)
			req.session.email = req.cookies && req.cookies.email ? req.cookies.email : undefined;
		// 2. Obtiene el Data Entry ya realizado
		let dataEntry =
			req.session.email !== undefined || req.session.contrasena !== undefined
				? {email: req.session.email, contrasena: req.session.contrasena}
				: "";
		delete req.session.email;
		delete req.session.contrasena;
		// 3. Variables para la vista
		let {errores} = dataEntry ? await validar.mailContrasena_y_ObtieneUsuario(dataEntry) : "";
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
		let {errores, usuario} = await validar.mailContrasena_y_ObtieneUsuario(req.body);
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
		// 8. Notificar al contador de logins
		let hoyAhora = compartidas.ahora();
		procesos.actualizarElContadorDeLogins(usuario, hoyAhora);
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
		return res.render("MI-Cartel", {informacion});
	},
	logout: (req, res) => {
		let url = req.session.urlSinLogin;
		req.session.destroy();
		res.clearCookie("email");
		return res.redirect(url);
	},
	olvidoContrGuardar: async (req, res) => {
		// Averigua si hay errores de validación
		let dataEntry = req.body;
		let errores = await validar.registroMail(dataEntry.email);
		let usuario;
		// Si no hay errores 'superficiales', verifica otros más 'profundos'
		if (!errores.hay) [errores, usuario] = await validar.olvidoContrBE(dataEntry);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.errores = errores;
			return res.redirect(req.originalUrl);
		}
		// Si no hubieron errores de validación...
		let {ahora, contrasena} = procesos.enviaMailConContrasena(req);
		await BD_genericas.actualizarPorId("usuarios", usuario.id, {
			contrasena,
			fecha_contrasena: ahora,
		});
		// Guarda el mail en 'session'
		req.session.email = req.body.email;
		// Borra los errores
		req.session.errores = "";
		// Datos para la vista
		let codigo = req.path.slice(1);
		let informacion = procesos.cartelInformacion(codigo);
		// Redireccionar
		return res.render("MI-Cartel", {informacion});
	},
};
