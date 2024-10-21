"use strict";

module.exports = {
	validacs: {
		consolidado: async function ({campos, datos}) {
			// Obtiene la entidad
			const entidad = datos.entidad;
			// Obtiene los campos
			if (!campos) {
				const camposDD = variables.camposDD.filter((n) => n[entidad] || n.productos);
				const camposDA = variables.camposDA;
				campos = [...camposDD, ...camposDA].map((n) => n.nombre);
			}
			// Averigua si hay errores de validación DD y DA
			const erroresDD = await this.datosDuros(campos, datos);
			const erroresDA = this.datosAdics(campos, datos);
			let errores = {...erroresDD, ...erroresDA};

			// Si corresponde, agrega campos particulares
			errores.publico_id = !datos.publico_id ? selectVacio : "";
			errores.epocaOcurrencia_id = !datos.epocaOcurrencia_id ? selectVacio : "";

			// Lleva los errores a su mínima expresión
			for (let prop in errores) if (!errores[prop]) delete errores[prop];

			// Obtiene errores 'sensible'
			delete errores.hay;
			for (let prop in errores)
				if (![inputVacio, selectVacio, rclvSinElegir].includes(errores[prop])) errores.sensible = true;

			// Resumen de errores
			errores.sensible = !!errores.sensible; // se usa para guardar una edición
			errores.hay = !!erroresDD.hay || !!erroresDA.hay || !!errores.publico_id || !!errores.epocaOcurrencia_id; // se usa para cambiar de status a 'aprobado'
			errores.impideAprobado = entidad != "capitulos" ? errores.hay : errores.sensible;

			// Fin
			return errores;
		},
		datosDuros: async function (campos, datos) {
			// Variables
			let errores = {};
			if (!datos.entidadNombre) datos.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(datos.entidad);
			const cartelMusica = inputVacio + '. Si no tiene música, poné "Desconocido"';
			const cartelActores = inputVacio + '. Si no conseguís información, poné "Desconocido"';
			const camposPosibles = [
				{nombre: "nombreCastellano", tipoIdioma: "completo", cartel: inputVacio, corto: 3, largo: 70},
				{nombre: "nombreOriginal", tipoIdioma: "completo", cartel: inputVacio, corto: 3, largo: 70},
				{nombre: "direccion", tipoIdioma: "basico", cartel: inputVacio, corto: 3, largo: 100},
				{nombre: "guion", tipoIdioma: "basico", cartel: inputVacio, corto: 3, largo: 100},
				{nombre: "musica", tipoIdioma: "basico", cartel: cartelMusica, corto: 3, largo: 100},
				{nombre: "produccion", tipoIdioma: "completo", cartel: inputVacio, corto: 3, largo: 100},
				{nombre: "actores", tipoIdioma: "completo", cartel: cartelActores, corto: 3, largo: 500},
				{nombre: "sinopsis", tipoIdioma: "completo", cartel: inputVacio, corto: 11, largo: 1004},
			];
			// Campos individuales estándar
			for (let campo of camposPosibles) {
				const nombre = campo.nombre;
				const tipoIdioma = campo.tipoIdioma;
				if (campos.includes(nombre)) {
					// Variables
					const dato = datos[nombre];
					let respuesta = "";
					// Validaciones
					if (datos[nombre]) {
						if (!respuesta) respuesta = comp.validacs.longitud(dato, campo.corto, campo.largo);
						if (!respuesta) respuesta = comp.validacs.castellano[tipoIdioma](dato);
						if (!respuesta) respuesta = comp.validacs.inicial[tipoIdioma](dato);
					} else respuesta = inputVacio;

					// Fin
					errores[nombre] = respuesta;
				}
			}

			// ***** CAMPOS INDIVIDUALES PARTICULARES *******
			if (campos.includes("anoEstreno"))
				errores.anoEstreno = !datos.anoEstreno
					? inputVacio
					: formatoAno(datos.anoEstreno)
					? "Debe ser un número de 4 dígitos"
					: datos.anoEstreno < 1900
					? "El año debe ser mayor a 1900"
					: datos.anoEstreno > new Date().getFullYear()
					? "El número no puede superar al año actual"
					: "";
			if (campos.includes("anoFin"))
				errores.anoFin = !datos.anoFin
					? inputVacio
					: formatoAno(datos.anoFin)
					? "Debe ser un número de 4 dígitos"
					: datos.anoFin < 1900
					? "El año debe ser mayor a 1900"
					: datos.anoFin > new Date().getFullYear()
					? "El número no puede superar al año actual"
					: "";
			if (campos.includes("duracion"))
				errores.duracion = !datos.duracion
					? inputVacio
					: formatoNumero(datos.duracion, 20)
					? formatoNumero(datos.duracion, 20)
					: datos.duracion > 600
					? "Debe ser un número menor"
					: "";
			if (campos.includes("paises_id"))
				errores.paises_id = !datos.paises_id
					? inputVacio
					: datos.paises_id.length > 2 * 1 + 3 * 4
					? "Se aceptan hasta 4 países."
					: "";
			if (campos.includes("idiomaOriginal_id")) errores.idiomaOriginal_id = !datos.idiomaOriginal_id ? inputVacio : "";

			// Personas
			if (campos.includes("avatar")) errores.avatar = comp.validacs.avatar(datos);

			// ***** CAMPOS COMBINADOS *******
			// Año de Estreno y Año Fin
			if (datos.anoEstreno && !errores.anoEstreno && datos.anoFin && !errores.anoFin && datos.anoEstreno > datos.anoFin) {
				errores.anoEstreno = "El año de estreno debe ser menor o igual que el año de finalización";
			}
			// Nombre Original y Año de Estreno
			if (datos.nombreOriginal && !errores.nombreOriginal && datos.anoEstreno && !errores.anoEstreno && datos.entidad) {
				let id = await this.repetidos(["nombreOriginal", "anoEstreno"], datos);
				if (id) errores.nombreOriginal = comp.validacs.cartelRepetido({...datos, id});
			}
			// Nombre Castellano y Año de Estreno
			if (datos.nombreCastellano && !errores.nombreCastellano && datos.anoEstreno && !errores.anoEstreno && datos.entidad) {
				const id = await this.repetidos(["nombreCastellano", "anoEstreno"], datos);
				if (id) errores.nombreCastellano = comp.validacs.cartelRepetido({...datos, id});
			}
			// Actores y Tipo de Actuación
			if (datos.tipoActuacion_id && !errores.actores) {
				errores.actores =
					datos.tipoActuacion_id == anime_id && datos.actores != dibujosAnimados
						? 'Debe decir "Dibujos Animados"'
						: datos.tipoActuacion_id == documental_id && datos.actores != documental
						? 'Debe decir "Documental"'
						: datos.tipoActuacion_id == actuada_id && [dibujosAnimados, documental].includes(datos.actores)
						? "Deben figurar los nombres de los actores y actrices"
						: "";
			}

			// ***** RESUMEN *******
			errores.hay = Object.values(errores).some((n) => !!n);
			return errores;
		},
		datosAdics: (campos, datos) => {
			// Definir variables
			let errores = {};
			let camposPosibles = ["cfc", "bhr", "tipoActuacion_id"];
			// Datos generales
			for (let campo of camposPosibles)
				if (campos.includes(campo)) errores[campo] = !datos[campo] && datos[campo] !== false ? inputVacio : ""; // Se usa 'false', para distinguir cuando el valor esté contestado de cuando no

			// RCLVs
			const rclvs_id = [...variables.entidades.rclvs_id, "sinRCLV"];
			if (campos.some((n) => rclvs_id.includes(n)))
				errores.RCLV = rclvs_id.every((n) => !datos[n] || datos[n] == 1) // ningún campo tiene un valor distinto de 1
					? rclvSinElegir
					: "";

			// Consolida la información
			errores.hay = Object.values(errores).some((n) => !!n);

			// Fin
			return errores;
		},
		repetidos: async (campos, datos) => {
			// El mismo valor para los campos
			let condicion = {};
			for (let campo of campos) condicion[campo] = datos[campo];

			// Si tiene ID, agrega la condición de que sea distinto
			if (datos.id) condicion.id = {[Op.ne]: datos.id};
			if (datos.coleccion_id) condicion.coleccion_id = datos.coleccion_id;

			// Averigua si existe
			const existe = await baseDeDatos.obtienePorCondicion(datos.entidad, condicion);

			// Fin
			return existe ? existe.id : false;
		},
	},
};

// Fórmulas
let formatoAno = (dato) => {
	let formato = /^\d{4}$/;
	return !formato.test(dato);
};
let formatoNumero = (dato, minimo) => {
	let formato = /^\d+$/;
	return !formato.test(dato) ? "Debe ser un número" : dato < minimo ? "Debe ser un número mayor a " + minimo : "";
};
