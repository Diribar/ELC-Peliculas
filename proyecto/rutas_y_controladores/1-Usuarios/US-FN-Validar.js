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
		// 1. Mail - Averigua si hay errores básicos
		const {email} = datos;
		let errores = formatoMail(email);
		if (errores.hay) return errores;

		// 2. Mail - Verifica si existe en la BD
		const usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
		if (!usuario) return {email: "Esta dirección de email no figura en nuestra base de datos.", hay: true};

		// 3. Mail - Detecta si ya se le envió una contraseña en las últimas 24hs
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

		// 4. Verifica si se superó la cantidad de intentos fallidos tolerados
		if (usuario.intsValPerenne > 2) return {email: intsValPerenne, intsValPerenne, hay: true};

		// 5. Datos Perennes - Si el usuario tiene status 'perenne_id', valida sus demás datos
		if (usuario.statusRegistro_id == perennes_id) {
			// 5.A Se fija si los datos tienen la info de los campos perennes
			const campos = Object.keys(datos);
			for (let campo of camposPerennes) if (!campos.includes(campo)) return {faltanCampos: true, hay: true};

			// 5.B Revisa el formato superficial de los valores
			errores = perennesFE(datos);
			if (errores.hay) return errores;

			// 5.C Revisa las credenciales
			for (let campo of camposPerennes) if (!errores.credenciales) errores.credenciales = usuario[campo] != datos[campo];
			errores.credenciales = errores.credenciales
				? usuarioInexistente + "<br>Intento " + (usuario.intsValPerenne + 1) + " de 3."
				: ""; // convierte el error en una frase
			if (errores.credenciales) {
				// Aumenta la cantidad de intentos para validar los datos perennes
				BD_genericas.aumentaElValorDeUnCampo("usuarios", usuario.id, "intsValPerenne");
				usuario.intsValPerenne++;

				// Verifica nuevamente si se superó la cantidad de intentos fallidos tolerados
				if (usuario.intsValPerenne > 2) errores = {...errores, email: intsValPerenne, intsValPerenne};
			}
		}

		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	login: async function (datos) {
		// Variables
		const {email, contrasena} = datos;
		const largoContr = contrasena
			? contrasena.length < 6 || contrasena.length > 12
				? "La contraseña debe tener entre 6 y 12 caracteres"
				: ""
			: null;

		// Verifica errores
		let errores = this.formatoMail(email);
		errores.contrasena = !contrasena ? cartelContrasenaVacia : largoContr ? largoContr : "";
		errores.hay = Object.values(errores).some((n) => !!n);

		// Revisa las credenciales
		if (!errores.hay) {
			const usuario = await BD_genericas.obtienePorCondicion("usuarios", {email});
			errores.credenciales =
				!usuario || // el usuario no existe
				!bcryptjs.compareSync(datos.contrasena, usuario.contrasena); // contraseña inválida

			// Emprolija los errores
			errores.credenciales = errores.credenciales
				? "Credenciales inválidas.<br>Intento " + (datos.intentosLogin + 1) + " de 3"
				: "";
			errores.hay = !!errores.credenciales;

			// Si el usuario existe, aumenta su valor 'intsLogin'
			if (usuario) {
				// Aumenta la cantidad de intentos de login
				BD_genericas.aumentaElValorDeUnCampo("usuarios", usuario.id, "intsLogin");
				usuario.intsLogin++;

				// Verifica si se superó la cantidad de intentos fallidos tolerados
				if (usuario.intsLogin > 2) errores = {...errores, email: intsLogin, intsLogin};
			}
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
const intsLogin = comp.intsLogin;
const intsValPerenne = comp.intsValPerenne;
const usuarioInexistente = "Algún dato no coincide con el de nuestra base de datos.";
const usuarioYaExiste =
	"Ya existe un usuario con esas credenciales en nuestra base de datos. De ser necesario, comunicate con nosotros.";

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

	// Averigua si ya existe un usuario con esas credenciales
	if (!errores.hay) {
		// Variables
		let condicion = {};
		for (let campo of camposPerennes) condicion[campo] = datos[campo];

		// Averigua si el usuario existe en la base de datos
		errores.credenciales = !!(await BD_genericas.obtienePorCondicion("usuarios", condicion));
		errores.credenciales = errores.credenciales ? usuarioYaExiste : ""; // convierte el error en una frase
		errores.hay = !!errores.credenciales;
	}

	// Fin
	return errores;
};
