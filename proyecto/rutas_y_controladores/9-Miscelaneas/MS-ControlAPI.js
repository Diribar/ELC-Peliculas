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
			const condiciones = comp.quickSearchCondics(palabras, dato.campos, userID, dato.original);

			// Obtiene los registros que cumplen las condiciones
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
