"use strict";
// Requires

const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Condiciones a superar
	res.locals.usuario = req.session.usuario;
	if (req.session.usuario || !req.cookies || !req.cookies.email) return next(); // si ya tiene 'session' o no hay cookies, saltea la rutina

	// Obtiene los datos del usuario
	const usuario = await BD_especificas.obtieneUsuarioPorMail(req.cookies.email);
	if (!usuario) return next(); // si no existe el usuario, saltea la rutina
	procesos.actualizaElContadorDeLogins(usuario); // Notifica al contador de logins

	// Actualiza session, cookie y locals
	req.session.usuario = usuario;
	res.cookie("email", usuario.email, {maxAge: unDia});
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
		let novedades = novedadesELC.filter((n) => n.versionELC > usuario.versionElcUltimoLogin && n.versionELC <= versionELC);
		for (let novedad of novedades)
			for (let rol of roles)
				if (novedad[rol]) {
					mensajes.push(comp.fechaHora.fechaDiaMesAno(novedad.fecha) + " - " + novedad.comentario);
					break;
				}

		// Si hubieron novedades, genera la información
		if (mensajes.length)
			informacion = {
				mensajes,
				iconos: [variables.vistaEntendido(req.session.urlActual)],
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
