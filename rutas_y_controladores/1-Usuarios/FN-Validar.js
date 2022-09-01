"use strict";
// Definir variables
const path = require("path");
const bcryptjs = require("bcryptjs");
const BD_especificas = require("../../funciones/2-BD/Especificas");

module.exports = {
	registroMail: async (email) => {
		let errores = {};
		errores.email = !email
			? cartelMailVacio
			: formatoMail(email)
			? cartelMailFormato
			: (await BD_especificas.obtenerELC_id("usuarios", {email: email}))
			? "Esta dirección de email ya figura en nuestra base de datos"
			: "";
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},

	login: (datos) => {
		// Variables
		let {email, contrasena} = datos;
		let errores = {};
		if (contrasena) var largoContr = largoContrasena(contrasena);
		// Verificar errores
		errores.email = !email ? cartelMailVacio : formatoMail(email) ? cartelMailFormato : "";
		errores.contrasena = !contrasena ? cartelContrasenaVacia : largoContr ? largoContr : "";
		errores.hay = Object.values(errores).some((n) => !!n);
		// Fin
		return errores;
	},

	validadMailContrasena_y_ObtieneUsuario: async function (datos) {
		let errores = await this.login(datos);
		if (!errores.hay) {
			// 2. Si no hay error => averigua el usuario
			var usuario = await BD_especificas.obtenerUsuarioPorMail(datos.email);
			// 3. Si existe el usuario => averigua si la contraseña es válida
			if (usuario) {
				errores.credenciales = !bcryptjs.compareSync(datos.contrasena, usuario.contrasena);
				if (errores.credenciales) errores.hay = true;
			}
			// Si el usuario no existe => Credenciales Inválidas
			else errores = {credenciales: true, hay: true};
		}
		// Fin
		return {errores, usuario};
	},

	perennes: (datos) => {
		let errores = {};
		if (datos.nombre) var largoPerenne = longitud(datos.nombre, 2, 30);
		errores.nombre = !datos.nombre
			? cartelCampoVacio
			: largoPerenne
			? largoPerenne
			: castellano(datos.nombre)
			? cartelCastellano
			: "";
		errores.apellido = !datos.apellido
			? cartelCampoVacio
			: largoPerenne
			? largoPerenne
			: castellano(datos.apellido)
			? cartelCastellano
			: "";
		errores.sexo_id = !datos.sexo_id ? "Necesitamos que elijas un valor" : "";
		errores.fecha_nacimiento = !datos.fecha_nacimiento
			? "Necesitamos que ingreses la fecha"
			: fechaRazonable(datos.fecha_nacimiento)
			? "¿Estás seguro de que introdujiste la fecha correcta?"
			: "";
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},

	editables: (datos) => {
		let errores = {};
		if (datos.apodo) var longApodo = longitud(datos.apodo, 2, 30);
		errores.apodo = !datos.apodo
			? cartelCampoVacio
			: longApodo
			? longApodo
			: castellano(datos.apodo)
			? cartelCastellano
			: "";
		errores.pais_id = !datos.pais_id ? cartelElejiUnValor : "";
		errores.rol_iglesia_id = !datos.rol_iglesia_id ? cartelElejiUnValor : "";
		let extAvatar = extension(datos.avatar);
		errores.avatar = !datos.avatar
			? ""
			: extAvatar
			? "Usaste un archivo con la extensión " +
			  extAvatar.slice(1).toUpperCase() +
			  ". Las extensiones de archivo válidas son JPG, JPEG y PNG"
			: datos.tamano > 1100000
			? "El archivo es de " +
			  parseInt(datos.tamano / 10000) / 100 +
			  " MB. Necesitamos que no supere 1 MB"
			: "";
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};

let cartelMailVacio = "Necesitamos que escribas un correo electrónico";
let cartelMailFormato = "Debes escribir un formato de correo válido";
let cartelContrasenaVacia = "Necesitamos que escribas una contraseña";
let cartelCampoVacio = "Necesitamos que completes este campo";
let cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
let cartelElejiUnValor = "Necesitamos que elijas un valor";

let formatoMail = (email) => {
	let formato = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return !formato.test(email);
};

let largoContrasena = (dato) => {
	return dato.length < 6 || dato.length > 12 ? "La contraseña debe tener de 6 a 12 caracteres" : "";
};

let longitud = (dato, corto, largo) => {
	return dato && dato.length < corto
		? "El nombre debe ser más largo"
		: dato && dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	let formato = /^[A-Z][A-Za-z ,.:áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};

let extension = (nombre) => {
	if (!nombre) return false;
	let ext = path.extname(nombre);
	return ![".jpg", ".png", ".jpeg"].includes(ext) ? ext : false;
};

let fechaRazonable = (dato) => {
	// Verificar que la fecha sea razonable
	let ano = parseInt(dato.slice(0, 4));
	let max = new Date().getFullYear() - 5;
	let min = new Date().getFullYear() - 100;
	return ano > max || ano < min ? true : false;
};
