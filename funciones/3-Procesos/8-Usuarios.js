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
	detectarUsuarioPenalizado: (usuario, urlAnterior) => {
		let informacion;
		let hasta = new Date(usuario.penalizado_hasta);
		if (usuario.penalizado_hasta && hasta > new Date(funciones.ahora())) {
			let fecha =
				hasta.getDate() + "/" + meses[hasta.getMonth()] + "/" + String(hasta.getFullYear()).slice(-2);
			let hora = hasta.getHours() + ":" + String(hasta.getMinutes() + 1).padStart(2, "0");
			informacion = {
				mensajes: [
					"Necesitamos que la información que nos brindes esté más alineada con nuestro perfil y sea precisa",
					"Podrás volver a ingresar información el día " + fecha + ", a las " + hora + "hs.",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: urlAnterior,
						titulo: "Ir a la vista anterior",
					},
					{nombre: "fa-house", link: "/", titulo: "Ir a la vista de inicio"},
				],
			};
		}
		return informacion;
	},
	productosCreadosPorUnUsuario: async (userID) => {
		// Variables
		let objeto = {creado_por_id: userID};
		// Obtener todos los productos creados por el usuario
		let peliculas = BD_genericas.obtenerTodosPorCamposConInclude("peliculas", objeto, "status_registro");
		let colecciones = BD_genericas.obtenerTodosPorCamposConInclude(
			"colecciones",
			objeto,
			"status_registro"
		);
		let capitulos = BD_genericas.obtenerTodosPorCamposConInclude("capitulos", objeto, "status_registro");
		// Unirlos
		let productos = await Promise.all([peliculas, colecciones, capitulos]).then(([a, b, c]) => {
			return [...a, ...b, ...c];
		});
		// Fin
		return productos;
	},
};
