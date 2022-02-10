// Requires *******************
let BD_varias = require("../BD/varias");

// Objeto literal *************
module.exports = {
	RCLV_consolidado: async function (datos) {
		let errores = {
			fecha: this.RCLV_fecha(datos),
			ano: this.RCLV_ano(datos),
		};
		// Errores "nombre"
		let nombre = await this.RCLV_nombre(datos);
		let genero =
			datos.entidad == "RCLV_personajes_historicos" ? await this.RCLV_genero(datos) : "";
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
		return !nombre
			? cartelCampoVacio
			: longitud(nombre, 2, 30)
			? longitud(nombre, 2, 30)
			: castellano(nombre)
			? cartelCastellano
			: prefijo(nombre)
			? cartelPrefijo
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
					error = cartelSupera;
			}
		}
		return error;
	},

	RCLV_ano: (datos) => {
		let ano = parseInt(datos.ano);
		let error =
			typeof ano != "number"
				? "No es un número válido"
				: ano > new Date().getFullYear()
				? "El año no debe superar el año actual"
				: ano < -32768
				? "El año no debe ser inferior a -32.768"
				: "";
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
cartelPrefijo = "El nombre no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.).";

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

let prefijo = (nombre) => {
	return (
		nombre.startsWith("San ") ||
		nombre.startsWith("Santa ") ||
		nombre.startsWith("Santo ") ||
		nombre.startsWith("Beato ") ||
		nombre.startsWith("Beata ") ||
		nombre.startsWith("Ven. ") ||
		nombre.startsWith("Venerable ") ||
		nombre.startsWith("Madre ") ||
		nombre.startsWith("Hna. ") ||
		nombre.startsWith("Hermana ") ||
		nombre.startsWith("Padre ") ||
		nombre.startsWith("Don ") ||
		nombre.startsWith("Doña ") ||
		nombre.startsWith("Papa ")
	);
};

let hayErrores = (errores) => {
	valores = Object.values(errores);
	for (valor of valores) {
		if (valor) return true;
	}
	return false;
};
