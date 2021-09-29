// **** Requires ***********
const BD_usuarios = require("./base_de_datos/BD_usuarios");
const path = require("path");

module.exports = {
	validarMail: async (email) => {
		cartelCampoVacio = "Necesitamos que escribas un correo electrónico";
		let errores = {};
		errores.email = campoVacio(email)
			? cartelCampoVacio
			: formatoMail(email)
			? "Debes escribir un formato de correo válido"
			: (await averiguarSiYaEnBD(email))
			? "Esta dirección de email ya figura en nuestra base de datos"
			: "";
		return errores;
	},

	validarPerennes: (datos) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		cartelCastellano =
			"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
		let errores = {};
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
		errores.sexo = campoVacio(datos.sexo) ? cartelCampoVacio : "";
		errores.fechaNacimiento = campoVacio(datos.fechaNacimiento)
			? cartelCampoVacio
			: "";
	},

	validarEditables: (datos) => {
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
		errores.pais_id = campoVacio(datos.pais_id) ? cartelCampoVacio : "";
		errores.estado_eclesial = campoVacio(datos.estado_eclesial)
			? cartelCampoVacio
			: "";
		errores.avatar = campoVacio(datos.avatar)
			? ""
			: extension(datos.avatar)
			? "Usaste un archivo con la extensión " +
			  extension(datos.avatar) +
			  ". Las extensiones de archivo válidas son jpg, png, gif, bmp"
			: datos.tamano > 5000000
			? "El archivo es de " +
			  parseInt(datos.tamano / 10000) / 100 +
			  " MB. Necesitamos que no supere los 5 MB"
			: "";
		return errores;
	},
};

let averiguarSiYaEnBD = async (email) => {
	// La respuesta se espera que sea 'true' or 'false'
	if (!email) return false;
	return await BD_usuarios.AveriguarSiYaEnBD(email);
};
let formatoMail = (email) => {
	try {
		address = new MailAddress(email);
		isValid = address.Address == emailAddress;
		console.log(address);
		// or
		// isValid = string.IsNullOrEmpty(address.DisplayName);
	} catch (error) {
		console.log(error);
	}
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
	console.log(ext);
	return ![".jpg", ".png", ".gif", ".bmp"].includes(ext) ? ext : false;
};
