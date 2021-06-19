// ************ Requires ************
const path = require('path');

// ************ Funciones ************
const generarReqBody  = require(path.join(__dirname, '/2generarReqBody'));

// ************ Exportar ************
module.exports = async (req, res, next) => {
	// Obtener las colecciones
	let coleccion = await API_search(palabras_clave);
	let TVshows = await API_search(palabras_clave);


	// SI HAY DEMASIADAS PELÍCULAS CANDIDATAS --> Avisar del error y salir
	if (data.errors) {
		req.body = {...req.body,"demasiadosResultados": true}
		next()
	} else {

		// SI NO HAY PELÍCULAS CANDIDATAS --> Avisar del error y salir
		if (data.total_results.toString() == 0) {
			req.body = {...req.body,"noSeEncuentraLaPeli": true}
			next()
		}

		// SI HAY UNA SOLA CANDIDATA --> Procesar los datos para quedarse sólo con los necesarios
		if (data.total_results.toString() == 1) {
			let ID = data.results[0].id.toString()
			await generarReqBody(req, res, ID);
			next()
		} 

		// SI HAY MÁS DE 1 CANDIDATA
		if (data.total_results.toString() > 1) {
			return res.send("IR A UN FORM DE DESAMBIGUAR");
		}
	}
}
