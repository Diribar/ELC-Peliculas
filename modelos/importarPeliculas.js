const fs = require('fs');
const path = require('path')
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
const ruta_nombre_importar = path.join(__dirname, '../bases_de_datos/tablas/importarPeliculas.json');

module.exports = (alfa) => {
    // Convertir texto en array
    beta = alfa.split("\r\n");
    beta.unshift("Título en castellano")
    //return res.send(beta)
    // Limpiar espacios innecesarios
    for (let i=0; i<beta.length; i++) {beta[i]=beta[i].trim()}
    // Convertir "Títulos de vista" en "Títulos de tabla" y eliminar los que no coincidan
    let BDtitulos = leer(ruta_nombre_importar);
    for (let i=0; i<beta.length; i=i+2) {
        let indice = BDtitulos.indexOf(beta[i]);
        if (indice != -1) {
            beta[i] = BDtitulos[indice+1]
        } else {
            beta[i]=""
            beta[i+1]=""
        }
    }
    // Limpiar campos vacíos
    beta = beta.filter(n => {return n != ""})
    // Convertir array en JSON
    let gama="{"
    for (let i=0; i < alfa.length; i=i+2) {
        if (i>0) {gama=gama + ', '}
        gama = gama + '"'+ alfa[i] + '": "' + alfa[i+1] + '"';
    }
    gama = gama + "}"
    // Convertir JSON en objeto
    gama = JSON.parse(gama)
    return gama
}