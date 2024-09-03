"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Si no hay cookies, interrumpe la rutina
	let usuario = req.session.usuario;
	if (!usuario && (!req.cookies || !req.cookies.email)) return next();

	// Si no existe el mail, borra el cookie e interrumpe la rutina
	if (!usuario) usuario = await comp.obtieneUsuarioPorMail(req.cookies.email);
	if (!usuario) {
		res.clearCookie("email"); // borra el mail de cookie
		return next(); // interrumpe la rutina
	}

	// Acciones si la fecha del último login != hoy
	const hoy = new Date().toISOString().slice(0, 10);
	if (usuario.fechaUltimoLogin != hoy) {
		usuario = await procesos.actualizaElContadorDeLogins(usuario, hoy); // actualiza el contador de logins
		res.cookie("email", usuario.email, {maxAge: unDia * 30}); // una vez por día, actualiza el mail en la cookie
		req.session.usuario = usuario;
	}

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
				//ol: novedades.length > 2, // si son más de 2 novedades, las enumera
			};

		// Actualiza la versión en el usuario y la variable usuario
		baseDeDatos.actualizaPorId("usuarios", usuario.id, {versionElcUltimoLogin: versionELC});
		usuario.versionElcUltimoLogin = versionELC;
		req.session.usuario = usuario;
	}

	// Actualiza locals
	res.locals.usuario = usuario;

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else return next();
};
