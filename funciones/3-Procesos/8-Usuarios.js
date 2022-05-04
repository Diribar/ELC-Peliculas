"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("../3-Procesos/Compartidas");
const validar = require("../4-Validaciones/RUD");
const procesarRUD = require("./3-RUD");

module.exports = {
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
}