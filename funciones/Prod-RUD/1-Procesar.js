// ************ Requires ************
let BD_varias = require("../BD/varias");

module.exports = {
	averiguarSiEstaCapturado: async (entidad, prod_id, user_id) => {
		// Obtiene el registro con los datos del producto
		producto = await BD_varias.obtenerPorParametro(entidad, "id", prod_id);
		haceUnaHora = new Date() - 1000 * 60 * 60;
		// Resultados true:
			// 1. Se dio de alta por este usuario hace menos de 1 hora
			// 2. Varios:
				// Se dio de alta por otro usuario y
				// Se dio de alta hace más de 1 hora y
				// Soy un revisor y
				// No está aprobado aún y
				// No está capturado o 
					// Está capturado por mí hace menos de 1 hora o 
					// Está capturado por otra persona hace más de 1 hora
			// 3. Varios:
				// El producto está aprobado y 
				// Soy un usuario y
				// No está capturado o 
					// Está capturado por mí hace menos de 1 hora o 
					// Está capturado por otra persona hace más de 1 hora

		// Resultados false
			// 1. Se dio de alta por mí hace más de 1 hora, y todavía no está aprobado
			// 2. Varios:
				// Se dio de alta por otra persona hace menos de 1 hora o
				// Está capturado por mí hace más de 1 hora o 
				// Está capturado por otra persona hace menos de 1 hora
			// 3. Soy un usuario y todavía no está aprobado
			return false
	},
};
