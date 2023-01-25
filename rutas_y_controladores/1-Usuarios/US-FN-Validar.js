"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	altaMail: async (email) => {
		let errores = {};
		errores.email = !email ? cartelMailVacio : formatoMail(email) ? cartelMailFormato : "";
		errores.hay = !!errores.email;
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
				if (!respuesta) respuesta = comp.castellano.basico(dato);
				if (!respuesta) respuesta = comp.inicial.basico(dato);
				if (!respuesta) respuesta = comp.longitud(dato, 2, 30);
			} else respuesta = comp.inputVacio;
			// Fin
			errores.apodo = respuesta;
		}
		if (campos.includes("sexo_id")) errores.sexo_id = !datos.sexo_id ? comp.selectVacio : "";
		if (campos.includes("pais_id")) errores.pais_id = !datos.pais_id ? comp.selectVacio : "";
		if (campos.includes("avatar")) errores.avatar = comp.avatar(datos);
		errores.hay = Object.values(errores).some((n) => !!n);
		// Fin
		return errores;
	},
	documentoFE: (datos) => {
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
				if (!respuesta) respuesta = comp.castellano.basico(dato);
				if (!respuesta) respuesta = comp.inicial.basico(dato);
				if (!respuesta) respuesta = comp.longitud(dato, 2, 30);
			} else respuesta = comp.inputVacio;
			// Fin
			errores.nombre = respuesta;
		}
		if (campos.includes("apellido")) {
			// Variables
			let respuesta = "";
			let dato = datos.apellido;
			// Validaciones
			if (dato) {
				if (!respuesta) respuesta = comp.castellano.basico(dato);
				if (!respuesta) respuesta = comp.inicial.basico(dato);
				if (!respuesta) comp.longitud(dato, 2, 30);
			} else respuesta = comp.inputVacio;
			// Fin
			errores.apellido = respuesta;
		}
		if (campos.includes("fecha_nacimiento"))
			errores.fecha_nacimiento = !datos.fecha_nacimiento
				? "Necesitamos que ingreses la fecha"
				: fechaRazonable(datos.fecha_nacimiento)
				? "¿Estás seguro de que introdujiste la fecha correcta?"
				: "";
		if (campos.includes("rol_iglesia_id"))
			errores.rol_iglesia_id = !datos.rol_iglesia_id ? comp.selectVacio : "";
		// Revisar 'docum_numero'
		if (campos.includes("docum_numero")) {
			// Variables
			let dato = datos.docum_numero;
			let respuesta = "";
			// Validaciones
			if (dato) respuesta = comp.longitud(dato, 4, 15);
			else respuesta = comp.inputVacio;
			// Fin
			errores.docum_numero = respuesta;
		}
		// Revisar 'docum_pais_id'
		if (campos.includes("docum_pais_id"))
			errores.docum_pais_id = !datos.docum_pais_id ? comp.selectVacio : "";
		// Revisar 'avatar'
		if (campos.includes("avatar") || campos.includes("docum_avatar")) errores.avatar = comp.avatar(datos);
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	documentoBE: async function (datos) {
		// Averigua los errores
		let errores = await this.documentoFE(datos);
		// Acciones si no hay errores
		if (!errores.hay) {
			// 1. Verifica que el documento no exista ya en la Base de Datos
			let docum_numero = datos.docum_numero;
			let docum_pais_id = datos.docum_pais_id;
			let averigua = await BD_genericas.obtienePorCampos("usuarios", {docum_numero, docum_pais_id});
			if (averigua && averigua.id != datos.id) errores.credenciales = true;

			// 2. Verifica el docum_avatar
			errores.docum_avatar =
				// Que tenga nombre
				!datos.docum_avatar
					? "Necesitamos que ingreses una imagen de tu documento. La usaremos para verificar tus datos."
					: // Que exista el archivo
					!comp.averiguaSiExisteUnArchivo(datos.ruta + datos.docum_avatar)
					? "El archivo de imagen no existe"
					: "";

			// 3. Resumen
			if (errores.credenciales || errores.docum_avatar) errores.hay = true;
		}
		// Fin
		return errores;
	},
	login: async (datos) => {
		// Variables
		let {email, contrasena} = datos;
		let errores = {},
			largoContr;
		if (contrasena) largoContr = largoContrasena(contrasena);
		// Verificar errores
		errores.email = !email ? cartelMailVacio : formatoMail(email) ? cartelMailFormato : "";
		errores.contrasena = !contrasena ? cartelContrasenaVacia : largoContr ? largoContr : "";
		errores.hay = Object.values(errores).some((n) => !!n);
		// Verifica credenciales
		if (!errores.hay) {
			let usuario = await BD_genericas.obtienePorCampos("usuarios", {email});
			// Credenciales Inválidas: si el usuario no existe o la contraseña no es válida
			errores.credenciales = !usuario || !bcryptjs.compareSync(datos.contrasena, usuario.contrasena);
			errores.hay = errores.credenciales;
		}

		// Fin
		return errores;
	},
	olvidoContrBE: async (datos,req) => {
		// Variables
		let errores = {};
		let informacion;
		let usuario = await BD_genericas.obtienePorCamposConInclude(
			"usuarios",
			{email: datos.email},
			"status_registro"
		);
		// Verifica si el usuario existe en la BD
		if (!usuario) errores = {email: "Esta dirección de email no figura en nuestra base de datos."};
		else {
			// Detecta si ya se envió un mail en las últimas 24hs
			let ahora = comp.ahora();
			let fechaContr = usuario.fecha_contrasena;
			let diferencia = (ahora.getTime() - fechaContr.getTime()) / unaHora;
			if (diferencia < 24) {
				let fechaContrHorario = comp.fechaHorarioTexto(usuario.fecha_contrasena);
				informacion = {
					mensajes: [
						"Ya enviamos un mail con la contraseña el día " + fechaContrHorario + ".",
						"Para evitar 'spam', esperamos 24hs antes de enviar una nueva contraseña.",
					],
					iconos: [variables.vistaEntendido(req.session.urlSinLogin)],
				};
			}
			// Si el usuario ingresó un n° de documento, lo verifica antes de generar un nueva contraseña
			else if (usuario.status_registro.ident_a_validar || usuario.status_registro.ident_validada) {
				// Verifica los posibles errores
				errores.docum_numero = !datos.docum_numero
					? comp.inputVacio
					: datos.docum_numero != usuario.docum_numero
					? "El número de documento no coincide con el de nuestra Base de Datos"
					: "";
				errores.docum_pais_id = !datos.docum_pais_id
					? comp.selectVacio
					: datos.docum_pais_id != usuario.docum_pais_id
					? "El país no coincide con el de nuestra Base de Datos"
					: "";
				errores.documento = !!errores.docum_numero || !!errores.docum_pais_id;
			}
		}
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return [errores, informacion, usuario];
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
	let max = comp.ahora();
	let min = comp.ahora();
	max.setFullYear(max.getFullYear() - 5);
	min.setFullYear(min.getFullYear() - 100);
	return fecha > max || fecha < min ? true : false;
};
