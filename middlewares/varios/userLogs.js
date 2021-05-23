module.exports = (req,res,next) => {
	let URL = req.originalUrl
	let hasta = URL.slice(1).indexOf("/") > 0 ? URL.slice(1).indexOf("/")+1 : URL.length
	let tema = URL.slice(1, hasta)
	if (tema != "login" && tema != "usuarios") {
		req.session.urlReferencia = URL
	}
	res.locals.urlReferencia = req.session.urlReferencia
	//console.log(req.session.urlReferencia);
	next()
}