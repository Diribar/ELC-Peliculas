// Requires *******************
let BD_varias = require("../BD/varias");

// Objeto literal *************
module.exports = {
	RCLV_consolidado: async function (datos) {
		let errores = {
			fecha: this.RCLV_fecha(datos),
		};
		// Errores "nombre"
		nombre = await this.RCLV_nombre(datos);
		let genero = "";
		if (datos.entidad == "RCLV_personajes_historicos") genero = await this.RCLV_genero(datos);
		errores.nombre = nombre ? nombre : genero;
		// Errores "datos repetidos"
		if (datos.repetido) errores.duplicados = cartelDuplicado;
		// Errores "RCLI"
		if (datos.entidad == "RCLV_personajes_historicos") errores.RCLI = this.RCLV_RCLI(datos);
		// Completar con 'hay errores'
		errores.hay = hayErrores(errores);
		return errores;
	},

	RCLV_nombre: async (datos) => {
		let {entidad, nombre} = datos;
		return !datos.nombre
			? cartelCampoVacio
			: longitud(datos.nombre, 2, 30)
			? longitud(datos.nombre, 2, 30)
			: castellano(datos.nombre)
			? cartelCastellano
			: (await BD_varias.obtenerELC_id({entidad, campo: "nombre", valor: nombre}))
			? cartelRepetido
			: "";
	},

	RCLV_genero: (datos) => {
		return !datos.genero ? "Necesitamos que respondas el genero de la persona" : "";
	},

	RCLV_fecha: (datos) => {
		let error = "";
		if (datos.desconocida == "false" || datos.desconocida == undefined) {
			if (!datos.mes_id || !datos.dia) error = cartelFechaIncompleta;
			if (!error) {
				mes = datos.mes_id;
				dia = datos.dia;
				if (
					(mes == 2 && dia > 29) ||
					((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30)
				)
					errorFecha = cartelSupera;
			}
		}
		return error;
	},

	RCLV_RCLI: (datos) => {
		return !datos.enProcCan
			? "Necesitamos que respondas si está en Proceso de Canonización"
			: datos.enProcCan == "1"
			? !datos.proceso_canonizacion_id
				? "Necesitamos que respondas sobre el Status del Proceso de Canonización"
				: !datos.rol_iglesia_id
				? "Necesitamos que respondas el rol de la persona en la Iglesia"
				: ""
			: "";
	},
};

cartelFechaIncompleta = "Falta elegir el mes y/o el día";
cartelCampoVacio = "Necesitamos que completes este campo";
cartelSupera = "El número de día y el mes elegidos son incompatibles";
cartelRepetido = "Ya tenemos un registro con ese nombre";
cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	formato = /^[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-z áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};

let hayErrores = (errores) => {
	valores = Object.values(errores);
	for (valor of valores) {
		if (valor) return true;
	}
	return false;
};
