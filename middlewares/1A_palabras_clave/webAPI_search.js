// ************ Requires ************
const fs = require('fs');
const path = require('path');

// ************ Variables ************
const ruta_FilmAffinity = path.join(__dirname, '../bases_de_datos/tablas/IMP_FilmAffinity.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

module.exports = (palabras_clave) => {

}