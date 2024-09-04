"use strict";
// Requires
const procesos = require("../../rutas_y_contrs/1.1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	const hoy = new Date().toISOString().slice(0, 10);

	// Obtiene visita
	let {visita} = req.session.visita ? req.session : req.cookies.visita ? req.cookies : {visita: null};
	if (!visita || !visita.id)
		visita = {
			id: "V" + String(parseInt(Math.random() * Math.pow(10, 10))).padStart(10, "0"),
			fecha: hoy,
			recienCreada: true,
		};

	// Hace lo posible por conseguir el usuario
	let {usuario} = req.session;
	if (!usuario && req.cookies && req.cookies.email) {
		usuario = await comp.obtieneUsuarioPorMail(req.cookies.email); // obtiene el usuario
		if (!usuario) res.clearCookie("email"); // borra el mail de cookie
	}

	// Actualización del 'id' de la visita
	const actualizarContPers = visita.fecha != hoy || visita.recienCreada || (usuario && usuario.fechaUltimoLogin != hoy);
	if (usuario && visita.id != usuario.visita_id) {
		// Variables
		const condicion = {fecha: hoy, visita_id: visita.id};
		const {visita_id} = usuario;
		const usuario_id = usuario.id;

		// Actualizaciones
		visita.id = visita_id; // variable 'visita'
		await baseDeDatos.actualizaTodosPorCondicion("loginsDelDia", condicion, {usuario_id, visita_id}); // tabla 'loginDelDia'
		if (!actualizarContPers) res.cookie("visita", visita, {maxAge: unDia * 30}); // cookie 'visita'
	}

	// Acciones si alguna de las fechas es distinta a hoy o la visita está recién creada
	if (actualizarContPers) {
		// Temas de visita
		visita.fecha = hoy;
		delete visita.recienCreada;
		res.cookie("visita", visita, {maxAge: unDia * 30}); // actualiza el cookie de la visita una vez al día

		// Temas de usuario
		if (usuario) {
			usuario.fechaUltimoLogin = hoy; // usuario
			res.cookie("email", usuario.email, {maxAge: unDia * 30}); // actualiza el cookie de mail una vez al día
		}

		// Actualiza el contador de logins
		const usuario_id = usuario ? usuario.id : null;
		await procesos.contadorDePersonas(usuario_id, visita.id, hoy);
	}

	// Acciones si el usuario tiene una versión distinta de la actual
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

	// Actualiza visita
	req.session.visita = visita;

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	return next();
};
