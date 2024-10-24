// Obtiene 'usuario' y 'cliente'
"use strict";

module.exports = async (req, res, next) => {
	// Si es una de las aplicaciones triviales, avanza
	if (entorno != "development") console.log(req.headers["user-agent"]);
	if (requestsTriviales.some((n) => req.headers["user-agent"].startsWith(n))) return next(); // si es una de las aplicaciones triviales
	if (!req.headers["user-agent"]) return next(); // si no se conoce el origen

	// Variables
	let {usuario, cliente} = req.session;

	// Si el 'cliente_id' tiene un valor y coincide en ambas variables, interrumpe la función
	if (usuario && cliente && usuario.cliente_id && usuario.cliente_id == cliente.cliente_id) {
		res.locals.usuario = usuario;
		return next();
	}

	// Obtiene el usuario de su cookie 'mail'
	if (!usuario && req.cookies && req.cookies.email) {
		// Obtiene el usuario
		const {email} = req.cookies;
		usuario = await comp.obtieneUsuarioPorMail(email);

		// Si existe el usuario, lleva a cero el campo 'diasSinCartelBenefs'
		if (usuario) {
			baseDeDatos.actualizaPorId("usuarios", usuario.id, {diasSinCartelBenefs: 0});
			usuario.diasSinCartelBenefs = 0;
		}
		// De lo contrario, borra esa cookie
		else res.clearCookie("email");
	}

	// Cliente - 1. Usuario logueado: lo obtiene del usuario
	if (usuario && (!cliente || usuario.cliente_id != cliente.cliente_id)) {
		// Obtiene el cliente
		cliente = obtieneCamposNecesarios(usuario);

		// Si corresponde, actualiza la cookie
		const {cliente_id} = cliente;
		if (!req.cookies.cliente_id || req.cookies.cliente_id != cliente_id)
			res.cookie("cliente_id", cliente_id, {maxAge: unAno});
	}

	// Cliente - 2. Visita con cookie 'visita': lo obtiene de esa cookie, la borra y crea la cookie 'cliente'
	if (!cliente && req.cookies && req.cookies.visita && req.cookies.visita.id) {
		// Obtiene el cliente_id
		let cliente_id = req.cookies.visita.id;
		const fechaCookie = req.cookies.visita.fecha;

		// Obtiene el cliente
		if (cliente_id.startsWith("U")) {
			// Obtiene el cliente
			cliente = await baseDeDatos.obtienePorCondicion("usuarios", {cliente_id}, "rolUsuario");

			// Acciones si el cliente existe
			if (cliente) {
				// Descarta los campos innecesarios
				cliente = obtieneCamposNecesarios(cliente);

				// Actualiza el cliente con la 'fechaUltNaveg'
				const fechaBD = cliente.fechaUltNaveg;
				const fechaMax = [fechaCookie, fechaBD].sort((a, b) => (a > b ? -1 : 1))[0];
				if (fechaBD < fechaMax) baseDeDatos.actualizaPorId("usuarios", cliente.id, {fechaUltNaveg: fechaMax});
				cliente.fechaUltNaveg = fechaMax;
			}
		}
		// Crea el cliente
		else {
			// Crea y obtiene el cliente
			const datos = {versionElc: "1.10", fechaUltNaveg: fechaCookie};
			cliente = await baseDeDatos.agregaRegistroIdCorrel("visitas", datos);
			cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));

			// Actualiza el cliente con el 'cliente_id'
			cliente_id = "V" + String(cliente.id).padStart(10, "0");
			cliente.cliente_id = cliente_id;
			await baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id}); // es crítico el 'await'
		}

		// Acciones con cookies
		res.clearCookie("visita");
		res.cookie("cliente_id", cliente_id, {maxAge: unAno});
	}

	// Cliente - 3. Visita con cookie 'cliente_id': lo obtiene de esa cookie
	if (!cliente && req.cookies && req.cookies.cliente_id) {
		// Obtiene el cliente_id
		const {cliente_id} = req.cookies;

		// Obtiene el cliente
		const tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
		cliente = await baseDeDatos
			.obtienePorCondicion(tabla, {cliente_id}, "rolUsuario")
			.then((n) => (n ? obtieneCamposNecesarios(n) : null));

		// Si el cliente no existe, elimina la cookie
		if (!cliente) res.clearCookie("cliente_id");
	}

	// Cliente - 4. Primera visita: lo crea
	if (!cliente) {
		// Crea el cliente
		cliente = await baseDeDatos.agregaRegistroIdCorrel("visitas", {versionElc});
		cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));

		// Crea el cliente_id y lo actualiza en la BD
		const cliente_id = "V" + String(cliente.id).padStart(10, "0");
		await baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id}); // es crítico el 'await'

		// Crea la cookie
		res.cookie("cliente_id", cliente_id, {maxAge: unAno});

		// Actualiza variables
		cliente.cliente_id = cliente_id;
		req.session.recienCreado = true;
	}

	// Actualiza usuario y cliente
	req.session.cliente = cliente;
	if (usuario) {
		req.session.usuario = usuario;
		res.locals.usuario = usuario;
	}

	// Fin
	return next();
};

const obtieneCamposNecesarios = (usuario) => {
	// Variables
	const camposNecesarios = [
		...["id", "cliente_id"], // identificación
		"fechaUltNaveg", // para el 'contador de navegaciones'
		...["diasNaveg", "visitaCreadaEn"], // para la tabla 'navegsPorDia'
		...["versionElc", "diasSinCartelBenefs"], // para mostrar carteles
		"rolUsuario", // para mostrar carteles
	];

	// Obtiene los datos para la variable cliente
	const cliente = {};
	for (const campo of camposNecesarios) cliente[campo] = usuario[campo];

	// Adecua el campo 'visitaCreadaEn'
	cliente.visitaCreadaEn = cliente.visitaCreadaEn.toISOString().slice(0, 10);

	// Fin
	return cliente;
};
