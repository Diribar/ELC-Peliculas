"use strict";
module.exports = async (req, res, next) => {
	// Variables
	const usuario = await BD_especificas.obtieneUsuarioPorMail(email);

	// Reenvíos por cookies
	if (req.cookies && req.cookies.intsLogin > intsLogins_PC) return res.redirect("/usuario/login/suspendido");
	if (req.cookies && req.cookies.intsDatosPer > intsDatosPer_PC) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Reenvíos x BD
	if (!usuario) return res.redirect("/usuario/login");
	if (usuario && usuario.intsLogin > instLogins_BD) return res.redirect("/usuario/login/suspendido");
	if (usuario.intsDatosPer > intsDatosPer_BD) return res.redirect("/usuario/olvido-contrasena/suspendido");

	// Fin
	next();
};
