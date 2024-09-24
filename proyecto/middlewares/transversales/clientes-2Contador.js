// Revisa si corresponde actualizar el contador (no se usa con apis)
"use strict";

module.exports = async (req, res, next) => {
	// Si corresponde, interrumpe la función
	if (req.originalUrl.includes("/api/")) return next();

	// Variables
	let {usuario, cliente} = req.session;
	let {cliente_id, fechaUltNaveg} = cliente;
	const tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";

	// Si corresponde, interrumpe la función
	if (!req.session.clienteRecienCreado && fechaUltNaveg == hoy) return next();

	// Actualiza 'fechaUltNaveg' en la tabla 'usuarios/visitas' y en la variable 'cliente'
	baseDeDatos.actualizaTodosPorCondicion(tabla, {cliente_id}, {fechaUltNaveg: hoy});
	cliente.fechaUltNaveg = hoy;

	// Contador de clientes
	const usuario_id = usuario ? usuario.id : null;
	contadorDeClientes(usuario_id, cliente);

	// Actualiza cookies
	if (usuario) res.cookie("email", usuario.email, {maxAge: unDia * 30});
	res.cookie("cliente_id", cliente_id, {maxAge: unDia * 30});

	// Actualiza session
	req.session.cliente = cliente;
	if (usuario) {
		req.session.usuario = usuario;
		res.locals.usuario = usuario;
	}
	delete req.session.clienteRecienCreado;

	// Fin
	return next();
};

let contadorDeClientes = async (usuario_id, cliente) => {
	// Variables
	const {cliente_id, diasNaveg, visitaCreadaEn} = cliente;

	// Valida que no exista ya un registro del 'cliente_id' en esta fecha
	const condicion = {fecha: hoy, cliente_id};
	const existe = await baseDeDatos.obtienePorCondicion("navegsDelDia", condicion);

	// Si ya existe, interrumpe la función
	if (existe) return;

	// Agrega un registro en la tabla 'navegsDelDia'
	let datos = {...condicion};
	if (usuario_id) datos.usuario_id = usuario_id;
	baseDeDatos.agregaRegistro("navegsDelDia", datos);

	// Variables de usuario o visita
	const tabla = cliente_id.startsWith("U") ? "usuarios" : "visitas";
	const id = await baseDeDatos.obtienePorCondicion(tabla, {cliente_id}).then((n) => n.id); // obtiene el id

	// Actualizaciones en el registro del cliente
	baseDeDatos.aumentaElValorDeUnCampo(tabla, id, "diasNaveg"); // aumenta el valor del campo 'diasNaveg'
	if (!usuario_id) baseDeDatos.aumentaElValorDeUnCampo(tabla, id, "diasSinCartelBenefs"); // si no está logueado, aumenta el valor del campo 'diasSinCartelBenefs'

	// Fin
	return;
};
