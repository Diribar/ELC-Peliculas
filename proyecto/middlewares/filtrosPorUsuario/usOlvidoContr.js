"use strict";
// Variables
const valida = require("../../rutas_y_controladores/1-Usuarios/US-FN-Validar");

module.exports = async (req, res, next) => {
	// Redirecciona por cookies
	if (req.cookies && req.cookies.intsLogin > intentos_Cookies) return res.redirect("/usuario/login/suspendido");
	if (req.cookies && req.cookies.intentos_DP > intentos_Cookies) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Redirecciona por errores con el mail
	const {email} = req.query;
	let {errores, usuario} = valida.olvidoContr.email(email);
	if (errores.hay) {
		// Obtiene la cookie
		const cookie =
			req.cookies && req.cookies.login
				? {...req.cookies.login, datos: {...req.cookies.login.datos, email}, errores}
				: {datos: {email}, errores};

		// Guarda la cookie y redirecciona
		res.cookie("login", cookie, {maxAge: unDia});
		return res.redirect("/usuario/login");
	}

	// Redirecciona por BD
	if (!usuario) return res.redirect("/usuario/login");
	if (usuario && usuario.intsLogin > intentos_BD) return res.redirect("/usuario/login/suspendido");
	if (usuario.intentos_DP > intentos_BD) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Crea la cookie
	const mostrarCampos = usuario.statusRegistro_id == perennes_id; // si el usuario tiene status 'perenne_id', se muestran todos los campos
	const datos =
		req.cookies && req.cookies.olvidoContr && req.cookies.olvidoContr.datos
			? {...req.cookies.olvidoContr.datos, email}
			: {email};
	res.cookie("olvidoContr", {datos, errores, usuario, mostrarCampos}, {maxAge: unDia});

	// Fin
	next();
};
