// Muestra carteles que se activan con el acceso al sitio (no se usa con apis)
"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	const {usuario, cliente} = req.session;
	const {cliente_id} = cliente;
	const esUsuario = cliente_id.startsWith("U");
	const tabla = esUsuario ? "usuarios" : "visitas";
	let informacion;

	// Cartel de bienvenida
	if (!informacion && cliente.recienCreado) {
		informacion = {
			mensajes: [
				"¡Bienvenido/a a nuestro sitio de Recomendación de Películas!",
				"Intentamos reunir todas las películas con valores afines a la Fe Católica.",
				"Queremos resolver el clásico problema de:<ul><li><em>No sé qué ver</em></li><li><em>Quiero ver una película que me deje algo bueno</em></li></ul>",
				"Usamos cookies para que tengas una mejor experiencia de usuario.",
				"Con el ícono de la derecha podés crear un usuario, para acceder a más beneficios.",
			],
			iconos: [
				{...variables.vistaEntendido(req.session.urlActual), autofocus: true},
				{clase: "fa-user-plus amarillo", link: "/usuarios/alta-mail", titulo: "Crear un usuario"},
			],
			titulo: "Te damos la Bienvenida",
			check: true,
		};

		// Actualiza la tabla usuario y la variable usuario
		baseDeDatos.actualizaPorCondicion(tabla, {cliente_id}, {recienCreado: false});
		cliente.recienCreado = false;
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
	if (!informacion && cliente.diasSinCartelBenefs >= 10) {
		// Cliente sin login
		if (!usuario) {
			// Opciones si es un usuario
			if (esUsuario)
				informacion = {
					iconos: [
						{...variables.vistaEntendido(req.session.urlActual), autofocus: true},
						{clase: "fa-circle-user amarillo", link: "/usuarios/login", titulo: "Ir a login"},
					],
					titulo: "Beneficios de loguearte",
				};
			// Opciones si es una visita
			else
				informacion = {
					iconos: [
						{...variables.vistaEntendido(req.session.urlActual), autofocus: true},
						{clase: "fa-user-plus amarillo", link: "/usuarios/alta-mail", titulo: "Crear un usuario"},
					],
					titulo: "Beneficios de crear un usuario",
				};
			informacion.mensajes = [
				"Marcar tus preferencias por película<ul><li>la quiero ver</li><li>ya la vi</li><li>no me interesa</li></ul>",
				"Ver mis últimas películas consultadas",
				"Ver tus preferencias en distintos dispositivos (ej: mobil y laptop)",
			];
		}
		// Usuario sin completar
		else
			informacion = {
				mensajes: mensajeAptoInput,
				iconos: [
					{...variables.vistaEntendido(req.session.urlActual), autofocus: true},
					{clase: "fa-circle-user amarillo", link: "/usuarios/perennes", titulo: "Obtener el rol 'Apto Input'"},
				],
				titulo: "Beneficios del rol 'Apto Input'",
			};
		informacion.trabajando = true;

		// Actualiza la tabla usuario y la variable usuario
		baseDeDatos.actualizaPorCondicion(tabla, {cliente_id}, {diasSinCartelBenefs: 0});
		cliente.diasSinCartelBenefs = 0;
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	return next();
};
