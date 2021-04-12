// ************ Requires ************
const fs = require('fs');
const path = require('path');

// ************ Variables ************
const ruta_FilmAffinity = path.join(__dirname, '../bases_de_datos/tablas/IMP_FilmAffinity.json');

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

module.exports = (alfa) => {
    // Convertir texto en array
    alfa = alfa.split("\r\n");
    //console.log(alfa)
    // Limpiar espacios innecesarios
    for (let i=0; i<alfa.length; i++) {alfa[i]=alfa[i].trim()}
    // Convertir "Títulos" en "Títulos de tabla" y eliminar los que no coincidan
    let BDtitulos = leer(ruta_FilmAffinity);
    for (let i=0; i<alfa.length; i++) {
        let indice = BDtitulos.indexOf(alfa[i]);
        if (indice != -1) {
            alfa[i] = BDtitulos[indice+1]
            i=i+1
        } else {
            //console.log(alfa[i])
            alfa[i]=""
        }
        if (alfa[i-1] == "pais_origen") {
            //console.log(alfa[i])
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
    return beta
}