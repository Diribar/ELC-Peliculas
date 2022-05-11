"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("./Compartidas");

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

	// Middlewares
	detectarUsuarioPenalizado:(usuario)=>{
		let informacion
		if (usuario.penalizado_hasta && new Date(usuario.penalizado_hasta) > new Date(funciones.ahora())) {
			let hasta = new Date(usuario.penalizado_hasta);
			let fecha =
				hasta.getDate() + "/" + meses[hasta.getMonth()] + "/" + String(hasta.getFullYear()).slice(-2);
			let hora = hasta.getHours() + ":" + String(hasta.getMinutes() + 1).padStart(2, "0");
			informacion = {
				mensajes: [
					"Necesitamos que la información que nos brindes esté más alineada con nuestro perfil y sea precisa",
					"Podrás volver a ingresar información el día " + fecha + ", a las " + hora + "hs.",
				],
				iconos: [
					{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
					{nombre: "fa-house", link: "/", titulo: "Ir a la vista de inicio"},
				],
			};
		}
		return informacion
	}
}