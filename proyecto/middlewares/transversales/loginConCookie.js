"use strict";
// Requires

const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	let usuario = req.session.usuario;
	res.locals.usuario = usuario;

	// Si ya tiene session, actualiza el contador y saltea la rutina
	if (usuario) {
		if (usuario.fechaUltimoLogin != new Date().toISOString().slice(0, 10))
			req.session.usuario = procesos.actualizaElContadorDeLogins(usuario); // Actualiza el contador de logins
		return next();
	}

	// Si no hay cookies, saltea la rutina
	if (!req.cookies || !req.cookies.email) return next();

	// Obtiene los datos del usuario
	usuario = await BD_especificas.obtieneUsuarioPorMail(req.cookies.email);
	if (!usuario) return next(); // si no existe el usuario, saltea la rutina

	// Notifica al contador de logins y actualiza session, cookie y locals
	usuario = procesos.actualizaElContadorDeLogins(usuario);
	req.session.usuario = usuario;
	res.cookie("email", usuario.email, {maxAge: unDia * 30});
	res.locals.usuario = usuario;

	// Acciones si cambió la versión
	let informacion;
	if (usuario.versionElcUltimoLogin != versionELC) {
		// Variables
		const permisos = ["permInputs", "autTablEnts", "revisorPERL", "revisorLinks", "revisorEnts", "revisorUs"];
		let novedades = novedadesELC.filter((n) => n.versionELC > usuario.versionElcUltimoLogin && n.versionELC <= versionELC);
		for (let i = novedades.length - 1; i >= 0; i--)
			// Si la novedad especifica un permiso que el usuario no tiene, se la descarta
			for (let permiso of permisos)
				if (novedades[i][permiso] && !usuario.rolUsuario[permiso]) {
					novedades.splice(i, 1);
					break;
				}

		// Si hubieron novedades, genera la información
		if (novedades.length)
			informacion = {
				mensajes: novedades.map((n) => n.comentario),
				iconos: [variables.vistaEntendido(req.originalUrl)],
				titulo: "Novedad" + (novedades.length > 1 ? "es" : "") + " del sitio",
				check: true,
				ol: novedades.length > 2, // si son más de 2 novedades, las enumera
			};

		// Actualiza la versión en el usuario
		BD_genericas.actualizaPorId("usuarios", usuario.id, {versionElcUltimoLogin: versionELC});
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else return next();
};
