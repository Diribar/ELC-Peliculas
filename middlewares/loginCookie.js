const fs = require('fs');
const path = require('path');
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
const ruta_nombre = path.join(__dirname, '../bases_de_datos/tablas/usuarios.json');
let BD = leer(ruta_nombre);

module.exports = (req,res,next) => {
    // Uso de cookies para identificar al usuario
    if (!req.session.usuario) {
        let usuario = BD.find(n => n.email == req.cookies.email)
        if (usuario) {req.session.usuario = usuario}
    }

    //    return res.send(usuario)
    // Graba a Locals los datos del usuario
    if (req.session.usuario && !res.locals.usuario) {
        res.locals.usuario = req.session.usuario;
    };

    next();

}
