// **** Requires ***********
const BD_usuarios = require("./BD/usuarios");
const path = require("path");

module.exports = {
	mail: async (email) => {
		cartelCampoVacio = "Necesitamos que escribas un correo electrónico";
		let errores = {};
		errores.email = campoVacio(email)
			? cartelCampoVacio
			: formatoMail(email)
			? "Debes escribir un formato de correo válido"
			: (await averiguarSiYaEnBD(email))
			? "Esta dirección de email ya figura en nuestra base de datos"
			: "";
		errores.hay = hayErrores(errores);
		return errores;
	},

	perennes: (datos) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		cartelCastellano =
			"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
		let errores = {};
		console.log(datos)
		errores.nombre = campoVacio(datos.nombre)
			? cartelCampoVacio
			: longitud(datos.nombre, 2, 30)
			? longitud(datos.nombre, 2, 30)
			: castellano(datos.nombre)
			? cartelCastellano
			: "";
		errores.apellido = campoVacio(datos.apellido)
			? cartelCampoVacio
			: longitud(datos.apellido, 2, 30)
			? longitud(datos.apellido, 2, 30)
			: castellano(datos.apellido)
			? cartelCastellano
			: "";
		errores.sexo_id = campoVacio(datos.sexo_id)
			? "Necesitamos que elijas un valor"
			: "";
		errores.fecha_nacimiento = campoVacio(datos.fecha_nacimiento)
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
		errores.apodo = campoVacio(datos.apodo)
			? cartelCampoVacio
			: longitud(datos.apodo, 2, 30)
			? longitud(datos.apodo, 2, 30)
			: castellano(datos.apodo)
			? cartelCastellano
			: "";
		errores.pais_id = campoVacio(datos.pais_id)
			? "Necesitamos que elijas un valor"
			: "";
			
		errores.estado_eclesial_id = campoVacio(datos.estado_eclesial_id)
			? "Necesitamos que elijas un valor"
			: "";
		errores.avatar = campoVacio(datos.avatar)
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

let averiguarSiYaEnBD = async (email) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!email) return false;
	return await BD_usuarios.AveriguarSiYaEnBD(email);
};
let formatoMail = (email) => {
	let formato = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return !formato.test(email);
};
let campoVacio = (dato) => {
	return dato == "" || dato == null || dato == undefined || dato == 0;
};
let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};
let castellano = (dato) => {
	formato = /^[A-Z][A-ZÁÉÍÓÚÜÑa-z ,.:áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};
let extension = (nombre) => {
	if (!nombre) return false;
	ext = path.extname(nombre);
	return ![".jpg", ".png", ".gif", ".bmp"].includes(ext) ? ext : false;
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
