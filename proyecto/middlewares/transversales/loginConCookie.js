"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	const hoy = new Date().toISOString().slice(0, 10);
	let cliente_id, tabla, actCookieCliente_id, eliminarCookieVisita, clienteRecienCreado;

	// 1.A. Cliente - Lo obtiene de 'session'
	let {cliente} = req.session;
	if (cliente) cliente_id = cliente.cliente_id;

	// 1.B. Cliente - Si no pudo, lo obtiene de la cookie 'visita'
	if (!cliente_id && req.cookies && req.cookies.visita && req.cookies.visita.id) {
		// Obtiene el cliente_id
		cliente_id = req.cookies.visita.id;
		const fechaUltNaveg = req.cookies.visita.fecha;

		// Obtiene el cliente
		if (cliente_id.startsWith("U")) {
			// Obtiene el cliente
			cliente = await baseDeDatos
				.obtienePorCondicion("usuarios", {cliente_id}, "rolUsuario")
				.then((n) => obtieneCamposNecesarios(n));

			// Actualiza el cliente con la 'fechaUltNaveg'
			cliente.fechaUltNaveg = fechaUltNaveg;
			baseDeDatos.actualizaPorId("usuarios", cliente.id, {fechaUltNaveg});
		}
		// Crea el cliente
		else {
			// Crea y obtiene el cliente
			const datos = {versionElc: "1.10", mostrarCartelBienvenida: false, fechaUltNaveg};
			cliente = await baseDeDatos.agregaRegistro("visitas", datos);
			cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));

			// Actualiza el cliente con el 'cliente_id'
			cliente_id = "V" + String(cliente.id).padStart(10, "0");
			cliente.cliente_id = cliente_id;
			baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id});
		}

		// Variables
		actCookieCliente_id = true;
		eliminarCookieVisita = true;
	}

	// 1.C. Cliente - Si no pudo, la obtiene de la cookie 'cliente'
	if (!cliente_id && req.cookies && req.cookies.cliente_id) {
		// Obtiene el cliente_id
		cliente_id = req.cookies.cliente_id;

		// Obtiene el cliente
		if (cliente_id) {
			tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
			cliente = await baseDeDatos
				.obtienePorCondicion(tabla, {cliente_id}, "rolUsuario")
				.then((n) => obtieneCamposNecesarios(n));

			// Valida que el cliente exista
			cliente_id = cliente ? cliente.cliente_id : null;
		}

		// Si el cliente no existe, elimina la cookie
		if (!cliente_id) res.clearCookie("cliente_id");
	}

	// 1.D. Cliente - Si no existe, lo crea
	if (!cliente_id) {
		// Crea el cliente
		cliente = await baseDeDatos.agregaRegistro("visitas", {versionElc})
		cliente = await baseDeDatos.obtienePorId("visitas", cliente.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));

		// Crea el cliente_id y lo actualiza en la BD
		cliente_id = "V" + String(cliente.id).padStart(10, "0");
		baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id, versionElc});

		// Actualiza variables
		cliente.cliente_id = cliente_id;
		clienteRecienCreado = true;
	}

	// 2. Temas con el usuario - Hace lo posible por obtenerlo
	let {usuario} = req.session;
	if (!usuario && req.cookies && req.cookies.email) {
		// obtiene el usuario
		const {email} = req.cookies;
		usuario = await comp.obtieneUsuarioPorMail(email);
		return res.send(["123", email]);

		// borra el mail de cookie
		if (!usuario) res.clearCookie("email");
	}

	// 3. Acciones si el 'cliente_id' es diferente
	if (usuario && usuario.cliente_id != cliente.cliente_id) {
		// A. Actualiza la tabla 'clientesDelDia'
		const condicion = {cliente_id: cliente.cliente_id};
		const datos = {usuario_id: usuario.id, cliente_id: usuario.cliente_id};
		await baseDeDatos
			.actualizaTodosPorCondicion("clientesDelDia", condicion, datos)
			.then(() => eliminaDuplicados(usuario.id)); // pudo haber estado creado por usuario

		// B. Obtiene la fecha máxima
		const fechaMax = [usuario.fechaUltNaveg, cliente.fechaUltNaveg].sort((a, b) => (a > b ? -1 : 1))[0];
		const versionMax = [usuario.versionElc, cliente.versionElc].sort((a, b) => (a > b ? -1 : 1))[0];

		// C. Elimina el registro de la visita
		baseDeDatos.eliminaPorId("visitas", cliente.id);

		// D. Obtiene el cliente a partir del usuario
		cliente = await baseDeDatos.obtienePorId("usuarios", usuario.id, "rolUsuario").then((n) => obtieneCamposNecesarios(n));
		if (usuario.fechaUltNaveg < fechaMax && !clienteRecienCreado) {
			// Variables
			fechaUltNaveg = fechaMax;
			versionElc = versionMax;

			// Actualiza el cliente y la tabla
			cliente = {...cliente, fechaUltNaveg, versionElc}; // se toman los valores de la visita
			baseDeDatos.actualizaPorId("usuarios", usuario.id, {fechaUltNaveg: fechaMax});
		}
		// El contador solamente se actualizará según la fecha del usuario
		else clienteRecienCreado = false;

		// E. Actualiza variables
		cliente_id = cliente.cliente_id;
		actCookieCliente_id = true;
	}

	// 4. Tareas diarias
	if (clienteRecienCreado || cliente.fechaUltNaveg != hoy) {
		// Actualiza variables
		cliente.fechaUltimNaveg = hoy;
		actCookieCliente_id = true;

		// Actualiza el registro del cliente en la BD
		tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
		baseDeDatos.actualizaPorCondicion(tabla, {cliente_id}, {fechaUltNaveg: hoy});

		// Actualización diaria
		if (usuario) res.cookie("email", usuario.email, {maxAge: unDia * 30});

		// Actualiza el contador de personas, y el usuario en la BD
		const usuario_id = usuario ? usuario.id : null;
		contadorDePersonas(usuario_id, cliente_id, hoy);
	}

	// 5. Actualiza las cookie del cliente
	if (actCookieCliente_id) res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30}); // cookie 'cliente_id'
	if (eliminarCookieVisita) res.clearCookie("visita");

	// Actualiza usuario y cliente
	if (usuario) {
		req.session.usuario = usuario;
		res.locals.usuario = usuario;
	}
	req.session.cliente = cliente;

	// Fin
	return next();
};

let eliminaDuplicados = async (usuario_id) => {
	// Obtiene los registros
	const registros = await baseDeDatos.obtieneTodosPorCondicion("clientesDelDia", {usuario_id});

	// Elimina los duplicados
	registros.forEach((registro, contador) => {
		if (contador && registro.fecha == registros[contador - 1].fecha) baseDeDatos.eliminaPorId("clientesDelDia", registro.id);
	});

	// Fin
	return;
};
let contadorDePersonas = async (usuario_id, cliente_id, hoy) => {
	// Valida que no exista ya un registro del 'cliente_id' en esta fecha
	const condicion = {fecha: hoy, cliente_id};
	const existe = await baseDeDatos.obtienePorCondicion("clientesDelDia", condicion);

	// Acciones si no existe
	if (!existe) {
		// Agrega un registro en la tabla 'clientesDelDia'
		let datos = {...condicion};
		if (usuario_id) datos.usuario_id = usuario_id;
		baseDeDatos.agregaRegistro("clientesDelDia", datos);

		// Variables de usuario o visita
		const esUsuario = cliente_id.startsWith("U");
		const tabla = esUsuario ? "usuarios" : "visitas";
		const id = await obtienePorCondicion(tabla, {cliente_id}).then((n) => n.id); // obtiene el id

		// Actualizaciones en el registro del cliente
		baseDeDatos.aumentaElValorDeUnCampo(tabla, id, "diasNaveg"); // aumenta el valor del campo 'diasNaveg'
		if (!usuario_id) baseDeDatos.aumentaElValorDeUnCampo(tabla, id, "diasSinCartelBenefs"); // si no está logueado, aumenta el valor del campo 'diasSinCartelBenefs'
	}

	// Fin
	return;
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
