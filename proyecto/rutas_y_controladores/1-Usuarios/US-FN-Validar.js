"use strict";
// Definir variables
const bcryptjs = require("bcryptjs");

module.exports = {
	formatoMail: (email) => formatoMail(email),
	altaMail: async function (email) {
		// Variables
		let errores = formatoMail(email);

		// Se fija si el mail ya existe
		if (!errores.email && (await BD_genericas.obtienePorCondicion("usuarios", {email})))
			errores.email = "Esta dirección de email ya figura en nuestra base de datos";

		// Fin
		errores.hay = !!errores.email;
		return errores;
	},
	olvidoContrasena: async function (datos) {
		// 1. Averigua si hay errores básicos de email
		const {email} = datos;
		let errores = formatoMail(email);
		if (errores.hay) return errores;

		// 2. Verifica si el mail existe en la BD
		const usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
		if (!usuario) return {email: "Esta dirección de email no figura en nuestra base de datos.", hay: true};

		// 3. Detecta si ya se le envió un mail en las últimas 24hs
		const ahora = comp.fechaHora.ahora();
		const fechaContrasena = usuario.fechaContrasena;
		const diferencia = (ahora.getTime() - fechaContrasena.getTime()) / unaHora;
		if (diferencia < 24)
			return {
				email:
					"Ya enviamos un mail con la contraseña el día " +
					comp.fechaHora.fechaHorario(usuario.fechaContrasena) +
					". Para evitar 'spam', esperamos 24hs antes de enviar una nueva contraseña.",
				hay: true,
			};

		// 4. Si el usuario tiene status 'perenne_id', valida sus demás datos
		if (usuario.statusRegistro_id == perennes_id) {
			// 4.A Si fija si los datos tienen la info de los campos perennes
			const campos = Object.keys(datos);
			for (let campo of camposPerennes) if (!campos.includes(campo)) errores.faltanCampos = true;
			if (errores.faltanCampos) return {...errores, hay: true};

			// 4.B Se fija si el usuario existe en la BD
			let condicion = {};
			for (let campo of ["email", ...camposPerennes]) condicion[campo] = datos[campo];
			const usuario = await BD_genericas.obtienePorCondicion("usuarios", condicion);
			if (!usuario) return {credenciales: "Algún dato no coincide con el de nuestra base de datos", hay: true};
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	login: async function (datos) {
		// Variables
		const {email, contrasena} = datos;
		const largoContr = contrasena ? largoContrasena(contrasena) : null;

		// Verifica errores
		let errores = this.formatoMail(email);
		errores.contrasena = !contrasena ? cartelContrasenaVacia : largoContr ? largoContr : "";
		errores.hay = Object.values(errores).some((n) => !!n);

		// Verifica credenciales
		if (!errores.hay) {
			const usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
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
	perennesFE: (datos) => perennesFE(datos),
	perennesBE: async (datos) => perennesBE(datos),
};

// Variables y Funciones
const cartelMailVacio = "Necesitamos que escribas un correo electrónico";
const cartelMailFormato = "Debes escribir un formato de correo válido";
const cartelContrasenaVacia = "Necesitamos que escribas una contraseña";
const camposPerennes = ["nombre", "apellido", "fechaNacim", "paisNacim_id"];

// Funciones
let formatoMail = (email) => {
	// Variables
	const formato = /^\w+([\.-_]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	const errorMail = !email ? cartelMailVacio : !formato.test(email) ? cartelMailFormato : "";

	// Variable error
	let errores = {email: errorMail};
	errores.hay = !!errores.email;

	// Fin
	return errores;
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
let perennesFE = (datos) => {
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
	if (campos.includes("paisNacim_id")) errores.paisNacim_id = !datos.paisNacim_id ? "Necesitamos que elijas un país" : "";

	// Fin
	errores.hay = Object.values(errores).some((n) => !!n);
	return errores;
};
let perennesBE = async (datos) => {
	// Averigua los errores
	for (let campo of camposPerennes) if (!datos[campo]) datos[campo] = "";
	let errores = await perennesFE(datos);

	// Averigua si ya existe un usuario con esa credenciales
	if (!errores.hay) {
		// Variables
		let condicion = {};
		for (let campo of camposPerennes) condicion[campo] = datos[campo];

		// Averigua si el usuario existe en la base de datos
		errores.usuarioExiste = !!(await BD_genericas.obtienePorCondicion("usuarios", condicion));
		errores.hay = errores.usuarioExiste;
	}
	// Fin
	return errores;
};
