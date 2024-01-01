"use strict";
// Variables

// Controlador
module.exports = {
	horarioInicial: async (req, res) => {
		// Variables
		const {entidad, id} = req.query;
		const userID = req.session.usuario.id;

		// Obtiene el registro
		const registro = await BD_genericas.obtienePorId(entidad, id);
		const datos = {
			creadoEn: registro.creadoEn,
			creadoPor_id: registro.creadoPor_id,
			capturadoEn: registro.capturadoEn,
			capturadoPor_id: registro.capturadoPor_id,
			userID,
		};

		// Fin
		return res.json(datos);
	},
	busquedaRapida: async (req, res) => {
		// Variables
		const palabras = req.query.palabras;
		const userID = req.session.usuario ? req.session.usuario.id : 0;
		const entidadesProd = variables.entidades.prods;
		const asocsProds = variables.asocs.prods;
		const entidadesRCLV = variables.entidades.rclvs;
		const asocsRCLVs = variables.asocs.rclvs;
		const camposProds = ["nombreCastellano", "nombreOriginal"];
		const camposPers = ["nombre", "apodo"];
		const original = true;
		let datos = [];
		let aux = [];
		let resultados = [];

		// Armado de la variable 'datos' para productos originales
		entidadesProd.forEach((entidad, i) => {
			const asoc = asocsProds[i];
			datos.push({familia: "producto", entidad, asoc, campos: camposProds, original});
		});

		// Armado de la variable 'datos' para rclvs originales
		entidadesRCLV.forEach((entidad, i) => {
			const asoc = asocsRCLVs[i];
			const campos = entidad == "personajes" ? camposPers : ["nombre"];
			datos.push({familia: "rclv", entidad, asoc, campos, original});
		});

		// Armado de la variable 'datos' para ediciones
		datos.push({familia: "producto", entidad: "prodsEdicion", campos: camposProds}); // productos
		datos.push({familia: "rclv", entidad: "rclvsEdicion", campos: camposPers}); // rclvs

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

		// Ordena los resultados
		resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)); // segunda prioridad: nombre
		resultados.sort((a, b) => (a.familia < b.familia ? -1 : 1)); // primera prioridad: familia

		// Envia la info al FE
		return res.json(resultados);
	},
};
