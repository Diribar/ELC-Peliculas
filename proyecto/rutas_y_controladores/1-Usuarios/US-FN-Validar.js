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
			: (await BD_genericas.obtienePorCondicion("usuarios", {email}))
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
			// Si el usuario tiene status 'perenne_id', valida sus demás datos
			else if (usuario.statusRegistro_id == perennes_id) {
				let {paisNacim_id} = this.perennes(datos);
				errores = {paisNacim_id};

				// Obtiene el consolidado
				errores.credenciales = errores.paisNacim_id ? "Algún dato no coincide con el de nuestra base de datos" : "";
			}
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	perennes: (datos) => {
		let errores = {
			paisNacim_id: !datos.paisNacim_id
				? "Necesitamos que elijas un país"
				: datos.paisNacim_id != datos.usuario.paisNacim_id
				? "El país no coincide con el de nuestra base de datos"
				: "",
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
	perennesFE: (datos) => {
		// Variables
		let errores = {};
		let campos = Object.keys(datos);

		// Validaciones
		if (campos.includes("nombre")) {
			// Variables
			let respuesta = "";
			let dato = datos.nombre;

			// Validaciones
			if (!dato) respuesta = variables.inputVacio;
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
			if (!dato) respuesta = variables.inputVacio;
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
		if (campos.includes("paisNacim_id")) errores.paisNacim_id = !datos.paisNacim_id ? variables.selectVacio : "";

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	perenneBE: async function (datos) {
		// Averigua los errores
		const campos = ["nombre", "apellido", "fechaNacim", "paisNacim_id"];
		for (let campo of campos) if (!datos[campo]) datos[campo] = "";
		let errores = await this.perennesFE(datos);

		// Acciones si no hay errores
		if (!errores.hay) {
			// Variables
			let condicion = {};
			for (let campo of campos) condicion[campo] = datos[campo];

			// Verifica que el usuario no exista ya en la base de datos
			let averigua = await BD_genericas.obtienePorCondicion("usuarios", condicion);
			if (averigua && averigua.id != datos.id) errores.perennes = true;

			// Resumen
			errores.hay = !!errores.perennes;
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
