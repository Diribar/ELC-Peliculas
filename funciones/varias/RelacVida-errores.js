// **** Requires ***********
let BD_peliculas = require("../BD/peliculas");
let path = require("path");

// Objeto literal
module.exports = {
	personaje: (datos) => {
		let errores = { nombre: "", mes_id: "", dia: "", repetidos: "" };
		// Empezamos a generar los errores
		errores.nombre = !datos.nombre
			? cartelCampoVacio
			: longitud(datos.nombre, 2, 30)
			? longitud(datos.nombre, 2, 30)
			: castellano(datos.nombre)
			? cartelCastellano
			: "";
		if (datos.desconocida == "false" || datos.desconocida == undefined) {
			errores.mes_id = !datos.mes_id ? cartelVacioSelect : "";
			errores.dia = !datos.dia ? cartelVacioSelect : "";
			if (!errores.dia && !errores.mes_id) {
				mes = datos.mes_id;
				dia = datos.dia;
				(mes == 2 && dia > 29) ||
				((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30)
					? (errores.dia = cartelSupera)
					: "";
			}
			casosCampo = Object.keys(datos);
			casosValores = Object.values(datos);
			for (i = 4; i < casosCampo.length; i++) {
				casosValores[i] == "true"
					? (errores.repetidos =
							"Por favor asegurate de que no coincida con ninguna otra persona, y destildalas.")
					: "";
			}
		}
		errores.hay = hayErrores(errores);
		return errores;
	},

	hecho: () => {},
};

cartelCampoVacio = "Necesitamos que completes este campo";
cartelVacioSelect = "Necesitamos que elijas un valor";
cartelSupera = "El número de día y el mes elegidos son incompatibles";
cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	formato = /^[A-Z][A-ZÁÉÍÓÚÜÑa-z áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};

let hayErrores = (errores) => {
	resultado = false;
	valores = Object.values(errores);
	for (valor of valores) {
		valor ? (resultado = true) : "";
	}
	return resultado;
};
