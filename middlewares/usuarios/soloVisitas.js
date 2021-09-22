module.exports = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.status_registro_id.toString() != 1) {
		console.log("soloVisitas")
		return res.redirect('/login/logout')
	}
	next();
}
