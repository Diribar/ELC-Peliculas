module.exports = (req,res,next) => {
	if (req.session.usuario && req.session.usuario.status_usuario_id.toString() != 1) {
		return res.redirect('/login/logout')
	}
	next();
}
