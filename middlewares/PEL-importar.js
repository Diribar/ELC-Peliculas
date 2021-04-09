const path = require('path');
const funcionImportarPeliculas = require(path.join(__dirname, '../modelos/PEL-importar.js'));

module.exports =  (req,res,next) => {
    let aux = req.body.comentario;
    if (aux != "") {
        aux = funcionImportarPeliculas(aux)
        req.body = {
            ...req.body,
            ...aux,
        };
        req.body.comentario = "";
    };
    next();
}
