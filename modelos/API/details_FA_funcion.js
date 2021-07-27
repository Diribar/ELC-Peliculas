module.exports = {
	procesarPelicula_FA: async (form, lectura) => {
		// Datos obtenidos del formulario
		resultado = {
		};
		// Datos obtenidos de la API
		if (form.fuente == "TMDB") {
			resultado = {
				...resultado,
			};
		}
		//console.log(resultado);
		return resultado;
	},

	procesarColeccion_TMDB: async (form, lectura) => {
		// Datos obtenidos del formulario
		resultado = {
		};
		// Datos obtenidos de la API
		if (form.fuente == "TMDB") {
			resultado = {
				...resultado,
			};
		}
		//console.log(resultado);
		return resultado;
	},
};
