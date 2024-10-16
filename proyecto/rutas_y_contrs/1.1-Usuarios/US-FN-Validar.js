"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");
const procesos = require("./US-FN-Procesos");

module.exports = {
	formatoMail: (email) => formatoMail(email),
	altaMail: async function (email) {
		// Variables
		let errores = formatoMail(email);

		// Se fija si el mail ya existe
		if (!errores.email && (await baseDeDatos.obtienePorCondicion("usuarios", {email}))) {
			errores.credenciales = "Esta dirección de email ya figura en nuestra base de datos";
			errores.hay = !!errores.credenciales;
		}

		// Fin
		return errores;
	},
	olvidoContr: {
		email: async function (email) {
			// 1. Mail - Averigua si hay errores básicos
			let errores = formatoMail(email);
			if (errores.hay) return {errores};

			// 2. Mail - Verifica si no existe en la BD
			const usuario = await comp.obtieneUsuarioPorMail(email);
			if (!usuario) return {errores: {email: "Esta dirección de email no figura en nuestra base de datos.", hay: true}};

			// 3. Mail - Detecta si ya se le envió una contraseña en las últimas 24hs
			const ahora = comp.fechaHora.ahora();
			const fechaContrasena = usuario.fechaContrasena
				? usuario.fechaContrasena
				: new Date(ahora.getTime() - 24 * unaHora - 1);
			const diferencia = (ahora.getTime() - fechaContrasena.getTime()) / unaHora;
			if (diferencia < 24)
				return {
					errores: {
						email:
							"Ya enviamos un mail con la contraseña el día " +
							comp.fechaHora.fechaHorario(usuario.fechaContrasena) +
							". Para evitar 'spam', esperamos 24hs antes de enviar una nueva contraseña.",
						hay: true,
					},
					usuario,
				};

			// Fin
			errores.hay = false;
			return {errores, usuario};
		},
		datosPer: async (datos) => {
			// 1. Revisa si los datos tienen la info de los campos perennes
			const campos = Object.keys(datos);
			for (let campo of camposPerennes) if (!campos.includes(campo)) return {faltanCampos: true, hay: true};

			// 2. Revisa el formato superficial de los valores
			let errores = perennesFE(datos);
			if (errores.hay) return errores;

			// 3. Revisa las credenciales
			const {email} = datos;
			const usuario = await baseDeDatos.obtienePorCondicion("usuarios", {email});
			errores.credenciales = !camposPerennes.every((n) => usuario[n] == datos[n]); // si algún campo no coincide, es 'true'
			errores.hay = errores.credenciales;
			return errores;
		},
	},
	login: async (datos) => {
		// Variables
		const {email, contrasena} = datos;
		let usuario;

		// Verifica errores
		let errores = formatoMail(email);
		errores.contrasena = !contrasena ? contrasenaVacia : largoContr(contrasena) ? largoContr(contrasena) : "";
		errores.hay = Object.values(errores).some((n) => !!n);

		// Sólo si no hay algún error previo, revisa las credenciales
		if (!errores.hay) {
			// Obtiene el usuario
			usuario = await comp.obtieneUsuarioPorMail(email);

			// Termina si se superó la cantidad de intentos fallidos tolerados
			if (usuario && usuario.intentosLogin >= maxIntentosBD) return {errores: {hay: true}, usuario}; // hace falta el usuario para que le llegue al middleware

			// Valida el mail y la contraseña
			errores.email_BD = !usuario;
			errores.contr_BD = usuario && !bcryptjs.compareSync(datos.contrasena, usuario.contrasena);

			// Valida las credenciales
			errores.credenciales = errores.email_BD || errores.contr_BD;
			errores.hay = errores.credenciales;
		}

		// Fin
		return {errores, usuario};
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
			} else respuesta = inputVacio;

			// Fin
			errores.apodo = respuesta;
		}
		if (campos.includes("genero_id")) errores.genero_id = !datos.genero_id ? selectVacio : "";
		if (campos.includes("pais_id")) errores.pais_id = !datos.pais_id ? selectVacio : "";
		if (campos.includes("avatar")) errores.avatar = comp.validacs.avatar(datos);

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	perennesFE: (datos) => perennesFE(datos),
	perennesBE: async (datos) => perennesBE(datos),
};

// Variables y Funciones
const mailVacio = "Necesitamos que escribas un correo electrónico";
const mailFormato = "Debes escribir un formato de correo válido";
const contrasenaVacia = "Necesitamos que escribas una contraseña";
const camposPerennes = ["nombre", "apellido", "fechaNacim", "paisNacim_id"];

// Funciones
let formatoMail = (email) => {
	// Variables
	const formato = /^\w+([\.-_]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	const errorMail = !email ? mailVacio : !formato.test(email) ? mailFormato : "";

	// Variable error
	let errores = {email: errorMail};
	errores.hay = !!errores.email;

	// Fin
	return errores;
};
let perennesFE = (datos) => {
	// Variables
	let errores = {};
	let campos = Object.keys(datos);

	// Funciones
	let fechaRazonable = (dato) => {
		// Verificar que la fecha sea razonable
		let fecha = new Date(dato);
		let max = comp.fechaHora.ahora();
		let min = comp.fechaHora.ahora();
		max.setFullYear(max.getFullYear() - 5);
		min.setFullYear(min.getFullYear() - 100);
		return fecha > max || fecha < min ? true : false;
	};

	// Validaciones
	if (campos.includes("nombre")) {
		// Variables
		let respuesta = "";
		let dato = datos.nombre;

		// Validaciones
		if (!dato) respuesta = inputVacio;
		if (!respuesta) respuesta = comp.validacs.castellano.basico(dato);
		if (!respuesta) respuesta = comp.validacs.inicial.basico(dato);
		if (!respuesta) respuesta = comp.validacs.longitud(dato, 2, 30);

		// Fin
		errores.nombre = respuesta;
	}
	if (campos.includes("apellido")) {
		// Variables
		let respuesta = "";
		let dato = datos.apellido;

		// Validaciones
		if (!dato) respuesta = inputVacio;
		if (!respuesta) respuesta = comp.validacs.castellano.basico(dato);
		if (!respuesta) respuesta = comp.validacs.inicial.basico(dato);
		if (!respuesta) comp.validacs.longitud(dato, 2, 30);

		// Fin
		errores.apellido = respuesta;
	}
	if (campos.includes("fechaNacim"))
		errores.fechaNacim = !datos.fechaNacim
			? "Necesitamos que ingreses la fecha"
			: fechaRazonable(datos.fechaNacim)
			? "¿Estás seguro de que introdujiste la fecha correcta?"
			: "";
	if (campos.includes("paisNacim_id")) errores.paisNacim_id = !datos.paisNacim_id ? "Necesitamos que elijas un país" : "";

	// Fin
	errores.hay = Object.values(errores).some((n) => !!n);
	return errores;
};
let perennesBE = async (datos) => {
	// Averigua los errores
	for (let campo of camposPerennes) if (!datos[campo]) datos[campo] = "";
	let errores = await perennesFE(datos);

	// Averigua si ya existe un usuario con esas credenciales
	if (!errores.hay) {
		// Variables
		let condicion = {};
		for (let campo of camposPerennes) condicion[campo] = datos[campo];

		// Averigua si el usuario existe en la base de datos
		errores.credenciales = !!(await baseDeDatos.obtienePorCondicion("usuarios", condicion))
			? procesos.comentarios.credsInvalidas.datosPer
			: "";
		errores.hay = !!errores.credenciales;
	}

	// Fin
	return errores;
};
let largoContr = (contrasena) => {
	return contrasena && (contrasena.length < 6 || contrasena.length > 12)
		? "La contraseña debe tener entre 6 y 12 caracteres"
		: "";
};
