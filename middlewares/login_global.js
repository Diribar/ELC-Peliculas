const registro = require('../modelos/Registro');

module.exports = (req,res,next) => {
    res.locals.logueado = false

    // Uso de cookies para identificar al usuario
    let email_en_cookie = req.cookies.email;
    let usuario_de_cookie = Registro.encontrar_por_campo('email', email_en_cookie)
    if (usuario_de_cookie) {req.session.usuarioLogueado = usuario_de_cookie}

    // Graba a Locals los datos del usuario
    if (req.session.usuarioLogueado) {
        res.locals.logueado = true;
        res.locals.usuarioLogueado = req.session.usuarioLogueado;
    };       

    next();
}
