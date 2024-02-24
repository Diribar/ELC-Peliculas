"use strict";
// Variables
const valida = require("../../rutas_y_controladores/1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Reenvíos por cookies
	if (req.cookies && req.cookies.intsLogin > intsLogins_PC) return res.redirect("/usuario/login/suspendido");
	if (req.cookies && req.cookies.intsDatosPer > intsDatosPer_PC) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Averigua si hay errores con el mail
	const {email} = req.query;
	let {errores, usuario} = valida.olvido.Contr.mail(email);
	if (errores.hay) {
		res.cookie("login", {datos: {email}, errores}, {maxAge: unDia}); // cookie - guarda la info
		return res.redirect("/usuario/login");
	}

	// Reenvíos x BD
	if (!usuario) return res.redirect("/usuario/login");
	if (usuario && usuario.intsLogin > instLogins_BD) return res.redirect("/usuario/login/suspendido");
	if (usuario.intsDatosPer > intsDatosPer_BD) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Crea la cookie
	const mostrarCampos = usuario.statusRegistro_id == perennes_id; // si el usuario tiene status 'perenne_id', se muestran todos los campos
	const datos = req.cookies && req.cookies.olvidoContr ? {...req.cookies.olvidoContr, email} : {email};
	res.cookie("olvidoContr", {datos, errores, usuario, mostrarCampos}, {maxAge: unDia});

	// Fin
	next();
};
