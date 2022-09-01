"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = {
	actualizaElUsuario: async (statusDeseado, statusPosterior, usuario, novedades) => {
		// Obtiene el nuevo status
		let statusNuevo = status_registro_us.find((n) => n[statusDeseado] && !n[statusPosterior]);
		// Genera la info a actualizar
		novedades = {
			...novedades,
			status_registro_id: statusNuevo.id,
			status_registro: statusNuevo,
		};
		// Actualiza la info
		await BD_genericas.actualizarPorId("usuarios", usuario.id, novedades);
		usuario = {...usuario, ...novedades};
		// Fin
		return usuario;
	},
	// Controladora/Usuario/Login
	actualizarElContadorDeLogins: (usuario, hoyAhora) => {
		let hoyUsuario = usuario.fecha_ultimo_login;
		//new Date(usuario.fecha_ultimo_login).toISOString().slice(0, 10);
		if (hoyAhora != hoyUsuario) {
			BD_genericas.aumentarElValorDeUnCampo("usuarios", usuario.id, "dias_login");
			BD_genericas.actualizarPorId("usuarios", usuario.id, {fecha_ultimo_login: hoyAhora});
		}
		return;
	},
};
