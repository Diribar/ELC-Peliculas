const path = require('path');
const {body} = require('express-validator');

const funcionImportarPeliculas = require(path.join(__dirname, '../modelos/importarPeliculas.js'));
return console.log(body)
let aux = body.comentario;
if (aux != "") {
	aux = funcionImportarPeliculas(aux)
	body = {
		...body,
		...aux,
	}
}