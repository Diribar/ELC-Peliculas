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
	let mensajes = [];
	let informacion;
	if (usuario.versionElcUltimoLogin != versionELC) {
		// Obtiene los roles del usuario
		let roles = ["permInputs", "autTablEnts", "revisorPERL", "revisorLinks", "revisorEnts", "revisorUs"];
		for (let i = roles.length - 1; i >= 0; i--) {
			let rol = roles[i];
			if (!usuario.rolUsuario[rol]) roles.splice(i, 1);
		}

		// Obtiene las novedades
		const novedades = novedadesELC.filter((n) => n.versionELC > usuario.versionElcUltimoLogin && n.versionELC <= versionELC);
		for (let novedad of novedades)
			for (let rol of roles)
				if (novedad[rol]) {
					mensajes.push(novedad.comentario);
					break;
				}

		// Si hubieron novedades, genera la información
		if (mensajes.length)
			informacion = {
				mensajes,
				iconos: [variables.vistaEntendido(req.originalUrl)],
				titulo: "Novedades del sitio:",
				check: true,
			};

		// Actualiza la versión en el usuario
		BD_genericas.actualizaPorId("usuarios", usuario.id, {versionElcUltimoLogin: versionELC});
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else return next();
};
