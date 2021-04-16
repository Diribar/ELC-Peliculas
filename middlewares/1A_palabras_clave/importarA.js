// ************ Requires ************
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');

// ************ Funciones ************
const API_search = require(path.join(__dirname, '/webAPI_search'));

// ************ Exportar ************
module.exports =  (req,res,next) => {
	const erroresValidacion = validationResult(req);
	let existenErrores = erroresValidacion.errors.length > 0;
	//return res.send(erroresValidacion)
	if (!existenErrores) {
		//return res.send(req.body.palabras_clave)
		let palabras_clave = req.body.palabras_clave;
		data = API_search(palabras_clave);
		return res.send(data);
		if (data = "") {
			validationResult(req).errors = {
				"value": "",
				"msg": "No se encontró ninguna película con estas palabras clave",
				"param": "palabras_clave",
				"location": "body"
			};
			return res.send(validationResult(req));
		}



		// Limpiar la info importada
		req.body.imports = ""
		//return res.send(data)
		// Obtener el protagonista
		let reparto = data.reparto
		let protagonista = data.protagonista
		if (reparto && reparto.includes(",") && !protagonista) {
			data.protagonista = reparto.slice(0, reparto.indexOf(","))
			data.reparto = reparto.slice(reparto.indexOf(",")+2)
			//return res.send(data.protagonista)
		}

		// Transferir los datos importados
		req.body = {
			...req.body,
			...data,
		};
	}
	next();
}
