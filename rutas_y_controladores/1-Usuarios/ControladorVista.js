"use strict";
// Definir variables
const fs = require("fs");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
const valida = require("./FN-Validar");

module.exports = {
	redireccionar: async (req, res) => {
		// Enviar a Login si no está logueado
		if (!req.session.usuario) return res.redirect("/usuarios/login");
		// Redireccionar
		let status_usuario = req.session.usuario.status_registro;
		status_usuario.mail_a_validar
			? res.redirect("/usuarios/login")
			: status_usuario.mail_validado
			? res.redirect("/usuarios/editables")
			: req.session.urlSinUsuario
			? res.redirect(req.session.urlSinUsuario)
			: res.redirect("/");
	},
	// Circuito de alta de usuario
	altaMailForm: async (req, res) => {
		// Sirve también para olvido de contraseña
		// Tema y código
		const tema = "usuario";
		const codigo = req.path.slice(1);
		let titulo =
			codigo == "alta-mail"
				? "Registro de Mail"
				: codigo == "olvido-contrasena"
				? "Olvido de Contraseña"
				: "";
		// Obtiene el e-mail de session
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : "";
		// Errores
		let errores =
			codigo == "alta-mail"
				? {...req.session.erroresAM}
				: codigo == "olvido-contrasena"
				? {...req.session.erroresOC}
				: false;
		// Generar la info para la vista 'olvido de contraseña'
		if (errores.documento) {
			let paises = await BD_genericas.obtieneTodos("paises", "nombre");
			var hablaHispana = paises.filter((n) => n.idioma == "Spanish");
			var hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		}
		// Vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
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
		let errores = await valida.altaMail(email);
		// Si no hay errores, verificar si ya existe en la BD
		if (!errores.hay && (await BD_especificas.obtieneELC_id("usuarios", {email})))
			errores = {email: "Esta dirección de email ya figura en nuestra base de datos", hay: true};
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.erroresAM = errores;
			return res.redirect(req.originalUrl);
		}
		// Si no hubieron errores de validación...
		// Envía un mail con la contraseña
		let {ahora, contrasena, feedbackEnvioMail} = await procesos.enviaMailConContrasena(req);
		// Si el mail no pudo ser enviado, lo avisa y sale de la rutina
		if (!feedbackEnvioMail.OK)
			return res.render("CMP-0Estructura", {informacion: feedbackEnvioMail.informacion});
		// Agrega el usuario
		await BD_genericas.agregaRegistro("usuarios", {
			contrasena,
			fecha_contrasena: ahora,
			email,
			status_registro_id: status_registro_us.find((n) => n.mail_a_validar).id,
		});
		// Guarda el mail en 'session'
		req.session.email = email;
		// Datos para la vista
		let informacion = {
			mensajes: [
				"La generación de una nueva contraseña fue exitosa.",
				"Te la hemos enviado por mail.",
				"Por favor, usala para ingresar al login.",
				"Haciendo click abajo de este mensaje, vas al Login.",
			],
			iconos: [{...variables.vistaEntendido("/usuarios/login"), titulo: "Entendido e ir al Login"}],
			titulo: "Generación de contraseña",
			colorFondo: "verde",
		};
		// Redireccionar
		return res.render("CMP-0Estructura", {informacion});
	},
	editablesForm: async (req, res) => {
		const tema = "usuario";
		const codigo = "editables";
		// Redireccionar si corresponde
		let usuario = req.session.usuario;
		if (!usuario.status_registro.mail_validado) return res.redirect("/usuarios/redireccionar");
		// Variables
		let paises = await BD_genericas.obtieneTodos("paises", "nombre");
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let errores = req.session.errores ? req.session.errores : false;
		// Roles de Iglesia
		let roles_iglesia = await BD_genericas.obtieneTodosPorCampos("roles_iglesia", {usuario: true});
		roles_iglesia = roles_iglesia.filter((n) => n.id.length == 2);
		roles_iglesia.sort((a, b) => (a.orden < b.orden ? -1 : a.orden > b.orden ? 1 : 0));
		// Generar la info para la vista
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : req.session.usuario;
		let avatar = usuario.avatar
			? "/imagenes/1-Usuarios/" + usuario.avatar
			: "/imagenes/0-Base/AvatarGenericoUsuario.png";
		// Va a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Datos Editables",
			dataEntry,
			errores,
			hablaHispana,
			hablaNoHispana,
			roles_iglesia,
			avatar,
			urlSalir: req.session.urlSinLogin,
		});
	},
	editablesGuardar: async (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		// Averigua si hay errores de validación
		let datos = {...req.body};
		if (req.file) {
			datos.tamano = req.file.size;
			datos.avatar = req.file.filename;
		}
		// Averigua si hay errores de validación
		let errores = await valida.editables(datos);
		if (errores.hay) {
			if (req.file) comp.borraUnArchivo(req.file.destination, req.file.filename);
			req.session.dataEntry = req.body; // No guarda el avatar
			req.session.errores = errores;
			return res.redirect("/usuarios/redireccionar");
		}
		if (req.file) {
			// Elimina el archivo 'avatar' anterior
			if (usuario.avatar) comp.borraUnArchivo(req.file.destination, usuario.avatar);
			// Agrega el campo 'avatar' a los datos
			req.body.avatar = req.file.filename;
		}
		// Actualiza el usuario
		req.session.usuario = await procesos.actualizaElUsuario("editables", usuario, req.body);
		// Mueve el archivo a la carpeta definitiva
		if (req.file) comp.mueveUnArchivoImagen(req.file.filename, "9-Provisorio", "1-Usuarios");
		// Redirecciona
		return res.redirect("/usuarios/bienvenido");
	},
	bienvenido: (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		let informacion = {
			mensajes: [
				"Estimado/a " + usuario.apodo + ", completaste el alta satisfactoriamente.",
				"Bienvenido/a a la familia de usuarios de ELC",
			],
			iconos: [variables.vistaEntendido(req.session.urlSinUsuario)],
			titulo: "Bienvenido/a a la familia ELC",
			colorFondo: "verde",
		};
		// Fin
		return res.render("CMP-0Estructura", {informacion});
	},
	documentoForm: async (req, res) => {
		const tema = "usuario";
		const codigo = "documento";
		// Redireccionar si corresponde
		let usuario = req.session.usuario;
		if (!usuario.status_registro.editables) return res.redirect("/usuarios/redireccionar");
		// Variables
		let paises = await BD_genericas.obtieneTodos("paises", "nombre");
		let sexos = await BD_genericas.obtieneTodos("sexos", "orden");
		if (!usuario.rol_iglesia.mujer) sexos = sexos.filter((n) => n.letra_final == "o");
		// Generar la info para la vista
		let hablaHispana = paises.filter((n) => n.idioma == "Spanish");
		let hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
		let errores = req.session.errores ? req.session.errores : false;
		let dataEntry = req.session.dataEntry ? req.session.dataEntry : usuario;
		let avatar = usuario.docum_avatar
			? "/imagenes/5-DocsRevisar/" + usuario.docum_avatar
			: "/imagenes/0-Base/AvatarGenericoDocum.jpg";
		// Crear la carpeta si no existe
		const ruta = "./publico/imagenes/9-Provisorio";
		if (!fs.existsSync(ruta)) fs.mkdirSync(ruta);
		// Va a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Datos del Documento",
			dataEntry,
			errores,
			hablaHispana,
			hablaNoHispana,
			avatar,
			urlSalir: req.session.urlSinLogin,
			sexos,
		});
	},
	documentoGuardar: async (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		// Obtiene los datos
		let datos = {
			...req.body,
			docum_avatar: req.file ? req.file.filename : usuario.docum_avatar,
			id: usuario.id,
		};
		if (req.file) datos.tamano = req.file.size;
		datos.ruta = req.file ? "./publico/imagenes/9-Provisorio/" : "./publico/imagenes/5-DocsRevisar/";
		// Averigua si hay errores de validación
		let errores = await valida.documentoBE(datos);
		// Redirecciona si hubo algún error de validación
		if (errores.hay) {
			if (req.file) comp.borraUnArchivo(req.file.destination, req.file.filename);
			req.session.dataEntry = req.body; // No guarda el docum_avatar
			req.session.errores = errores;
			return res.redirect("/usuarios/documento");
		}
		if (req.file) {
			// Elimina el archivo 'docum_avatar' anterior
			if (usuario.docum_avatar)
				comp.borraUnArchivo("./publico/imagenes/5-DocsRevisar/", usuario.docum_avatar);
			// Agrega el campo 'docum_avatar' a los datos
			req.body.docum_avatar = req.file.filename;
		}
		// Prepara la información a actualizar
		req.body.fecha_revisores = comp.ahora();
		// Actualiza el usuario
		req.session.usuario = await procesos.actualizaElUsuario("ident_a_validar", usuario, req.body);
		// Mueve el archivo a la carpeta definitiva
		if (req.file) comp.mueveUnArchivoImagen(req.file.filename, "9-Provisorio", "5-DocsRevisar");
		// Redirecciona
		return res.redirect("/usuarios/documento-recibido");
	},
	documentoRecibido: (req, res) => {
		// Redireccionar si corresponde
		let usuario = req.session.usuario;
		if (!usuario.status_registro.ident_a_validar) return res.redirect("/usuarios/redireccionar");
		// Variables
		let letra = usuario.sexo_id == "M" ? "a " : "o ";
		let informacion = {
			mensajes: [
				"Estimad" + letra + usuario.apodo + ", gracias por completar tus datos.",
				"Ahora, queda a cargo del equipo de Revisores la tarea de revisarlos.",
				"Luego de la revisión, recibirás un mail de feedback.",
				"En caso de estar aprobado, podrás ingresar información.",
			],
			iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
			titulo: "Solicitud de ABM exitosa",
			colorFondo: "verde",
		};
		// Fin
		return res.render("CMP-0Estructura", {informacion});
	},
	// Edición
	edicionForm: async (req, res) => {
		const tema = "usuario";
		const codigo = "edicion";
		res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Edición de Usuario",
			usuario: req.session.usuario,
		});
	},
	edicionGuardar: (req, res) => {
		res.send("/edicion/guardar");
	},

	// Login
	loginForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "usuario";
		const codigo = "login";
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
		let {errores} = dataEntry ? await valida.mailContrasena_y_ObtieneUsuario(dataEntry) : {errores: ""};
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
	loginGuardar: async (req, res) => {
		// 1. Averigua si hay errores de data-entry
		let {errores, usuario} = await valida.mailContrasena_y_ObtieneUsuario(req.body);
		// 4. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.email = req.body.email;
			req.session.contrasena = req.body.contrasena;
			return res.redirect("/usuarios/login");
		}
		// 5. Si corresponde, le cambia el status a 'mail_validado'
		if (usuario.status_registro.mail_a_validar)
			usuario = await procesos.actualizaElUsuario("mail_validado", usuario);
		// Borra todas las cookies
		if (req.cookies && req.cookies.emailUnMes != req.body.email)
			for (let prop in req.cookies) res.clearCookie(prop);
		// 6. Inicia la sesión del usuario
		req.session.usuario = usuario;
		// 7. Guarda el mail en cookies
		res.cookie("email", req.body.email, {maxAge: unDia});
		res.cookie("emailUnMes", req.body.email, {maxAge: unMes});
		// 8. Notificar al contador de logins
		let hoyAhora = comp.ahora();
		procesos.actualizaElContadorDeLogins(usuario, hoyAhora);
		// 9. Redireccionar
		return res.redirect("/usuarios/redireccionar");
	},
	preLogout: (req, res) => {
		// Variables
		let usuario = req.session.usuario;
		let informacion = {
			mensajes: [
				"¿Estás segur" +
					(usuario.sexo_id == "M" ? "a" : usuario.sexo_id == "V" ? "o" : "o/a") +
					" de que te querés desloguear?",
			],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Cancelar"},
				{nombre: "fa-circle-right", link: "/usuarios/logout", titulo: "Logout", autofocus: true},
			],
			titulo: "Logout",
			colorFondo: "gris",
		};
		// Fin
		return res.render("CMP-0Estructura", {informacion});
	},
	logout: (req, res) => {
		let url = req.session.urlSinUsuario;
		// Borra el session y un cookie
		req.session.destroy();
		res.clearCookie("email");
		// Fin
		return res.redirect(url);
	},
	olvidoContrGuardar: async (req, res) => {
		// Averigua si hay errores de validación
		let dataEntry = req.body;
		let errores = await valida.altaMail(dataEntry.email);
		let usuario;
		// Si no hay errores 'superficiales', verifica otros más 'profundos'
		if (!errores.hay) [errores, usuario] = await valida.olvidoContrBE(dataEntry);
		// Redireccionar si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.erroresOC = errores;
			return res.redirect(req.originalUrl);
		}
		// Si no hubieron errores de validación...
		let {ahora, contrasena} = procesos.enviaMailConContrasena(req);
		await BD_genericas.actualizaPorId("usuarios", usuario.id, {
			contrasena,
			fecha_contrasena: ahora,
		});
		// Guarda el mail en 'session'
		req.session.email = req.body.email;
		// Borra los errores
		req.session.errores = "";
		// Datos para la vista
		const codigo = req.path.slice(1);
		let informacion = procesos.cartelInformacion(codigo);
		// Redireccionar
		return res.render("CMP-0Estructura", {informacion});
	},
};
