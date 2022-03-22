"use strict";
// Definir variables
const BD_genericas = require("../BD/Genericas");

module.exports = {
	averiguarSiEstaDisponible: async (entidad, prod_id, usuario) => {
		// Obtiene el registro con los datos del producto
		producto = await BD_genericas.obtenerPorCampo(entidad, "id", prod_id).then((n) => n.toJSON());
		let haceUnaHora = new Date() - 1000 * 60 * 60;
		let disponible = {};
		let statusCaptura =
			!producto.capturado_en || // No está capturado o
			(producto.capturado_por_id == usuario.id && haceUnaHora < producto.capturado_en) || // Está capturado por mí hace menos de 1 hora o
			(producto.capturado_por_id != usuario.id && haceUnaHora > producto.capturado_en); // Está capturado por otra persona hace más de 1 hora

		// Resultados TRUE:
		console.log("Creado en:   " + (producto.creado_en - 0));
		console.log("Hace 1 hora: " + haceUnaHora);
		disponible.status = true;
		if (
			// 1. CREADOR
			producto.creado_por_id == usuario.id && // Se dio de alta por este usuario y
			haceUnaHora < producto.creado_en // Se dio de alta hace menos de 1 hora
		) {
			disponible.codigo = "creador";
		} else if (
			// 2. REVISOR
			usuario.rol_usuario.aut_gestion_prod && // Soy un gestor y
			!producto.alta_analizada_en && // No está analizada aún y
			producto.creado_por_id != usuario.id && // Se dio de alta por otro usuario y
			haceUnaHora > producto.creado_en && // Se dio de alta hace más de 1 hora
			statusCaptura
		) {
			disponible.codigo = "gestor";
		} else if (
			// 3. EN_REGIMEN
			producto.alta_analizada_en && // El producto está analizado y
			statusCaptura
		) {
			disponible.codigo = "regimen";
		} else {
			// Resultados FALSE
			disponible.status = false;
			if (
				// 1. CREADOR
				// Se dio de alta por mí hace más de 1 hora, y todavía no está analizado
				producto.creado_por_id == usuario.id && // Se dio de alta por este usuario y
				haceUnaHora > producto.creado_en && // Se dio de alta hace menos de 1 hora
				!producto.alta_analizada_en // No está analizada aún
			) {
				disponible.codigo = "creador";
				disponible.mensaje =
					"El producto se creó hace más de una hora. Está reservado para que nuestro equipo la pueda analizar.";
			} else if (
				// 2. NO REVISOR
				// No soy gestor, no lo creé y todavía no está aprobado
				!usuario.rol_usuario.aut_gestion_prod && // No soy un gestor y
				producto.creado_por_id != usuario.id && // Se dio de alta por otro usuario y
				!producto.alta_analizada_en // No está analizada aún
			) {
				disponible.codigo = "noRevisor";
				disponible.mensaje = "El producto no está autorizado aún, no se puede editar.";
			} else if (
				// 3. RECIÉN CREADO
				// Se dio de alta por otra persona hace menos de 1 hora
				producto.creado_por_id != usuario.id && // Se dio de alta por otro usuario y
				haceUnaHora < producto.creado_en // Se dio de alta hace menos de 1 hora
			) {
				disponible.codigo = "recienCreado";
				disponible.mensaje =
					"El producto está recién creado. La primera hora se reserva para que el usuario que la creó la pueda editar.";
			} else if (
				// 4. CAPTURA EXCESIVA
				// Está capturado por mí hace más de 1 hora
				producto.capturado_por_id == usuario.id && // Está capturado por mí
				haceUnaHora > producto.capturado_en // Está capturado hace más de 1 hora
			) {
				disponible.codigo = "capturaExcesiva";
				disponible.mensaje =
					"El producto está reservado por vos desde hace más de una hora. Deberás esperar a que se cumplan más de 2 horas.";
			} else if (
				// 5. CAPTURADO
				// Está capturado por otra persona hace menos de 1 hora
				producto.capturado_por_id != usuario.id && // Está capturado por otra persona
				haceUnaHora < producto.capturado_en // Está capturado hace menos de 1 hora
			) {
				disponible.codigo = "capturado";
			} else disponible.codigo = "desconocido";
		}
		return disponible;
	},

	guardar_o_actualizar_Edicion: async (entidad, producto_id, datos) => {
		entidad = entidad + "Edicion";
		// Averiguar si ya exista la edición
		let edicion_id = await BD_especificas.obtenerELC_id(entidad, "elc_id", producto_id);
		// Acciones en función de si existe o no
		edicion_id
			? await BD_genericas.actualizarPorId(entidad, edicion_id, datos)
			: await BD_genericas.agregarRegistro({
					entidad,
					elc_id: producto_id,
					...datos,
			  });
	},
};
