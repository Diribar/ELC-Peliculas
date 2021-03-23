// ************ Requires ************
const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/usuarios.json');
let BD = leer(ruta_nombre);

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function mailEnBD(texto) {let usuario = BD.find(n => n.email == texto);return usuario;}

// *********** Controlador ***********
module.exports = {

	loginForm: (req,res) => {
		return res.render("0-Usuarios", {
			link: req.originalUrl,
			data_entry: null,
			errorEnDataEntry: false,
			credencialesInvalidas: false,
			titulo: "Login",

		});
	},

	loginGuardar: (req,res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		let errorEnDataEntry = validaciones.errors.length > 0
		// Averiguar si existe el mail en la BD		
		let usuarioEnBD = mailEnBD(req.body.email);
		// Verificar si la contraseña es correcta
		let contrasenaOK = null
		if (!!usuarioEnBD) {
			let contrasenaBD = usuarioEnBD.contrasena
			delete usuarioEnBD.contrasena;
			contrasenaOK = bcryptjs.compareSync(req.body.contrasena, contrasenaBD)
		};
		// Verificar si mail y/o usuario no existen en BD
		let credencialesInvalidas = !usuarioEnBD || !contrasenaOK
		//return res.send([
		//	"errorEnDataEntry:" + errorEnDataEntry,
		//	"usuarioEnBD:" + !!usuarioEnBD, 
		//	"contrasenaOK:" + contrasenaOK, 
		//	"credencialesInvalidas:" + credencialesInvalidas
		//])
		// Redireccionar si existe algún error de validación
		if (errorEnDataEntry || credencialesInvalidas) {
			return res.render('0-Usuarios', {
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
				errorEnDataEntry,
				credencialesInvalidas,
				titulo: "Login",
			});
		};
		// Iniciar la sesión
		req.session.usuario = usuarioEnBD
		// Graba una cookie si está tildado 'recordame'
		if (req.body.remember) {
			res.cookie("email", req.body.email, {maxAge: 1000*60*2})
		};
		return res.redirect("/")
	},

	recupContrForm: (req,res) => {
		res.send("Recuperar contraseña")
	},
	recupContrGuardar: (req,res) => {
		res.send("Recuperar contraseña")
	},
	logout: (req,res) => {
		res.cleanCookie("email");
		req.session.destroy();
		return res.redirect("/");
	},
};
