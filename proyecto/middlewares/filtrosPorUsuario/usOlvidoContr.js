"use strict";
// Variables
const valida = require("../../rutas_y_controladores/1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Redirecciona por cookies
	if (req.cookies && req.cookies.intentosLogin >= intentosCookies) return res.redirect("/usuarios/login/suspendido");
	if (req.cookies && req.cookies.intentosDP >= intentosCookies) return res.redirect("/usuarios/olvido-contrasena/suspendido");

	// Redirecciona por errores con el mail
	const {email} = req.query;
	const {errores, usuario} = await valida.olvidoContr.email(email);
	if (errores.hay) {
		// Actualiza la session
		const datos = req.session.login && req.session.login.datos ? {...req.session.login.datos, email} : {email};
		req.session.login = {...req.session.login, datos, errores};

		// Redirecciona
		return res.redirect("/usuarios/login");
	}

	// Redirecciona por BD
	if (usuario && usuario.intentosLogin >= intentosBD) return res.redirect("/usuarios/login/suspendido");
	if (usuario.intentosDP >= intentosBD) return res.redirect("/usuarios/olvido-contrasena/suspendido");

	// Crea la session
	const validarDatosPerennes = usuario.statusRegistro_id == perennes_id; // si el usuario tiene status 'perenne_id', se muestran todos los campos
	const datos = req.session && req.session.olvidoContr ? {...req.session.olvidoContr.datos, email} : {email};
	req.session.olvidoContr = {datos, errores, usuario, validarDatosPerennes};

	// Fin
	next();
};
