const usuarios = require('../modelos/usuarios');

module.exports = (req,res,next) => {
    //res.locals.logueado = false

    // Uso de cookies para identificar al usuario
    //let email_en_cookie = req.cookies.email;
    //let usuario_de_cookie = usuarios.encontrar_por_campo('email', email_en_cookie)
    //if (usuario_de_cookie) {req.session.usuario = usuario_de_cookie}

    // Graba a Locals los datos del usuario
    //if (req.session.usuario) {
    //    res.locals.logueado = true;
    //    res.locals.usuario = req.session.usuario;
    //};       
    next();
}
