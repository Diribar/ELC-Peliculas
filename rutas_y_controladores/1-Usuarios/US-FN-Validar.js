"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");

module.exports = {
	formatoMail: (email) => {
		// Variables
		let errores = {email: !email ? cartelMailVacio : formatoMail(email) ? cartelMailFormato : ""};
		
		// Fin
		errores.hay = !!errores.email;
		return errores;
	},
	mailRepetido: async function (email) {
		// Variables
		const mensaje = this.formatoMail(email).email;
		let errores = {};

		// Validaciones
		errores.email = mensaje
			? mensaje
			: (await BD_especificas.obtieneELC_id("usuarios", {email}))
			? "Esta dirección de email ya figura en nuestra base de datos"
			: "";

		// Fin
		errores.hay = !!errores.email;
		return errores;
	},
	olvidoContr: async (datos) => {
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
	olvidoContrBE: async (datos, req) => {
		// Variables
		let errores = {}; // Necesitamos que sea un objeto
		let informacion;

		// Obtiene el usuario
		const usuario = await BD_genericas.obtienePorCondicionConInclude("usuarios", {email: datos.email}, "statusRegistro");

		// Verifica si el usuario existe en la BD
		if (!usuario) errores = {email: "Esta dirección de email no figura en nuestra base de datos."};
		else {
			// Detecta si ya se envió un mail en las últimas 24hs
			let ahora = comp.fechaHora.ahora();
			let fechaContr = usuario.fechaContrasena;
			let diferencia = (ahora.getTime() - fechaContr.getTime()) / unaHora;
			if (diferencia < 24) {
				let fechaContrHorario = comp.fechaHora.fechaHorario(usuario.fechaContrasena);
				informacion = {
					mensajes: [
						"Ya enviamos un mail con la contraseña el día " + fechaContrHorario + ".",
						"Para evitar 'spam', esperamos 24hs antes de enviar una nueva contraseña.",
					],
					iconos: [variables.vistaEntendido(req.session.urlSinLogin)],
				};
			}

			// Si el usuario ingresó un n° de documento, lo verifica antes de generar un nueva contraseña
			else if (usuario.statusRegistro.identPendValidar || usuario.statusRegistro.identValidada) {
				// Verifica los posibles errores
				errores.documNumero = !datos.documNumero
					? variables.inputVacio
					: datos.documNumero != usuario.documNumero
					? "El número de documento no coincide con el de nuestra Base de Datos"
					: "";
				errores.documPais_id = !datos.documPais_id
					? variables.selectVacio
					: datos.documPais_id != usuario.documPais_id
					? "El país no coincide con el de nuestra Base de Datos"
					: "";
				errores.documento = !!errores.documNumero || !!errores.documPais_id;
			}
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return [errores, informacion, usuario];
	},
	documento: (datos) => {
		let formatoDocumNumero = /^[a-z\d]+$/i;

		let errores = {
			documNumero: !datos.documNumero
				? "Necesitamos que completes este campo"
				: !formatoDocumNumero.test(datos.documNumero)
				? "Sólo se admiten letras del abecedario inglés"
				: "",
			documPais_id: !datos.documPais_id ? "Necesitamos que elijas un país" : "",
		};

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	login: async function (datos) {
		// Variables
		const {email, contrasena} = datos;
		const largoContr = contrasena ? largoContrasena(contrasena) : null;
		let errores = {};

		// Verifica errores
		errores.email = this.formatoMail(email).email;
		errores.contrasena = !contrasena ? cartelContrasenaVacia : largoContr ? largoContr : "";
		errores.hay = Object.values(errores).some((n) => !!n);

		// Verifica credenciales
		if (!errores.hay) {
			let usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
			// Credenciales Inválidas: si el usuario no existe o la contraseña no es válida
			errores.credenciales = !usuario || !bcryptjs.compareSync(datos.contrasena, usuario.contrasena);
			errores.hay = !!errores.credenciales;
		}

		// Fin
		return errores;
	},
	editables: (datos) => {
		// Variables
		let errores = {};
		let campos = Object.keys(datos);

		// Validaciones
		if (campos.includes("apodo")) {
			let dato = datos.apodo;
			let respuesta = "";
			if (dato) {
				if (!respuesta) respuesta = comp.validacs.castellano.basico(dato);
				if (!respuesta) respuesta = comp.validacs.inicial.basico(dato);
				if (!respuesta) respuesta = comp.validacs.longitud(dato, 2, 30);
			} else respuesta = variables.inputVacio;

			// Fin
			errores.apodo = respuesta;
		}
		if (campos.includes("sexo_id")) errores.sexo_id = !datos.sexo_id ? variables.selectVacio : "";
		if (campos.includes("pais_id")) errores.pais_id = !datos.pais_id ? variables.selectVacio : "";
		if (campos.includes("avatar")) errores.avatar = comp.validacs.avatar(datos);

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	identidadFE: (datos) => {
		// Variables
		let errores = {};
		let campos = Object.keys(datos);
		// Validaciones
		if (campos.includes("nombre")) {
			// Variables
			let respuesta = "";
			let dato = datos.nombre;
			// Validaciones
			if (dato) {
				if (!respuesta) respuesta = comp.validacs.castellano.basico(dato);
				if (!respuesta) respuesta = comp.validacs.inicial.basico(dato);
				if (!respuesta) respuesta = comp.validacs.longitud(dato, 2, 30);
			} else respuesta = variables.inputVacio;
			// Fin
			errores.nombre = respuesta;
		}
		if (campos.includes("apellido")) {
			// Variables
			let respuesta = "";
			let dato = datos.apellido;
			// Validaciones
			if (dato) {
				if (!respuesta) respuesta = comp.validacs.castellano.basico(dato);
				if (!respuesta) respuesta = comp.validacs.inicial.basico(dato);
				if (!respuesta) comp.validacs.longitud(dato, 2, 30);
			} else respuesta = variables.inputVacio;
			// Fin
			errores.apellido = respuesta;
		}
		if (campos.includes("fechaNacim"))
			errores.fechaNacim = !datos.fechaNacim
				? "Necesitamos que ingreses la fecha"
				: fechaRazonable(datos.fechaNacim)
				? "¿Estás seguro de que introdujiste la fecha correcta?"
				: "";
		if (campos.includes("rolIglesia_id")) errores.rolIglesia_id = !datos.rolIglesia_id ? variables.selectVacio : "";
		// Revisar 'documNumero'
		if (campos.includes("documNumero")) {
			// Variables
			let dato = datos.documNumero;
			let respuesta = "";
			// Validaciones
			if (dato) respuesta = comp.validacs.longitud(dato, 4, 15);
			else respuesta = variables.inputVacio;
			// Fin
			errores.documNumero = respuesta;
		}
		// Revisar 'documPais_id'
		if (campos.includes("documPais_id")) errores.documPais_id = !datos.documPais_id ? variables.selectVacio : "";
		// Revisar 'avatar'
		if (campos.includes("avatar") || campos.includes("documAvatar")) errores.avatar = comp.validacs.avatar(datos);
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	identidadBE: async function (datos) {
		// Averigua los errores
		let errores = await this.documentoFE(datos);
		// Acciones si no hay errores
		if (!errores.hay) {
			// 1. Verifica que el documento no exista ya en la Base de Datos
			let documNumero = datos.documNumero;
			let documPais_id = datos.documPais_id;
			let averigua = await BD_genericas.obtienePorCondicion("usuarios", {documNumero, documPais_id});
			if (averigua && averigua.id != datos.id) errores.credenciales = true;

			// 2. Verifica el documAvatar
			errores.documAvatar =
				// Que tenga nombre
				!datos.documAvatar
					? "Necesitamos que ingreses una imagen de tu documento. La usaremos para verificar tus datos."
					: // Que exista el archivo
					!comp.gestionArchivos.existe(datos.ruta + datos.documAvatar)
					? "El archivo de imagen no existe"
					: "";

			// 3. Resumen
			if (errores.credenciales || errores.documAvatar) errores.hay = true;
		}
		// Fin
		return errores;
	},
};

// Variables y Funciones
let cartelMailVacio = "Necesitamos que escribas un correo electrónico";
let cartelMailFormato = "Debes escribir un formato de correo válido";
let cartelContrasenaVacia = "Necesitamos que escribas una contraseña";
let formatoMail = (email) => {
	let formato = /^\w+([\.-_]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return !formato.test(email);
};
let largoContrasena = (dato) => {
	return dato.length < 6 || dato.length > 12 ? "La contraseña debe tener de 6 a 12 caracteres" : "";
};
let fechaRazonable = (dato) => {
	// Verificar que la fecha sea razonable
	let fecha = new Date(dato);
	let max = comp.fechaHora.ahora();
	let min = comp.fechaHora.ahora();
	max.setFullYear(max.getFullYear() - 5);
	min.setFullYear(min.getFullYear() - 100);
	return fecha > max || fecha < min ? true : false;
};
