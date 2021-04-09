const fs = require('fs');
const path = require('path');
const ruta_nombre_importar = path.join(__dirname, '../bases_de_datos/tablas/importarPeliculas.json');
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

module.exports =  (req,res,next) => {
    //console.log(req.body)
    let alfa = req.body.comentario;
    if (alfa != "") {
        //aux = funcionImportarPeliculas(alfa)
        // Convertir texto en array
		alfa = alfa.split("\r\n");
		alfa.unshift("Título en castellano")
		// console.log(alfa)
		// Limpiar espacios innecesarios
		for (let i=0; i<alfa.length; i++) {alfa[i]=alfa[i].trim()}
		// Convertir "Títulos de vista" en "Títulos de tabla" y eliminar los que no coincidan
		let BDtitulos = leer(ruta_nombre_importar);
		for (let i=0; i<alfa.length; i=i+2) {
			let indice = BDtitulos.indexOf(alfa[i]);
			if (indice != -1) {
				alfa[i] = BDtitulos[indice+1]
			} else {
				alfa[i]=""
				alfa[i+1]=""
			}
		}
		// Limpiar campos vacíos
		alfa = alfa.filter(n => {return n != ""})
		// Convertir array en JSON
		let beta="{"
		for (let i=0; i < alfa.length; i=i+2) {
			if (i>0) {beta=beta + ', '}
			beta = beta + '"'+ alfa[i] + '": "' + alfa[i+1] + '"';
		}
		beta = beta + "}"
		// Convertir JSON en objeto
		beta = JSON.parse(beta)
		//console.log(beta)
        req.body = {
            ...req.body,
            ...beta,
        };
        //console.log(req.body)
    };
    next();
}
