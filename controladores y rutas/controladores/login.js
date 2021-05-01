// ************ Requires ************
const path = require('path');
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');
const metodosUsuario = require(path.join(__dirname, "../../modelos/BD_usuarios"));

// *********** Controlador ***********
module.exports = {

	loginForm: (req,res) => {
		if (req.session.usuario && req.session.usuario.email) {
			data_entry = {"email": req.session.usuario.email}
		} else {
			data_entry = null;
		}
		//return res.send(data_entry)
		return res.render("LoginForm", {
			link: req.originalUrl,
			credencialesInvalidas: null,
			data_entry,
		});
	},

	loginGuardar: async (req,res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		let errorEnDataEntry = validaciones.errors.length > 0
		if (!errorEnDataEntry) {
			// Averiguar si existe el mail en la BD
			var email_existe_en_BD = await metodosUsuario.email_existente_en_BD(req.body.email)
			if (email_existe_en_BD) {
				// Verificar si la contraseña es correcta
				var usuario = await metodosUsuario.obtener_el_usuario_a_partir_del_email(req.body.email)
				var contrasenaBD =  usuario.contrasena
				var contrasenaOK = bcryptjs.compareSync(req.body.contrasena, contrasenaBD)
			}
			// Verificar si mail y/o usuario no existen en BD
			var credencialesInvalidas = !email_existe_en_BD || !contrasenaOK
		}
		// Redireccionar si existe algún error de validación
		if (errorEnDataEntry || credencialesInvalidas) {
			return res.render('LoginForm', {
				link: req.originalUrl,
				errores: validaciones.mapped(),
				credencialesInvalidas,
				data_entry: req.body,
			});
		};
		// Si corresponde, actualizar el Status del Usuario
		if (usuario.status_usuario_id.toString() == 1) {
			//return res.send("linea 53")
			await metodosUsuario.mailValidado(usuario.id)
		}
		usuario = await metodosUsuario.obtener_el_usuario_a_partir_del_email(req.body.email)
		res.cookie("email", req.body.email, {maxAge: 1000*60*60*1})
		// return res.send(usuario)
		// Iniciar la sesión
		req.session.usuario = usuario
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
		res.clearCookie('email');
		req.session.usuario = null;
		//return res.send("linea 72")
		return res.redirect("/");
	},
};
