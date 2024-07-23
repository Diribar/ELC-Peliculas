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
			errores.publico_id = !datos.publico_id ? variables.selectVacio : "";
			errores.epocaOcurrencia_id = !datos.epocaOcurrencia_id ? variables.selectVacio : "";

			// Lleva los errores a su mínima expresión
			for (let prop in errores) if (!errores[prop]) delete errores[prop];

			// Obtiene errores 'sensible'
			delete errores.hay;
			for (let prop in errores)
				if (![variables.inputVacio, variables.selectVacio, variables.rclvSinElegir].includes(errores[prop]))
					errores.sensible = true;

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
			const cartelMusica = variables.inputVacio + '. Si no tiene música, poné "Desconocido"';
			const cartelActores = variables.inputVacio + '. Si no conseguís información, poné "Desconocido"';
			const camposPosibles = [
				{nombre: "nombreCastellano", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 70},
				{nombre: "nombreOriginal", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 70},
				{nombre: "direccion", tipoIdioma: "basico", cartel: variables.inputVacio, corto: 3, largo: 100},
				{nombre: "guion", tipoIdioma: "basico", cartel: variables.inputVacio, corto: 3, largo: 100},
				{nombre: "musica", tipoIdioma: "basico", cartel: cartelMusica, corto: 3, largo: 100},
				{nombre: "produccion", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 100},
				{nombre: "actores", tipoIdioma: "completo", cartel: cartelActores, corto: 3, largo: 500},
				{nombre: "sinopsis", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 11, largo: 1004},
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
					} else respuesta = variables.inputVacio;

					// Fin
					errores[nombre] = respuesta;
				}
			}

			// ***** CAMPOS INDIVIDUALES PARTICULARES *******
			if (campos.includes("anoEstreno"))
				errores.anoEstreno = !datos.anoEstreno
					? variables.inputVacio
					: formatoAno(datos.anoEstreno)
					? "Debe ser un número de 4 dígitos"
					: datos.anoEstreno < 1900
					? "El año debe ser mayor a 1900"
					: datos.anoEstreno > new Date().getFullYear()
					? "El número no puede superar al año actual"
					: "";
			if (campos.includes("anoFin"))
				errores.anoFin = !datos.anoFin
					? variables.inputVacio
					: formatoAno(datos.anoFin)
					? "Debe ser un número de 4 dígitos"
					: datos.anoFin < 1900
					? "El año debe ser mayor a 1900"
					: datos.anoFin > new Date().getFullYear()
					? "El número no puede superar al año actual"
					: "";
			if (campos.includes("duracion"))
				errores.duracion = !datos.duracion
					? variables.inputVacio
					: formatoNumero(datos.duracion, 20)
					? formatoNumero(datos.duracion, 20)
					: datos.duracion > 600
					? "Debe ser un número menor"
					: "";
			if (campos.includes("paises_id"))
				errores.paises_id = !datos.paises_id
					? variables.inputVacio
					: datos.paises_id.length > 2 * 1 + 3 * 4
					? "Se aceptan hasta 4 países."
					: "";
			if (campos.includes("idiomaOriginal_id"))
				errores.idiomaOriginal_id = !datos.idiomaOriginal_id ? variables.inputVacio : "";

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
					datos.tipoActuacion_id == anime_id && datos.actores != "Dibujos Animados"
						? 'Debe decir "Dibujos Animados"'
						: datos.tipoActuacion_id == documental_id && datos.actores != "Documental"
						? 'Debe decir "Documental"'
						: datos.tipoActuacion_id == actuada_id && ["Dibujos Animados", "Documental"].includes(datos.actores)
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
				if (campos.includes(campo)) errores[campo] = !datos[campo] && datos[campo] !== false ? variables.inputVacio : ""; // Se usa 'false', para distinguir cuando el valor esté contestado de cuando no

			// RCLVs
			const rclvs_id = [...variables.entidades.rclvs_id, "sinRCLV"];
			if (campos.some((n) => rclvs_id.includes(n)))
				errores.RCLV = rclvs_id.every((n) => !datos[n] || datos[n] == 1) // ningún campo tiene un valor distinto de 1
					? variables.rclvSinElegir
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
	// CRUD y Revisión
	statusAprob: async function ({entidad, registro}) {
		// Variables
		const familias = comp.obtieneDesdeEntidad.familias(entidad);

		// Primera respuesta
		let statusAprob = familias != "productos" || registro.statusRegistro_id != creadoAprob_id;
		if (statusAprob) return true;

		// Si hay errores, devuelve falso e interrumpe la función
		const errores = await this.validacs.consolidado({datos: {...registro, entidad}});
		if (errores.impideAprobado) return false;

		// 1. Cambia el status del registro
		const ahora = comp.fechaHora.ahora();
		let datos = {statusRegistro_id: aprobado_id};
		if (!registro.altaTermEn)
			datos = {
				...datos,
				altaTermEn: ahora,
				leadTimeCreacion: comp.obtieneLeadTime(registro.creadoEn, ahora),
				statusSugeridoPor_id: usAutom_id,
				statusSugeridoEn: ahora,
			};
		await baseDeDatos.actualizaPorId(entidad, registro.id, datos);

		// 2. Actualiza el campo 'prodAprob' en los links
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const condicion = {[campo_id]: registro.id};
		baseDeDatos.actualizaTodosPorCondicion("links", condicion, {prodAprob: true});

		// 3. Si es una colección, revisa si corresponde aprobar capítulos
		if (entidad == "colecciones") await this.capsAprobs(registro.id);

		// 4. Actualiza 'prodsEnRCLV' en sus RCLVs
		this.accionesPorCambioDeStatus(entidad, {...registro, ...datos});

		// Fin
		return true;
	},
	accionesPorCambioDeStatus: async (entidad, registro) => {
		// Variables
		const familias = comp.obtieneDesdeEntidad.familias(entidad);

		// prodsEnRCLV
		if (familias == "productos") {
			// Variables
			const prodAprob = aprobados_ids.includes(registro.statusRegistro_id);

			// Actualiza prodAprob en sus links
			if (registro.links && registro.links.length) {
				const campo_id = entidad == "colecciones" ? "grupoCol_id" : comp.obtieneDesdeEntidad.campo_id(entidad);
				await baseDeDatos.actualizaTodosPorCondicion("links", {[campo_id]: registro.id}, {prodAprob});
			}

			// Rutina por entidad RCLV
			const entidadesRCLV = variables.entidades.rclvs;
			for (let entidadRCLV of entidadesRCLV) {
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);
				if (registro[campo_id] && registro[campo_id] != 1)
					prodAprob
						? baseDeDatos.actualizaPorId(entidadRCLV, registro[campo_id], {prodsAprob: true})
						: comp.prodsEnRCLV({entidad: entidadRCLV, id: registro[campo_id]});
			}
		}

		// linksEnProds
		if (familias == "links") {
			// Obtiene los datos identificatorios del producto
			const prodEntidad = comp.obtieneDesdeCampo_id.entidadProd(registro);
			const campo_id = comp.obtieneDesdeCampo_id.campo_idProd(registro);
			const prodID = registro[campo_id];

			// Actualiza el producto
			await comp.linksEnProd({entidad: prodEntidad, id: prodID});
			if (prodEntidad == "capitulos") {
				const colID = await baseDeDatos.obtienePorId("capitulos", prodID).then((n) => n.coleccion_id);
				comp.linksEnColec(colID);
			}
		}

		// Actualiza la variable de links vencidos
		await comp.linksVencPorSem.actualizaCantLinksPorSem();

		// Fin
		return;
	},
	capsAprobs: async function (colID) {
		// Variables
		const ahora = comp.fechaHora.ahora();
		let espera = [];
		let datos;

		// Prepara los datos
		const datosFijos = {statusColeccion_id: aprobado_id, statusRegistro_id: aprobado_id};
		const datosSugeridos = {statusSugeridoPor_id: usAutom_id, statusSugeridoEn: ahora};

		// Obtiene los capitulos id
		const capitulos = await baseDeDatos.obtieneTodosPorCondicion("capitulos", {coleccion_id: colID});

		// Actualiza el status de los capítulos
		for (let capitulo of capitulos) {
			// Variables
			const datosTerm = !capitulo.altaTermEn
				? {altaTermEn: ahora, leadTimeCreacion: comp.obtieneLeadTime(capitulo.creadoEn, ahora)}
				: {};

			// Revisa si cada capítulo supera el test de errores
			datos = {entidad: "capitulos", ...capitulo};
			const errores = await this.validacs.consolidado({datos});

			// Actualiza los datos
			datos = errores.impideAprobado
				? {...datosFijos, statusRegistro_id: creadoAprob_id}
				: {...datosFijos, ...datosSugeridos, ...datosTerm};
			espera.push(baseDeDatos.actualizaPorId("capitulos", capitulo.id, datos));
		}

		// Espera hasta que se revisen todos los capítulos
		await Promise.all(espera);

		// Fin
		return;
	},
	siHayErroresBajaElStatus: function (prodsPorEnts) {
		// Variables
		const entidades = variables.entidades.prods;

		// Acciones por cada ENTIDAD
		entidades.forEach(async (entidad, i) => {
			// Averigua si existen registros por cada entidad
			if (prodsPorEnts[i].length)
				// Acciones por cada PRODUCTO
				for (let original of prodsPorEnts[i]) {
					// Si hay errores, le cambia el status
					const errores = await this.validacs.consolidado({datos: {...original, entidad}});
					if (errores.impideAprobado)
						baseDeDatos.actualizaPorId(entidad, original.id, {statusRegistro_id: creadoAprob_id});
				}
		});

		// Fin
		return;
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
