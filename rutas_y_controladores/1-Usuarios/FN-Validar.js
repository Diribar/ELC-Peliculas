"use strict";
// Definir variables
const path = require("path");
const bcryptjs = require("bcryptjs");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	altaMail: async (email) => {
		let errores = {};
		errores.email = !email ? cartelMailVacio : formatoMail(email) ? cartelMailFormato : "";
		errores.hay = !!errores.email;
		return errores;
	},

	perennes: (datos) => {
		let errores = {};
		if (datos.nombre) var largoPerenne = longitud(datos.nombre, 2, 30);
		errores.nombre = !datos.nombre
			? cartelCampoVacio
			: castellano(datos.nombre)
			? cartelCastellano
			: mayuscula(datos.nombre)
			? cartelMayuscula
			: largoPerenne
			? largoPerenne
			: "";
		errores.apellido = !datos.apellido
			? cartelCampoVacio
			: castellano(datos.apellido)
			? cartelCastellano
			: mayuscula(datos.apellido)
			? cartelMayuscula
			: largoPerenne
			? largoPerenne
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
		if (datos.apodo) var largoApodo = longitud(datos.apodo, 2, 30);
		errores.apodo = !datos.apodo
			? cartelCampoVacio
			: castellano(datos.apodo)
			? cartelCastellano
			: mayuscula(datos.apodo)
			? cartelMayuscula
			: largoApodo
			? largoApodo
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

	documentoFE: (datos) => {
		// Variables
		let errores = {};
		let campos = Object.keys(datos);
		// Revisar 'docum_numero'
		if (campos.includes("docum_numero")) {
			if (datos.docum_numero) var largoNumero = longitud(datos.apodo, 2, 15);
			errores.docum_numero = !datos.docum_numero ? cartelCampoVacio : largoNumero ? largoNumero : "";
		}
		// Revisar 'docum_pais_id'
		if (campos.includes("docum_pais_id"))
			errores.docum_pais_id = !datos.docum_pais_id ? cartelElejiUnValor : "";
		// Revisar 'avatar'
		if (campos.includes("docum_avatar")) {
			// Variables
			if (datos.docum_avatar) var extAvatar = extension(datos.docum_avatar);
			let tamano = datos.tamano ? parseInt(Number(datos.tamano) / 10000) / 100 : 0;
			// Validaciones
			errores.docum_avatar = !datos.docum_avatar
				? ""
				: extAvatar
				? "Usaste un archivo con la extensión " +
				  extAvatar.slice(1).toUpperCase() +
				  ". Las extensiones de archivo válidas son JPG, JPEG y PNG"
				: tamano > 1.1
				? "El archivo es de " + tamano + " MB. Necesitamos que no supere 1 MB"
				: "";
		}
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	documentoBE: async function (datos) {
		// console.log(110,datos);
		// Averiguar los errores
		let errores = await this.documentoFE(datos);
		// Acciones si no hay errores
		if (!errores.hay) {
			// Verifica que el documento no exista ya en la Base de Datos
			let docum_numero = datos.docum_numero;
			let docum_pais_id = datos.docum_pais_id;
			let averiguar = await BD_genericas.obtenerPorCampos("usuarios", {docum_numero, docum_pais_id});
			if (averiguar && averiguar.id != datos.id)
				errores = {
					credenciales: true,
					hay: true,
				};
			// Verifica el docum_avatar
			errores.docum_avatar =
				// Que tenga nombre
				!datos.docum_avatar
					? "Necesitamos que ingreses una imagen de tu documento. La usaremos para verificar tus datos."
					: // Que exista el archivo
					!compartidas.averiguaSiExisteUnArchivo(datos.ruta + datos.docum_avatar)
					? "El archivo de imagen no existe"
					: "";
		}
		// Fin
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

	mailContrasena_y_ObtieneUsuario: async function (datos) {
		// Variables
		let usuario;
		// Averiguar los errores
		let errores = await this.login(datos);
		// Acciones si no hay errores
		if (!errores.hay) {
			// Si no hay error => averigua el usuario
			usuario = await BD_especificas.obtenerUsuarioPorMail(datos.email);
			// Si existe el usuario => averigua si la contraseña es válida
			if (usuario) {
				errores.credenciales = !bcryptjs.compareSync(datos.contrasena, usuario.contrasena);
				// Si la contraseña no es válida => Credenciales Inválidas
				if (errores.credenciales) errores.hay = true;
			}
			// Si el usuario no existe => Credenciales Inválidas
			else errores = {credenciales: true, hay: true};
		}
		// Fin
		return {errores, usuario};
	},

	olvidoContrBE: async (datos) => {
		// Variables
		let errores = {};
		let usuario = await BD_genericas.obtenerPorCamposConInclude(
			"usuarios",
			{email: datos.email},
			"status_registro"
		);
		// Verifica si el usuario existe en la BD
		if (!usuario) errores = {email: "Esta dirección de email no figura en nuestra base de datos."};
		else {
			// Verifica si la dirección de mail fue validada
			let fechaHorario = compartidas.fechaHorarioTexto(usuario.fecha_contrasena);
			if (!usuario.status_registro.mail_validado) {
				errores = {
					email:
						"Esta dirección de email no está validada. Ya se envió un mail con la contraseña el día " +
						fechaHorario,
				};
			} else {
				// Verifica si ya se envió un mail en el día
				let ahora = compartidas.fechaTexto(compartidas.ahora());
				let fecha = compartidas.fechaTexto(usuario.fecha_contrasena);
				if (ahora == fecha)
					errores = {
						email:
							"El mail fue enviado el " +
							fechaHorario +
							", y se permite un sólo envío por día.",
					};
				// Verifica si tiene status de 'documento'
				else if (usuario.status_registro.ident_a_validar) {
					// Verifica los posibles errores
					errores.docum_numero = !datos.docum_numero
						? cartelCampoVacio
						: datos.docum_numero != usuario.docum_numero
						? "El número de documento no coincide con el de nuestra Base de Datos"
						: "";
					errores.docum_pais_id = !datos.docum_pais_id
						? cartelElejiUnValor
						: datos.docum_pais_id != usuario.docum_pais_id
						? "El país no coincide con el de nuestra Base de Datos"
						: "";
					errores.documento = !!errores.docum_numero || !!errores.docum_pais_id;
				}
			}
		}
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return [errores, usuario];
	},
};

let cartelMailVacio = "Necesitamos que escribas un correo electrónico";
let cartelMailFormato = "Debes escribir un formato de correo válido";
let cartelContrasenaVacia = "Necesitamos que escribas una contraseña";
let cartelCampoVacio = "Necesitamos que completes este campo";
let cartelCastellano = "Sólo se admiten letras del abecedario castellano";
let cartelMayuscula = "La primera letra debe ser en mayúscula";
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
	let formato = /[A-Za-z áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};

let mayuscula = (dato) => {
	let formato = /^[A-Z]/;
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
