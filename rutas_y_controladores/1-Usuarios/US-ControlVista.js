"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesos = require("./US-FN-Procesos");
const valida = require("./US-FN-Validar");

module.exports = {
	login_y_completo: async (req, res) => {
		// Enviar a Login si no está logueado
		if (!req.session.usuario) return res.redirect("/usuarios/login");
		// Redireccionar
		let status_usuario = req.session.usuario.statusRegistro;
		status_usuario.mail_a_validar
			? res.redirect("/usuarios/login")
			: status_usuario.mail_validado
			? res.redirect("/usuarios/editables")
			: req.session.urlFueraDeUsuarios
			? res.redirect(req.session.urlFueraDeUsuarios)
			: res.redirect("/");
	},
	// Circuito de alta de usuario
	altaMail: {
		form: async (req, res) => {
			// Sirve también para olvido de contraseña

			// Tema y código
			const tema = "usuario";
			const {ruta} = comp.reqBasePathUrl(req);
			const codigo = ruta.slice(1);
			let titulo = codigo == "alta-mail" ? "Alta de Mail" : codigo == "olvido-contrasena" ? "Olvido de Contraseña" : "";

			// Obtiene el e-mail de session
			let dataEntry = req.session.dataEntry ? req.session.dataEntry : "";

			// Errores
			let errores =
				codigo == "alta-mail"
					? {...req.session.erroresAM}
					: codigo == "olvido-contrasena"
					? {...req.session.erroresOC}
					: false;

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
		guardar: async (req, res) => {
			// Variables
			const email = req.body.email;
			let errores, ELC_id;

			// Averigua si hay errores de validación
			errores = await valida.altaMail(email);

			// Si no hay errores, verifica si ya existe en la BD
			if (!errores.hay) {
				ELC_id = await BD_especificas.obtieneELC_id("usuarios", {email});
				if (ELC_id) errores = {email: "Esta dirección de email ya figura en nuestra base de datos", hay: true};
			}

			// Redirecciona si hubo algún error de validación
			if (errores.hay) {
				req.session.dataEntry = req.body;
				req.session.erroresAM = errores;
				return res.redirect(req.originalUrl);
			}

			// Si no hubieron errores de validación...
			// Envía un mail con la contraseña
			let {ahora, contrasena, feedbackEnvioMail} = await procesos.enviaMailConContrasena(req);

			// Si el mail no pudo ser enviado, lo avisa y sale de la rutina
			if (!feedbackEnvioMail.OK) return res.render("CMP-0Estructura", {informacion: feedbackEnvioMail.informacion});

			// Agrega el usuario
			await BD_genericas.agregaRegistro("usuarios", {
				contrasena,
				fechaContrasena: ahora,
				email,
				statusRegistro_id: statusRegistrosUs.find((n) => n.mail_a_validar).id,
			});
			// Guarda el mail en 'session'
			req.session.usuario = {email};
			// Datos para la vista
			let informacion = procesos.cartelAltaExitosa;
			// Redireccionar
			return res.render("CMP-0Estructura", {informacion});
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
			let dataEntry = req.session.dataEntry ? req.session.dataEntry : req.session.usuario;
			let avatar = usuario.avatar
				? "/imagenes/1-Usuarios/Avatar/" + usuario.avatar
				: "/imagenes/0-Base/Avatar/Usuario-Generico.jpg";
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
			// Averigua si hay errores de validación
			let datos = {...req.body};
			if (req.file) {
				datos.tamano = req.file.size;
				datos.avatar = req.file.filename;
			}
			// Averigua si hay errores de validación
			let errores = await valida.editables(datos);
			if (errores.hay) {
				if (req.file) comp.gestionArchivos.elimina(req.file.destination, req.file.filename);
				req.session.dataEntry = req.body; // No guarda el avatar
				req.session.errores = errores;
				return res.redirect("/usuarios/garantiza-login-y-completo");
			}
			if (req.file) {
				// Elimina el archivo 'avatar' anterior
				if (usuario.avatar) comp.gestionArchivos.elimina(req.file.destination, usuario.avatar);
				// Agrega el campo 'avatar' a los datos
				req.body.avatar = req.file.filename;
			}
			// Agrega la fecha en la que se completa el alta del usuario
			req.body.completadoEn = comp.fechaHora.ahora();
			// Actualiza el usuario
			await procesos.actualizaElStatusDelUsuario(usuario, "editables", req.body);
			req.session.usuario = await BD_especificas.obtieneUsuarioPorMail(usuario.email);
			// Mueve el archivo a la carpeta definitiva
			if (req.file) comp.gestionArchivos.mueveImagen(req.file.filename, "9-Provisorio", "1-Usuarios/Avatar");
			// Redirecciona
			return res.redirect("/usuarios/bienvenido");
		},
		bienvenido: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let informacion = {
				mensajes: [
					"Estimad" + usuario.sexo.letra_final + " " + usuario.apodo + ", completaste el alta satisfactoriamente.",
					"Bienvenid" + usuario.sexo.letra_final + " a nuestro sitio como usuario.",
				],
				iconos: [variables.vistaEntendido(req.session.urlFueraDeUsuarios)],
				titulo: "Bienvenido/a a la familia ELC",
				check: true,
			};
			// Fin
			return res.render("CMP-0Estructura", {informacion});
		},
	},
	identidad: {
		form: async (req, res) => {
			// Variables
			const tema = "usuario";
			const codigo = "identidad";
			let usuario = req.session.usuario;
			// Genera la info para la vista
			let errores = req.session.errores ? req.session.errores : false;
			let dataEntry = req.session.dataEntry ? req.session.dataEntry : usuario;
			// Roles de Iglesia
			let roles_iglesia = await BD_genericas.obtieneTodosPorCondicion("roles_iglesia", {usuario: true});
			roles_iglesia = roles_iglesia.filter((n) => n.id.length == 3 && n.id.slice(-1) == usuario.sexo_id);
			roles_iglesia.sort((a, b) => (a.orden < b.orden ? -1 : a.orden > b.orden ? 1 : 0));
			// Avatar
			let avatar = usuario.documAvatar
				? "/imagenes/1-Usuarios/DNI-Revisar/" + usuario.documAvatar
				: "/imagenes/0-Base/Avatar/DNI-Generico.jpg";
			// Crear la carpeta si no existe
			const ruta = "./publico/imagenes/9-Provisorio";
			if (!fs.existsSync(ruta)) fs.mkdirSync(ruta);
			// Va a la vista
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Solicitar la Validación de Identidad",
				dataEntry,
				errores,
				hablaHispana,
				hablaNoHispana,
				roles_iglesia,
				avatar,
				urlSalir: req.session.urlSinLogin,
			});
		},
		guardar: async (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			// Obtiene los datos
			let datos = {
				...req.body,
				documAvatar: req.file ? req.file.filename : usuario.documAvatar,
				id: usuario.id,
			};
			if (req.file) datos.tamano = req.file.size;
			datos.ruta = req.file ? "./publico/imagenes/9-Provisorio/" : "./publico/imagenes/1-Usuarios/DNI-Revisar/";
			// Averigua si hay errores de validación
			let errores = await valida.identidadBE(datos);
			// Redirecciona si hubo algún error de validación
			if (errores.hay) {
				if (req.file) comp.gestionArchivos.elimina(req.file.destination, req.file.filename);
				req.session.dataEntry = req.body; // No guarda el documAvatar
				req.session.errores = errores;
				return res.redirect("/usuarios/identidad");
			}
			if (req.file) {
				// Elimina el archivo 'documAvatar' anterior
				if (usuario.documAvatar)
					comp.gestionArchivos.elimina("./publico/imagenes/1-Usuarios/DNI-Revisar/", usuario.documAvatar);
				// Agrega el campo 'documAvatar' a los datos
				req.body.documAvatar = req.file.filename;
			}
			// Prepara la información a actualizar
			req.body.fechaRevisores = comp.fechaHora.ahora();
			// Actualiza el usuario
			req.session.usuario = await procesos.actualizaElStatusDelUsuario(usuario, "ident_a_validar", req.body);
			// Mueve el archivo a la carpeta definitiva
			if (req.file) comp.gestionArchivos.mueveImagen(req.file.filename, "9-Provisorio", "1-Usuarios/DNI-Revisar");
			// Redirecciona
			return res.redirect("/usuarios/validacion-en-proceso");
		},
		enProceso: (req, res) => {
			// Variables
			let usuario = req.session.usuario;
			let letra = usuario.sexo_id == "M" ? "a " : "o ";
			let informacion = {
				mensajes: [
					"Estimad" + letra + usuario.apodo + ", gracias por completar tus datos.",
					"Ahora, queda a cargo del equipo de Revisores la tarea de revisarlos.",
					"Luego de la revisión, recibirás un mail de feedback.",
					"En caso de estar aprobado, podrás ingresar información.",
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
			let dataEntry;

			// 2. Obtiene el Data Entry procesado en 'loginGuardar'
			if (req.session.email || req.session.contrasena) {
				dataEntry = {email: req.session.email, contrasena: req.session.contrasena};
				delete req.session.email, req.session.contrasena;
			}

			// 3. Variables para la vista
			let errores = dataEntry ? await valida.login(dataEntry) : "";
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

			// Si corresponde, le cambia el status a 'mail_validado'
			if (usuario.statusRegistro.mail_a_validar)
				usuario = await procesos.actualizaElStatusDelUsuario(usuario, "mail_validado");

			// Inicia la sesión del usuario
			req.session.usuario = usuario;

			// 7. Guarda el mail en cookies
			res.cookie("email", req.body.email, {maxAge: unDia});

			// 8. Notifica al contador de logins
			if (usuario.pais_id) procesos.actualizaElContadorDeLogins(usuario);

			// 9. Redireccionar
			return res.redirect("/usuarios/garantiza-login-y-completo");
		},
	},
	olvidoContr: async (req, res) => {
		// Variables
		let dataEntry = req.body;
		let usuario, informacion;

		// Averigua si hay errores 'superficiales' de validación
		let errores = await valida.altaMail(dataEntry.email);

		// Si no hay errores 'superficiales', verifica otros más 'profundos'
		if (!errores.hay) [errores, informacion, usuario] = await valida.olvidoContrBE(dataEntry, req);

		// Redirecciona si hubo algún error de validación
		if (errores.hay) {
			req.session.dataEntry = req.body;
			req.session.erroresOC = errores;
			return res.redirect(req.originalUrl);
		}

		// Interrumpe si hay un mensaje con información
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Si todo anduvo bien...
		// Envía la contraseña por mail
		let {ahora, contrasena, feedbackEnvioMail} = await procesos.enviaMailConContrasena(req);
		// Si el mail no pudo ser enviado, lo avisa y sale de la rutina
		if (!feedbackEnvioMail.OK) return res.render("CMP-0Estructura", {informacion: feedbackEnvioMail.informacion});
		// Actualiza la contraseña en la BD
		await BD_genericas.actualizaPorId("usuarios", usuario.id, {
			contrasena,
			fechaContrasena: ahora,
		});
		// Guarda el mail en 'session'
		req.session.email = req.body.email;
		// Borra los errores
		req.session.errores = "";
		// Datos para la vista
		informacion = procesos.cartelNuevaContrasena;
		// Redireccionar
		return res.render("CMP-0Estructura", {informacion});
	},
	logout: (req, res) => {
		// Borra los datos del usuario, de session y cookie
		delete req.session.usuario;
		res.clearCookie("email");

		// Fin
		return res.redirect("/usuarios/login");
	},
};
