// Obtiene 'usuario' y 'cliente'
"use strict";

module.exports = async (req, res, next) => {
	// Variables
	let {usuario, cliente} = req.session;
	// res.clearCookie("cliente_id");
	// const visita={id:"V0000000012",fecha:"2024-09-22"}
	// res.cookie("cliente_id", "V0000000014", {maxAge: unDia * 30});
	// return
	// console.log(11, cliente);

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

		// Si no existe el usuario con ese mail, borra esa cookie
		if (!usuario) res.clearCookie("email");
	}

	// Cliente - 1. Usuario logueado: lo obtiene del usuario
	if (usuario && (!cliente || usuario.cliente_id != cliente.cliente_id)) {
		// Obtiene el cliente y eventualmente
		cliente = comp.obtieneCamposNecesarios(usuario);

		// Si corresponde, actualiza la cookie
		const {cliente_id} = cliente;
		if (!req.cookies.cliente_id || req.cookies.cliente_id != cliente_id)
			res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});
	}

	// Cliente - 2. Visita con cookie 'cliente_id': lo obtiene de esa cookie
	if (!cliente && req.cookies && req.cookies.cliente_id) {
		// Obtiene el cliente_id
		let {cliente_id} = req.cookies;

		// Obtiene el cliente
		let tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
		cliente = await baseDeDatos
			.obtienePorCondicion(tabla, {cliente_id}, "rolUsuario")
			.then((n) => (n ? comp.obtieneCamposNecesarios(n) : null));

		// Si el cliente no existe, elimina la cookie
		if (!cliente) res.clearCookie("cliente_id");
	}

	// Cliente - 3. Visita con cookie 'visita': lo obtiene de esa cookie, la borra y crea la cookie 'cliente'
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
				cliente = comp.obtieneCamposNecesarios(cliente);

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
			const datos = {versionElc: "1.10", mostrarCartelBienvenida: false, fechaUltNaveg: fechaCookie};
			cliente = await baseDeDatos.agregaRegistro("visitas", datos);
			cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => comp.obtieneCamposNecesarios(n));

			// Actualiza el cliente con el 'cliente_id'
			cliente_id = "V" + String(cliente.id).padStart(10, "0");
			cliente.cliente_id = cliente_id;
			baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id});
		}

		// Acciones con cookies
		res.clearCookie("visita");
		res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});
	}

	// Cliente - 4. Primera visita: lo crea
	if (!cliente) {
		// Crea el cliente
		cliente = await baseDeDatos.agregaRegistro("visitas", {versionElc});
		cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => comp.obtieneCamposNecesarios(n));

		// Crea el cliente_id y lo actualiza en la BD
		const cliente_id = "V" + String(cliente.id).padStart(10, "0");
		baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id});

		// Crea la cooke
		res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});

		// Actualiza variables
		cliente.cliente_id = cliente_id;
		req.session.clienteRecienCreado = true;
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

