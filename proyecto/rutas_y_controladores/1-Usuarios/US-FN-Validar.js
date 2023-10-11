"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const procesos = require("./US-FN-Procesos");

module.exports = {
	formatoMail: (email) => {
		// Variables
		const errores = {email: !email ? cartelMailVacio : formatoMail(email) ? cartelMailFormato : ""};

		// Fin
		return errores.email;
	},
	altaMail: async function (email) {
		// Variables
		const mensaje = this.formatoMail(email);
		let errores = {};

		// Validaciones
		errores.email = mensaje
			? mensaje
			: (await procesos.usuarioDelMail(email))
			? "Esta dirección de email ya figura en nuestra base de datos"
			: "";

		// Fin
		errores.hay = !!errores.email;
		return errores;
	},
	olvidoContrasena: async (datos) => {
		// Variables
		const usuario = datos.usuario;
		let errores = {}; // Necesitamos que sea un objeto

		// Verifica si el usuario existe en la BD
		if (!usuario) errores = {email: "Esta dirección de email no figura en nuestra base de datos."};
		else {
			// Detecta si ya se envió un mail en las últimas 24hs
			const ahora = comp.fechaHora.ahora();
			const fechaContrasena = usuario.fechaContrasena;
			const diferencia = (ahora.getTime() - fechaContrasena.getTime()) / unaHora;
			if (diferencia < 24)
				errores = {
					email:
						"Ya enviamos un mail con la contraseña el día " +
						comp.fechaHora.fechaHorario(usuario.fechaContrasena) +
						". Para evitar 'spam', esperamos 24hs antes de enviar una nueva contraseña.",
				};
			// Si el usuario debe ingresar un n° de documento, lo valida
			else if (usuario.statusRegistro_id == stIdentPendValidar_id || usuario.statusRegistro_id == stIdentValidada_id) {
				let {documNumero, documPais_id} = this.documento(datos);
				errores = {documNumero, documPais_id};

				// Si ninguno está vacío, valida si alguno tiene un desvío
				if (
					!errores.documNumero &&
					!errores.documPais_id &&
					(datos.documNumero != usuario.documNumero || datos.documPais_id != usuario.documPais_id)
				) {
					errores.documNumero = "El número de documento y/o el país, no coinciden con el de nuestra Base de Datos";
					errores.documPais_id = errores.documNumero;
				}

				// Obtiene el consolidado
				errores.documento = !!errores.documNumero || !!errores.documPais_id;
			}
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	documento: (datos) => {
		let formatoDocumNumero = /^[\d]+$/;

		let errores = {
			documNumero: !datos.documNumero
				? variables.inputVacio
				: !formatoDocumNumero.test(datos.documNumero)
				? "Sólo se admiten números"
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
		errores.email = this.formatoMail(email);
		errores.contrasena = !contrasena ? cartelContrasenaVacia : largoContr ? largoContr : "";
		errores.hay = Object.values(errores).some((n) => !!n);

		// Verifica credenciales
		if (!errores.hay) {
			let usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
			errores.credenciales =
				!usuario || // credenciales inválidas si el usuario no existe
				!bcryptjs.compareSync(datos.contrasena, usuario.contrasena); // credenciales inválidas si la contraseña no es válida
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
		let errores = await this.identidadFE(datos);
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
