"use strict";
// Variables

// Controlador
module.exports = {
	horarioInicial: async (req, res) => {
		// Variables
		let {entidad, id} = req.query;
		// Obtiene el registro
		let registro = await BD_genericas.obtienePorId(entidad, id);
		let datos = {
			creadoEn: registro.creadoEn,
			creadoPor_id: registro.creadoPor_id,
			capturadoEn: registro.capturadoEn,
			capturadoPor_id: registro.capturadoPor_id,
			userID: req.session.usuario.id,
		};

		// Fin
		return res.json(datos);
	},
	busquedaRapida: async (req, res) => {
		// Variables
		const palabras = req.query.palabras;
		const userID = req.session.usuario ? req.session.usuario.id : 0;
		const entidadesProd = variables.entidades.prods;
		const entidadesRCLV = variables.entidades.rclvs;
		const camposProds = ["nombreCastellano", "nombreOriginal"];
		const camposPers = ["nombre", "apodo"];
		let datos = [];
		let aux = [];
		let resultados = [];

		// Armado de la variable 'datos'
		for (let entidad of entidadesProd) datos.push({familia: "producto", entidad, campos: camposProds, original: true}); // productos originales
		for (let entidad of entidadesRCLV)
			datos.push({familia: "rclv", entidad, campos: entidad == "personajes" ? camposPers : ["nombre"], original: true}); // rclvs originales
		datos.push({familia: "producto", entidad: "prodsEdicion", campos: camposProds}); // productos ediciones
		// datos.push({familia: "rclv", entidad: "rclvsEdicion", campos: camposPers}); // rclvs ediciones

		// Rutina
		for (let dato of datos) {
			// Obtiene las condiciones
			const condiciones = quickSearchCondics(palabras, dato.campos, userID, dato.original);

			// Obtiene los registros que cumplen las condiciones
			console.log(46, dato.original);
			aux.push(
				dato.original
					? BD_especificas.quickSearchRegistros(condiciones, dato)
					: BD_especificas.quickSearchEdiciones(condiciones, dato)
			);
		}
		await Promise.all(aux).then((n) => n.map((m) => resultados.push(...m)));
		console.log(55,resultados);

		// Ordena los resultados
		resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)); // segunda prioridad: nombre
		resultados.sort((a, b) => (a.familia < b.familia ? -1 : 1)); // primera prioridad: familia

		// Envia la info al FE
		return res.json(resultados);
	},
};
let quickSearchCondics = (palabras, campos, userID, original) => {
	// Variables
	let todasLasPalabrasEnAlgunCampo = [];

	// Convierte las palabras en un array
	palabras = palabras.split(" ");

	// Rutina para cada campo
	for (let campo of campos) {
		// Variables
		let palabrasEnElCampo = [];

		// Dónde debe buscar cada palabra dentro del campo
		for (let palabra of palabras) {
			const palabraEnElCampo = {
				[Op.or]: [
					{[campo]: {[Op.like]: palabra + "%"}}, // En el comienzo del texto
					{[campo]: {[Op.like]: "% " + palabra + "%"}}, // En el comienzo de una palabra
				],
			};
			palabrasEnElCampo.push(palabraEnElCampo);
		}

		// Exige que cada palabra del conjunto esté presente
		const todasLasPalabrasEnElCampo = {[Op.and]: palabrasEnElCampo};

		// Consolida el resultado
		todasLasPalabrasEnAlgunCampo.push(todasLasPalabrasEnElCampo);
	}

	// Se fija que 'la condición de palabras' se cumpla en alguno de los campos
	const condicPalabras = {[Op.or]: todasLasPalabrasEnAlgunCampo};

	// Se fija que el registro esté en statusAprobado, o status 'creados_ids' y por el usuario
	const condicStatus = {
		[Op.or]: [{statusRegistro_id: aprobado_id}, {[Op.and]: [{statusRegistro_id: creados_ids}, {creadoPor_id: userID}]}],
	};

	// Se fija que una edición sea del usuario
	const condicEdicion = {editadoPor_id: userID};

	// Fin
	return {[Op.and]: [condicPalabras, original ? condicStatus : condicEdicion]};
};
