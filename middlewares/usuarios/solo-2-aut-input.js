const varias = require("../../funciones/Varias/varias");

module.exports =  (req, res, next) => {
	let usuario=req.session.usuario
	if (!usuario) {
		varias.userLogs(req, res);		
		return res.redirect('/usuarios/login')
	}
	if (!usuario.rol_usuario.aut_input) {
		varias.userLogs(req, res);		
		return res.redirect("/usuarios/aut_input");
	}
	next();
}
