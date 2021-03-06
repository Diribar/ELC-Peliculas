module.exports = (req,res,next) => {
	if (req.session.usuarioLogueado) {return res.redirect('usuario/perfil')}
	next();
}
