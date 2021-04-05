const fs = require('fs');
const path = require('path');
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
const ruta_nombre = path.join(__dirname, '../bases_de_datos/tablas/usuarios.json');
let BD = leer(ruta_nombre);

module.exports = (req,res,next) => {
    // Uso de cookies para identificar al usuario
    if (!req.session.usuario) {
        let email = req.cookies.email;
        let usuario = BD.find(n => n.email == email)
        if (usuario) {req.session.usuario = usuario}
    }
    // Graba a Locals los datos del usuario
    if (req.session.usuario) {
        res.locals.logueado = true;
        res.locals.usuario = req.session.usuario;
    } else {
        res.locals.logueado = false
    };       
    next();
}
