module.exports = (req,res,next) => {
	let URL = req.originalUrl
	URL = URL.slice(1)
	URL = URL.slice(0, URL.indexOf("/"))
	if (URL != "usuarios" && URL != "login") {
		if (res.locals && res.locals.urlActual) {
			res.locals.urlAnterior = res.locals.urlActual
		} else {
			res.locals.urlAnterior = req.originalUrl;
		}
		res.locals.urlActual = req.originalUrl;
	}
	next()
}