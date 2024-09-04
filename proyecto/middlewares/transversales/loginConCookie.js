"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	let {usuario, visita} = req.session;
	const hoy = new Date().toISOString().slice(0, 10);

	// Acciones si no está logueado como usuario y hay cookie de mail
	if (!usuario && req.cookies && req.cookies.email) {
		// Obtiene el usuario
		usuario = await comp.obtieneUsuarioPorMail(req.cookies.email);

		// Acciones si no se encuentra el usuario a partir del mail
		if (!usuario) {
			res.clearCookie("email"); // borra el mail de cookie
			if (!visita) visita = req.cookies.visita;
			if (!visita) {
				visita = {
					id: "v" + parseInt(Math.random() * Math.pow(10, 10)).padStart(10, "0"),
					fecha: hoy,
					recienCreado: true,
				};
			}
		}
	}

	// Acciones si (la fecha del usuario es distinta a hoy) o (la fecha de visita es distinta a hoy o está recién creada)
	if ((usuario && usuario.fechaUltimoLogin != hoy) || (visita && (visita.fecha != hoy || visita.recienCreado))) {
		await procesos.actualizaElContadorDeLogins({usuario, visita, hoy}); // actualiza el contador de logins
		if (usuario) {
			usuario.fechaUltimoLogin = hoy;
			res.cookie("email", usuario.email, {maxAge: unDia * 30}); // una vez por día, actualiza el mail en la cookie
			res.cookie("visita", {id: usuario.visita_id, fecha: hoy}, {maxAge: unDia * 30}); // una vez por día, actualiza la visita en la cookie
		}
		if (visita) {
			visita.fecha = hoy;
			delete visita.recienCreado;
			res.cookie("visita", visita, {maxAge: unDia * 30}); // una vez por día, actualiza la visita en la cookie
		}
	}

	// Acciones si cambió la versión
	let informacion;
	if (usuario && usuario.versionElcUltimoLogin != versionELC) {
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
	}

	// Actualiza session y locals
	if (usuario) {
		req.session.usuario = usuario;
		res.locals.usuario = usuario;
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	return next();
};
