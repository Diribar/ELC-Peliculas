module.exports = (req,res,next) => {
	if (!session.usuario.admin) {return res.redirect('usuarios/solicitarAdmin')}
	next();
}
