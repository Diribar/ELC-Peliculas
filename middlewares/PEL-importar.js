const path = require('path');
const funcionImportarPeliculas = require(path.join(__dirname, '../modelos/PEL-importar.js'));

module.exports =  (req,res,next) => {
    //console.log(req.body)
    let aux = req.body.comentario;
    if (aux != "") {
        aux = funcionImportarPeliculas(aux)
        //console.log(aux)
        req.body = {
            ...req.body,
            ...aux,
        };
        //console.log(req.body)
    };
    next();
}
