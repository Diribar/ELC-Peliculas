"use strict";
// Variables
const valida = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Variables
	const {email} = req.query;
	req.session.login = {datos: {email}};

	// Redirecciona por cookies
	if (req.cookies && req.cookies.intentosLogin && req.cookies.intentosLogin >= maxIntentosCookies)
		return res.redirect("/usuarios/login/suspendido");
	if (req.cookies && req.cookies.intentosDP && req.cookies.intentosDP >= maxIntentosCookies)
		return res.redirect("/usuarios/olvido-contrasena/suspendido");

	// Redirecciona por errores con el mail
	const {errores, usuario} = await valida.olvidoContr.email(email);
	req.session.login.errores = errores;
	if (errores.hay) return res.redirect("/usuarios/login");

	// Redirecciona por BD
	if (usuario && usuario.intentosLogin && usuario.intentosLogin >= maxIntentosBD)
		return res.redirect("/usuarios/login/suspendido");
	if (usuario.intentosDP && usuario.intentosDP >= maxIntentosBD) return res.redirect("/usuarios/olvido-contrasena/suspendido");

	// Genera información
	const validarDatosPerennes = usuario.statusRegistro_id == perennes_id; // si el usuario tiene status 'perenne_id', se muestran todos los campos
	const datos = req.session && req.session.olvidoContr ? {...req.session.olvidoContr.datos, email} : {email};

	// Crea la session de 'olvidoContr'
	req.session.olvidoContr = {datos, errores, validarDatosPerennes};

	// Fin
	return next();
};
