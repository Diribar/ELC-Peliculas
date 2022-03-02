// **** Requires ***********
let BD_varias = require("../BD/Varias");
let path = require("path");

// Objeto literal
module.exports = {
	registroMail: async (email) => {
		let errores = {};
		errores.email = !email
			? mailVacio
			: formatoMail(email)
			? mailFormato
			: (await BD_varias.obtenerELC_id("usuarios", "email", email))
			? "Esta dirección de email ya figura en nuestra base de datos"
			: "";
		errores.hay = hayErrores(errores);
		return errores;
	},

	login: (login) => {
		let errores = {};
		errores.email = !login.email ? mailVacio : formatoMail(login.email) ? mailFormato : "";
		errores.contrasena = !login.contrasena
			? contrasenaVacia
			: largoContrasena(login.contrasena)
			? largoContrasena(login.contrasena)
			: "";
		errores.hay = hayErrores(errores);
		return errores;
	},

	perennes: (datos) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		cartelCastellano =
			"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
		let errores = {};
		errores.nombre = !datos.nombre
			? cartelCampoVacio
			: longitud(datos.nombre, 2, 30)
			? longitud(datos.nombre, 2, 30)
			: castellano(datos.nombre)
			? cartelCastellano
			: "";
		errores.apellido = !datos.apellido
			? cartelCampoVacio
			: longitud(datos.apellido, 2, 30)
			? longitud(datos.apellido, 2, 30)
			: castellano(datos.apellido)
			? cartelCastellano
			: "";
		errores.sexo_id = !datos.sexo_id ? "Necesitamos que elijas un valor" : "";
		errores.fecha_nacimiento = !datos.fecha_nacimiento
			? "Necesitamos que ingreses la fecha"
			: fechaRazonable(datos.fecha_nacimiento)
			? "¿Estás seguro de que introdujiste la fecha correcta?"
			: "";
		errores.hay = hayErrores(errores);
		return errores;
	},

	editables: (datos) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		cartelCastellano =
			"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
		let errores = {};
		errores.apodo = !datos.apodo
			? cartelCampoVacio
			: longitud(datos.apodo, 2, 30)
			? longitud(datos.apodo, 2, 30)
			: castellano(datos.apodo)
			? cartelCastellano
			: "";
		errores.paises_id = !datos.paises_id ? "Necesitamos que elijas un valor" : "";

		errores.rol_iglesia_id = !datos.rol_iglesia_id ? "Necesitamos que elijas un valor" : "";
		errores.avatar = !datos.avatar
			? ""
			: extension(datos.avatar)
			? "Usaste un archivo con la extensión " +
			  extension(datos.avatar).slice(1).toUpperCase() +
			  ". Las extensiones de archivo válidas son JPG, PNG, GIF y BMP."
			: datos.tamano > 1100000
			? "El archivo es de " +
			  parseInt(datos.tamano / 10000) / 100 +
			  " MB. Necesitamos que no supere 1 MB"
			: "";
		errores.hay = hayErrores(errores);
		return errores;
	},
};

let mailVacio = "Necesitamos que escribas un correo electrónico";
let mailFormato = "Debes escribir un formato de correo válido";
let contrasenaVacia = "Necesitamos que escribas una contraseña";

let formatoMail = (email) => {
	let formato = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return !formato.test(email);
};

let largoContrasena = (dato) => {
	return dato.length < 6 || dato.length > 12
		? "La contraseña debe tener de 6 a 12 caracteres"
		: "";
};

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	formato = /^[A-Z][A-Za-z ,.:áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};

let extension = (nombre) => {
	if (!nombre) return false;
	ext = path.extname(nombre);
	return ![".jpg", ".png"].includes(ext) ? ext : false;
};

let hayErrores = (errores) => {
	resultado = false;
	valores = Object.values(errores);
	for (valor of valores) {
		valor ? (resultado = true) : "";
	}
	return resultado;
};

let fechaRazonable = (dato) => {
	// Verificar que la fecha sea razonable
	let ano = parseInt(dato.slice(0, 4));
	let max = new Date().getFullYear() - 5;
	let min = new Date().getFullYear() - 100;
	return ano > max || ano < min ? true : false;
};
