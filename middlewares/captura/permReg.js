"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad_codigo = req.query.entidad;
	const entidad_id = req.query.id;
	const usuario = req.session.usuario;
	let informacion = {};
	// Variables - Registro
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad_codigo, entidad_id, "status_registro");
	let creado_en = registro.creado_en;
	if (creado_en) creado_en.setSeconds(0);
	let horarioDisponible = funciones.nuevoHorario(1, creado_en);
	horarioDisponible = funciones.horarioTexto(horarioDisponible);
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaTablero = variables.vistaTablero();


	// Agregar el icono y continuar
	if (informacion.mensajes) {
		informacion.iconos = [vistaAnterior];
		if (usuario.rol_usuario.aut_gestion_prod && registro.creado_por_id != usuario.id)
			informacion.iconos.push(vistaTablero);
		return res.render("CR9-Errores", {informacion});
	}
	next();
};
