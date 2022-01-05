// ************ Requires ************
let BD_varias = require("../BD/varias");

module.exports = {
	averiguarSiEstaDisponible: async (entidad, prod_id, usuario) => {
		// Obtiene el registro con los datos del producto
		producto = await BD_varias.obtenerPorParametro(entidad, "id", prod_id).then(
			(n) => n.dataValues
		);
		console.log(producto);
		haceUnaHora = new Date() - 1000 * 60 * 60;
		let disponible = {};
		let statusCaptura =
			!producto.capturada_en || // No está capturado o
			(producto.capturada_por_id == usuario.id && haceUnaHora < producto.capturada_en) || // Está capturado por mí hace menos de 1 hora o
			(producto.capturada_por_id != usuario.id && haceUnaHora > producto.capturada_en); // Está capturado por otra persona hace más de 1 hora

		// Resultados TRUE:
		console.log("Creado en:   " + (producto.creada_en - 0));
		console.log("Hace 1 hora: " + haceUnaHora);
		disponible.status = true;
	if (
			// 1. CREADOR
			producto.creada_por_id == usuario.id && // Se dio de alta por este usuario y
			haceUnaHora < producto.creada_en // Se dio de alta hace menos de 1 hora
		) {
			disponible.codigo = "creador";
		} else if (
			// 2. REVISOR
			usuario.rol_usuario.aut_aprobar_altas_prod && // Soy un revisor y
			!producto.analizada_en && // No está analizada aún y
			producto.creada_por_id != usuario.id && // Se dio de alta por otro usuario y
			haceUnaHora > producto.creada_en && // Se dio de alta hace más de 1 hora
			statusCaptura
		) {
			disponible.codigo = "revisor";
		} else if (
			// 3. EN_REGIMEN
			producto.analizada_en && // El producto está analizado y
			statusCaptura
		) {
			disponible.codigo = "regimen";
		} else {
			// Resultados FALSE
			disponible.status = false;
			if (
				// 1. CREADOR
				// Se dio de alta por mí hace más de 1 hora, y todavía no está analizado
				producto.creada_por_id == usuario.id && // Se dio de alta por este usuario y
				haceUnaHora > producto.creada_en && // Se dio de alta hace menos de 1 hora
				!producto.analizada_en // No está analizada aún
			) {
				disponible.codigo = "creador";
			} else if (
				// 2. NO REVISOR
				// No soy revisor, no lo creé y todavía no está aprobado
				!usuario.rol_usuario.aut_aprobar_altas_prod && // No soy un revisor y
				producto.creada_por_id != usuario.id && // Se dio de alta por otro usuario y
				!producto.analizada_en // No está analizada aún
			) {
				disponible.codigo = "noRevisor";
			} else if (
				// 3. RECIÉN CREADO
				// Se dio de alta por otra persona hace menos de 1 hora
				producto.creada_por_id != usuario.id && // Se dio de alta por otro usuario y
				haceUnaHora < producto.creada_en // Se dio de alta hace menos de 1 hora
			) {
				disponible.codigo = "recienCreado";
			} else if (
				// 4. CAPTURA EXCESIVA
				// Está capturado por mí hace más de 1 hora
				producto.capturada_por_id == usuario.id && // Está capturado por mí
				haceUnaHora > producto.capturada_en // Está capturado hace más de 1 hora
			) {
				disponible.codigo = "capturaExcesiva";
			} else if (
				// 5. CAPTURADO
				// Está capturado por otra persona hace menos de 1 hora
				producto.capturada_por_id != usuario.id && // Está capturado por otra persona
				haceUnaHora < producto.capturada_en // Está capturado hace menos de 1 hora
			) {
				disponible.codigo = "capturado";
			} else disponible.codigo = "desconocido";
		}
		return disponible;
	},
};
