// Muestra carteles que se activan con el acceso al sitio (no se usa con apis)
"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	const {cliente} = req.session;
	const {cliente_id} = cliente;
	const tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
	let informacion;

	// Cartel de bienvenida
	if (!informacion && cliente.mostrarCartelBienvenida) {
		informacion = {
			mensajes: [
				"¡Bienvenido/a a nuestro sitio de Recomendación de Películas!",
				"Intentamos reunir todas las películas con valores afines a la Fe Católica.",
				"Queremos resolver el clásico problema de:<ul><li><em>No sé qué ver</em></li><li><em>Quiero ver una película que me deje algo bueno</em></li></ul>",
				"Si registrás un usuario y te logueás, podrás acceder a más beneficios.",
				"Usamos cookies para que tengas una mejor experiencia de usuario.",
			],
			iconos: [variables.vistaEntendido(req.session.urlActual)],
			titulo: "Te damos la Bienvenida",
			check: true,
		};

		// Actualiza la tabla usuario y la variable usuario
		baseDeDatos.actualizaTodosPorCondicion(tabla, {cliente_id}, {mostrarCartelBienvenida: false});
		cliente.mostrarCartelBienvenida = false;
	}

	// Cartel de novedades
	if (!informacion && cliente.versionElc != versionElc) {
		// Variables
		const permisos = ["permInputs", "autTablEnts", "revisorPERL", "revisorLinks", "revisorEnts", "revisorUs"];
		let novedades = novedadesELC.filter((n) => n.versionElc > cliente.versionElc && n.versionElc <= versionElc);

		// Si la novedad especifica un permiso que el cliente no tiene, se la descarta
		for (let i = novedades.length - 1; i >= 0; i--)
			for (let permiso of permisos)
				if (novedades[i][permiso] && !cliente.rolUsuario[permiso]) {
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
			};

		// Actualiza la versión en la tabla usuario y en la variable usuario
		baseDeDatos.actualizaPorCondicion(tabla, {cliente_id}, {versionElc});
		cliente.versionElc = versionElc;
	}

	// Cartel de beneficios

	// Se asegura de que el cliente ya no figure como 'recienCreado'
	// if (cliente.recienCreado) {
	// 	baseDeDatos.actualizaTodosPorCondicion(tabla, {cliente_id}, {recienCreado: false});
	// 	delete cliente.recienCreado;
	// }

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	return next();
};
