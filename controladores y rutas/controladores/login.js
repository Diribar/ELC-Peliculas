// ************ Requires ************
const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/BDusuarios.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// *********** Controlador ***********
module.exports = {

	loginForm: (req,res) => {
		//if (req.session.usuario && req.session.usuario.email) {
		//	data_entry = {"email": req.session.usuario.email}
		//} else {
		//	data_entry = null;
		//}
		return res.send([
			"login",
			req.session.usuario
		])
		let data_entry = null
		return res.render("0-Usuarios", {
			link: req.originalUrl,
			data_entry,
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
		let BD = leer(ruta_nombre);
		let usuarioEnBD = BD.find(n => n.email == req.body.email);
		// Verificar si la contraseña es correcta
		let contrasenaOK = false
		if (!!usuarioEnBD) {
			let contrasenaBD = usuarioEnBD.contrasena
			delete usuarioEnBD.contrasena;
			contrasenaOK = bcryptjs.compareSync(req.body.contrasena, contrasenaBD)
		};
		// Verificar si mail y/o usuario no existen en BD
		let credencialesInvalidas = !usuarioEnBD || !contrasenaOK
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
		res.cookie("email", usuarioEnBD.email, {maxAge: 1000*60*60})
		// Redireccionar
		return res.redirect("/usuarios/redireccionar")
	},

	recupContrForm: (req,res) => {
		res.send("Recuperar contraseña")
	},
	recupContrGuardar: (req,res) => {
		res.send("Recuperar contraseña")
	},
	logout: (req,res) => {
		req.session.usuario = null;
		res.clearCookie('email');
		return res.redirect("/");
	},
};
