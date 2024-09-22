// Obtiene 'usuario' y 'cliente'
"use strict";

module.exports = async (req, res, next) => {
	// Variables
	let {usuario, cliente} = req.session;

	// Si el 'cliente_id' tiene un valor y coincide en ambas variables, interrumpe la función
	if (usuario && cliente && usuario.cliente_id && usuario.cliente_id == cliente.cliente_id) return next();

	// Usuario - lo obtiene de la cookie
	if (!usuario && req.cookies && req.cookies.email) {
		// Obtiene el usuario
		const {email} = req.cookies;
		usuario = await comp.obtieneUsuarioPorMail(email);

		// Si no existe el usuario con ese mail, borra esa cookie
		if (!usuario) res.clearCookie("email");
	}

	// Cliente - 1. Lo obtiene del usuario
	if (usuario && (!cliente || usuario.cliente_id != cliente.cliente_id)) {
		// Obtiene el cliente
		cliente = obtieneCamposNecesarios(usuario);
		let cliente_id = cliente.cliente_id;

		// Acciones si no existe el cliente_id
		if (!cliente_id) {
			// Crea el cliente_id y lo actualiza en la BD
			cliente_id = "U" + String(cliente.id).padStart(10, "0");
			baseDeDatos.actualizaPorId("usuarios", cliente.id, {cliente_id});

			// Actualiza variables
			cliente.cliente_id = cliente_id;
		}
	}

	// Cliente - 2. Lo obtiene de la cookie 'visita'
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

				// Fecha máxima
				const fechaBD = cliente.fechaUltNaveg;
				const fechaMax = [fechaCookie, fechaBD].sort((a, b) => (a > b ? -1 : 1))[0];

				// Actualiza el cliente con la 'fechaUltNaveg'
				if (fechaBD < fechaMax) baseDeDatos.actualizaPorId("usuarios", cliente.id, {fechaUltNaveg: fechaMax});
				cliente.fechaUltNaveg = fechaMax;
			}
		}
		// Crea el cliente
		else {
			// Crea y obtiene el cliente
			const datos = {versionElc: "1.10", mostrarCartelBienvenida: false, fechaUltNaveg: fechaCookie};
			cliente = await baseDeDatos.agregaRegistro("visitas", datos);
			cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));

			// Actualiza el cliente con el 'cliente_id'
			cliente_id = "V" + String(cliente.id).padStart(10, "0");
			cliente.cliente_id = cliente_id;
			baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id});
		}

		// Acciones con cookies
		res.clearCookie("visita");
		res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});
	}

	// Cliente - 3. La obtiene de la cookie 'cliente'
	if (!cliente && req.cookies && req.cookies.cliente_id) {
		// Obtiene el cliente_id
		let {cliente_id} = req.cookies;

		// Obtiene el cliente
		let tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
		cliente = await baseDeDatos
			.obtienePorCondicion(tabla, {cliente_id}, "rolUsuario")
			.then((n) => (n ? obtieneCamposNecesarios(n) : null));

		// Si el cliente no existe, elimina la cookie
		if (!cliente) res.clearCookie("cliente_id");
	}

	// Cliente - 4- Si no existe, lo crea
	if (!cliente) {
		// Crea el cliente
		cliente = await baseDeDatos.agregaRegistro("visitas", {versionElc});
		cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));

		// Crea el cliente_id y lo actualiza en la BD
		const cliente_id = "V" + String(cliente.id).padStart(10, "0");
		baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id});

		// Actualiza variables
		cliente.cliente_id = cliente_id;
		req.session.clienteRecienCreado = true;
	}

	// Actualiza usuario y cliente
	if (usuario) {
		req.session.usuario = usuario;
		res.locals.usuario = usuario;
	}
	req.session.cliente = cliente;

	// Fin
	return next();
};

let obtieneCamposNecesarios = (usuario) => {
	// Variables
	const camposNecesarios = [
		"id",
		"cliente_id", // para la vinculación
		"versionElc", // para las novedades
		"fechaUltNaveg", // para el contador de 'clientes x día'
		"diasSinCartelBenefs", // para mostrar el cartel
		"rolUsuario", // para las novedades
	];

	// Obtiene los datos para la variable cliente
	let cliente = {};
	for (let campo of camposNecesarios) cliente[campo] = usuario[campo];

	// Fin
	return cliente;
};
