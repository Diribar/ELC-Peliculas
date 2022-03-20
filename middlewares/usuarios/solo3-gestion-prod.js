const varias = require("../../funciones/Varias/Varias");

module.exports = (req, res, next) => {
	let usuario = req.session.usuario;
	if (!usuario) {
		// varias.userLogs(req, res);
		return res.redirect("/usuarios/login");
	}
	if (!usuario.rol_usuario.aut_gestion_prod) {
		// varias.userLogs(req, res);
		let mensaje = "Se requiere aumentar el nivel de confianza, para revisar la información ingresada a nuestro sistema. Si estás interesado/a, lo podés gestionar haciendo click acá."
		return res.render("Errores", {mensaje})
	}
	next();
};
