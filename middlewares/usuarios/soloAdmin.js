module.exports =  (req, res, next) => {
	if (!req.session.usuario) return res.redirect('/login')
	if (req.session.usuario.rol_usuario_id < 2) return res.redirect("/usuarios/admin-cartel");
	next();
}
