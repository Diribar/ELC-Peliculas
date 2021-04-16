// ************ Requires ************
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');

// ************ Funciones ************
const importarFilmAffinity = require(path.join(__dirname, '../../modelos/importarFilmAffinity'));
const importarWikipedia = require(path.join(__dirname, '../../modelos/importarWikipedia'));

// ************ Exportar ************
module.exports =  (req,res,next) => {
	const erroresValidacion = validationResult(req);
	let existenErrores = erroresValidacion.errors.length > 0;
	if (!existenErrores) {
		//return res.send(req.body)
		let imports = req.body.imports;
		let link = req.body.link;
		if (link.includes("filmaffinity.com/")) {
			data = importarFilmAffinity(imports)
			//return res.send(data)
		};
		if (link.includes("es.wikipedia.org/wiki/")) {
			data = importarWikipedia(imports)
		};
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
