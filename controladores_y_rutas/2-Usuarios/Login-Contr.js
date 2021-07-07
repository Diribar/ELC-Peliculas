// ************ Requires ************
const path = require('path');
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');
const metodosUsuario = require(path.join(__dirname, "../../modelos/bases_de_datos/BD_usuarios"));

// *********** Controlador ***********
module.exports = {

	loginForm: (req,res) => {
		return res.render("LoginForm", {
			link: req.originalUrl,
			credencialesInvalidas: null,
			data_entry: null,
		});
	},

	loginGuardar: async (req,res) => {
		var usuario = await metodosUsuario.obtenerPorMail(req.body.email)
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		let errorEnDataEntry = validaciones.errors.length > 0
		if (!errorEnDataEntry) {
			// Averiguar mail y contraseña en la BD
			usuario ? contrasenaOK = bcryptjs.compareSync(req.body.contrasena, usuario.contrasena) : null
			// Verificar si mail y/o usuario no existen en BD
			var credencialesInvalidas = !usuario || !contrasenaOK
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
		if (usuario.status_registro_usuario_id == 1) {
			await metodosUsuario.upgradeStatusUsuario(usuario.id, 2)
			usuario = await metodosUsuario.obtenerPorMail(req.body.email)
		}
		// Grabar el mail del usuario en la cookie (configurado en 1 día)
		res.cookie("email", req.body.email, {maxAge: 1000*60*60*24})
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
