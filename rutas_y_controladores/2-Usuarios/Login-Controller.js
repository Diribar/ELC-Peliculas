// ************ Requires ************
const path = require("path");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const BD_usuarios = require(path.join(
	__dirname,
	"../../modelos/base_de_datos/BD_usuarios"
));

// *********** Controlador ***********
module.exports = {
	loginForm: (req, res) => {
		data_entry = req.session.usuario
			? { email: req.session.usuario.email }
			: req.session.email
			? { email: req.session.email }
			: null
		tema = "usuario";
		codigo = "login";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			credencialesInvalidas: null,
			data_entry,
		});
	},

	loginGuardar: async (req, res) => {
		let usuario = await BD_usuarios.obtenerPorMail(req.body.email);
		//return res.send(usuario)
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		let errorEnDataEntry = validaciones.errors.length > 0;
		if (!errorEnDataEntry) {
			// Averiguar mail y contraseña en la BD
			contrasenaOK = usuario
				? bcryptjs.compareSync(req.body.contrasena, usuario.contrasena)
				: false;
			// Verificar si mail y/o usuario no existen en BD
			var credencialesInvalidas = !usuario || !contrasenaOK;
		}
		// Redireccionar si existe algún error de validación
		if (errorEnDataEntry || credencialesInvalidas) {
			tema = "usuario";
			codigo = "login";
			return res.render("Home", {
				tema,
				codigo,
				link: req.originalUrl,
				errores: validaciones.mapped(),
				credencialesInvalidas,
				data_entry: req.body,
			});
		}
		// Si corresponde, actualizar el Status del Usuario
		if (usuario.status_registro_id == 1) {
			await BD_usuarios.actualizarStatusUsuario(usuario.id, 2);
			usuario = await BD_usuarios.obtenerPorMail(req.body.email);
		}
		// Grabar el mail del usuario en la cookie (configurado en 1 día)
		res.cookie("email", req.body.email, { maxAge: 1000 * 60 * 60 * 24 });
		// return res.send(usuario)
		// Iniciar la sesión
		req.session.usuario = usuario;
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	recupContrForm: (req, res) => {
		res.send("Recuperar contraseña");
	},
	recupContrGuardar: (req, res) => {
		res.send("Recuperar contraseña");
	},
	logout: (req, res) => {
		url = req.session.urlReferencia
			? req.session.urlReferencia
			: "/"
		res.clearCookie("email");
		req.session.destroy();
		return res.redirect(url);
	},
};
