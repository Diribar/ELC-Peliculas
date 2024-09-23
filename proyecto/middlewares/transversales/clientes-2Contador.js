// Revisa si corresponde actualizar el contador (no se usa con apis)
"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	let {usuario, cliente} = req.session;
	let {cliente_id, fechaUltNaveg} = cliente;

	// Tareas diarias
	if (req.session.clienteRecienCreado || fechaUltNaveg < hoy) {
		// 'fechaUltNaveg'
		const tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
		baseDeDatos.actualizaTodosPorCondicion(tabla, {cliente_id}, {fechaUltNaveg: hoy});
		cliente.fechaUltNaveg = hoy;

		// Contador de clientes, y usuario en la BD
		const usuario_id = usuario ? usuario.id : null;
		contadorDePersonas(usuario_id, cliente_id);

		// Cookies
		if (usuario) res.cookie("email", usuario.email, {maxAge: unDia * 30});
		res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});

		// Session
		req.session.cliente = cliente;
		if (usuario) {
			req.session.usuario = usuario;
			res.locals.usuario = usuario;
		}
		delete req.session.clienteRecienCreado;
	}

	// Fin
	return next();
};

let contadorDePersonas = async (usuario_id, cliente_id) => {
	// Valida que no exista ya un registro del 'cliente_id' en esta fecha
	const condicion = {fecha: hoy, cliente_id};
	const existe = await baseDeDatos.obtienePorCondicion("clientesDelDia", condicion);

	// Si ya existe, interrumpe la función
	if (existe) return;

	// Agrega un registro en la tabla 'clientesDelDia'
	let datos = {...condicion};
	if (usuario_id) datos.usuario_id = usuario_id;
	baseDeDatos.agregaRegistro("clientesDelDia", datos);

	// Variables de usuario o visita
	const tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
	const id = await baseDeDatos.obtienePorCondicion(tabla, {cliente_id}).then((n) => n.id); // obtiene el id

	// Actualizaciones en el registro del cliente
	baseDeDatos.aumentaElValorDeUnCampo(tabla, id, "diasNaveg"); // aumenta el valor del campo 'diasNaveg'
	if (!usuario_id) baseDeDatos.aumentaElValorDeUnCampo(tabla, id, "diasSinCartelBenefs"); // si no está logueado, aumenta el valor del campo 'diasSinCartelBenefs'

	// Fin
	return;
};
