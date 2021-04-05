module.exports =  (req,res,next) => {
	if (!req.session.usuario) {return res.redirect('/login')}
	//if (!req.session.usuario.admin) {return res.redirect('/usuarios/admin-cartel')}
	next();
}
