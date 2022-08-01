"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad_codigo = req.query.entidad;
	const entidad_id = req.query.id;
	const haceUnaHora = funciones.nuevoHorario(-1);
	let ruta = req.baseUrl;
	let informacion = {};
	// Variables - Registro
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad_codigo, entidad_id, "status_registro");
	let creado_en = registro.creado_en;
	if (creado_en) creado_en.setSeconds(0);
	let horarioDisponible = funciones.nuevoHorario(creado_en, 1);
	horarioDisponible = funciones.horarioTexto(horarioDisponible);
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaTablero = variables.vistaTablero();

	// PROBLEMA: El registro todavía está en manos de su creador
	if (ruta == "/revision" && creado_en > haceUnaHora)
		informacion.mensajes = ["El registro estará disponible para su revisión el " + horarioDisponible];
	// PROBLEMA: El registro ya no está en manos de su creador
	else if (
		(ruta == "/producto" || ruta == "/rclv") &&
		creado_en < haceUnaHora &&
		registro.status_registro.gr_pend_aprob
	)
		informacion.mensajes = [
			"El registro estará disponible luego de ser revisado, en caso de ser aprobado.",
		];

	// Agregar el icono y continuar
	if (informacion.mensajes) {
		informacion.iconos = [vistaAnterior];
		let usuario = req.session.usuario;
		if (usuario.rol_usuario.aut_gestion_prod && registro.creado_por_id != usuario.id)
			informacion.iconos.push(vistaTablero);
		return res.render("Errores", {informacion});
	}
	next();
};
