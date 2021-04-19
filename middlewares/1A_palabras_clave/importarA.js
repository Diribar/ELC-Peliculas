// ************ Requires ************
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const {body} = require('express-validator');

// ************ Funciones ************
const API_search = require(path.join(__dirname, '/webAPI1_search'));
const API_details = require(path.join(__dirname, '/webAPI2_details'));

// ************ Exportar ************
module.exports = async (req, res, next) => {
	const erroresValidacion = validationResult(req);
	let existenErrores = erroresValidacion.errors.length > 0;
	//return res.send(erroresValidacion)
	if (!existenErrores) {
		//return res.send(req.body.palabras_clave)
		let palabras_clave = req.body.palabras_clave;
		let data = await API_search(palabras_clave);
		// return res.send(data)
		// return res.send(data)
		
		// SI NO HAY PELÍCULAS CANDIDATAS
		// CREAR EL ERROR DE RESULTADO Y REGRESAR A FORM 1
		if (data.errors) {
			body('palabras_clave').custom((value, { req }) => {
				throw new Error('No encontramos ninguna película con esas palabras clave')
			});
			//return res.send(["sin resultados", validationResult(req)]);
			validationResult(req).errors = {
				"value": "",
				"msg": "No se encontró ninguna película con estas palabras clave",
				"param": "palabras_clave",
				"location": "body"
			};

			return res.send(["sin resultados", validationResult(req)]);
		} else {
			// SI HAY UNA SOLA CANDIDATA
			if (data.total_results.toString() == 1) {
				// OBTENER LOS DETALLES DE CABECERA
				//return res.send(data.results[0].id.toString())
				let ID = data.results[0].id.toString()
				//return res.send(ID)
				let pelicula = await API_details(ID);
			}
		}
		// SI HAY MÁS DE 1 CANDIDATA
		if (aux.results.length > 1) {
			return res.send("IR A UN FORM DE DESAMBIGUAR");

		}

		// Limpiar la info importada
		req.body.imports = ""
		//return res.send(data)

		// Transferir los datos importados
		req.body = {
			...req.body,
			...data,
		};
	}
	next();
}
