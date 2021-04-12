const fs = require('fs');
const path = require('path');
const ruta_FilmAffinity = path.join(__dirname, '../bases_de_datos/tablas/IMP_FilmAffinity.json');
const ruta_Wikipedia = path.join(__dirname, '../bases_de_datos/tablas/IMP_Wikipedia.json');
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

module.exports =  (req,res,next) => {
    //console.log(req.body)
    let alfa = req.body.comentario;
    if (alfa != "") {
        //aux = funcionImportarPeliculas(alfa)
    };
    next();
}
