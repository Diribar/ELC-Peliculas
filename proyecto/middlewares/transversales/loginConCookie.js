"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	const hoy = new Date().toISOString().slice(0, 10);
	let cliente_id, tabla, actCookieCliente_id, clienteRecienCreado;

	// 1.A. Cliente - Lo obtiene de session
	let {cliente} = req.session;
	if (cliente) cliente_id = cliente.cliente_id;

	// 1.B. Cliente - Si no pudo, lo obtiene de cookies
	if (!cliente_id && req.cookies && req.cookies.cliente_id) {
		// Obtiene el cliente
		const {cliente_id} = req.cookies;
		if (cliente_id) {
			tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
			cliente = await baseDeDatos.obtienePorCondicion(tabla, {cliente_id}).then((n) => obtieneCamposNecesarios(n));
		}

		// Valida que exista y en caso contrario elimina la cookie
		cliente_id = cliente ? cliente.cliente_id : null;
		if (!cliente_id) res.clearCookie("cliente_id"); // borra el cookie
	}

	// 1.C. Cliente - Si no existe, lo crea
	if (!cliente_id) {
		// Crea el cliente
		cliente = await baseDeDatos.agregaRegistro("visitas", {versionELC}).then((n) => obtieneCamposNecesarios(n));

		// Crea el cliente_id y lo actualiza en la BD
		cliente_id = "V" + String(cliente.id).padStart(10, "0");
		baseDeDatos.actualizaPorId("visitas", cliente.id, {cliente_id});

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

		// C. Elimina el registro de la visita
		baseDeDatos.eliminaPorId("visitas", cliente.id);

		// D. Obtiene el cliente del usuario
		cliente = await baseDeDatos.obtienePorId("usuarios", usuario.id).then((n) => obtieneCamposNecesarios(n));
		if (usuario.fechaUltNaveg < fechaMax && !clienteRecienCreado) {
			cliente.fechaUltNaveg = fechaMax;
			baseDeDatos.actualizaPorId("usuarios", usuario.id, {fechaUltNaveg: fechaMax});
		} else clienteRecienCreado = false; // el contador solamente se actualizará según la fecha del usuario

		// E. Actualiza variables
		cliente_id = cliente.cliente_id;
		actCookieCliente_id = true;
	}

	// 4. Actualiza el contador de clientes
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
	if (actCookieCliente_id) res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30}); // cookie 'cliente_id'

	// Cartel de bienvenida


	// Acciones si el cliente tiene una versión distinta de la actual
	let informacion;
	if (cliente && cliente.versionElc != versionELC) {
		// Variables
		const permisos = ["permInputs", "autTablEnts", "revisorPERL", "revisorLinks", "revisorEnts", "revisorUs"];
		let novedades = novedadesELC.filter((n) => n.versionELC > cliente.versionElc && n.versionELC <= versionELC);
		for (let i = novedades.length - 1; i >= 0; i--)
			// Si la novedad especifica un permiso que el cliente no tiene, se la descarta
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
				//ol: novedades.length > 2, // si son más de 2 novedades, las enumera
			};

		// Actualiza la versión en el usuario y la variable usuario
		baseDeDatos.actualizaPorCondicion(tabla, {cliente_id}, {versionELC});
		cliente.versionElc = versionELC;
	}

	// Actualiza session y locals
	if (usuario) {
		req.session.usuario = usuario;
		res.locals.usuario = usuario;
	}

	// Actualiza visita
	req.session.cliente = cliente;

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	return next();
};

let eliminaDuplicados = async (usuario_id) => {
	// Obtiene los registros
	const registros = await baseDeDatos.obtieneTodosPorCondicion("clientesDelDia", {usuario_id});
	console.log();

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

		// Aumenta el valor del campo 'diasLogin' en el usuario
		if (usuario_id) baseDeDatos.aumentaElValorDeUnCampo("usuarios", usuario_id, "diasLogin");
	}

	// Fin
	return;
};
let obtieneCamposNecesarios = (usuario) => {
	// Variables
	const camposNecesarios = [
		"cliente_id", // para la vinculación
		"versionElc", // para las novedades
		"fechaUltNaveg", // para el contador de 'clientes x día'
		"rolUsuario_id", // para las novedades
		"diasSinCartelBeneficios", // para mostrar el cartel
	];

	// Obtiene los datos para la variable cliente
	let cliente = {};
	for (let campo of camposNecesarios) cliente[campo] = usuario[campo];

	// Fin
	return cliente;
};
