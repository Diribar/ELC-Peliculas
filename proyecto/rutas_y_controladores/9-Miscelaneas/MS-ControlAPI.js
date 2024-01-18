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
		datos.push({familia: "producto", entidad: "prodsEdicion", campos: camposProds, include: asocsProds}); // productos
		datos.push({familia: "rclv", entidad: "rclvsEdicion", campos: camposPers, include: asocsRCLVs}); // rclvs

		// Rutina
		for (let dato of datos) {
			// Obtiene las condiciones
			const condiciones = comp.quickSearchCondics(palabras, dato.campos, userID, dato.original);

			// Obtiene los registros que cumplen las condiciones
			aux.push(
				dato.original
					? BD_especificas.quickSearchRegistros(condiciones, dato)
					: BD_especificas.quickSearchEdiciones(condiciones, dato, dato.include)
			);
		}
		await Promise.all(aux).then((n) => n.map((m) => resultados.push(...m)));

		// Acciones si hay más de un resultado
		if (resultados.length > 1) {
			// Ordena los resultados
			resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)); // segunda prioridad: nombre
			resultados.sort((a, b) => (a.familia < b.familia ? -1 : 1)); // primera prioridad: familia

			// Elimina duplicados
			for (let i = resultados.length - 2; i >= 0; i--) {
				const {entidad: entidad1, id: id1, nombre: nombre1, anoEstreno: anoEstreno1} = resultados[i];
				const {entidad: entidad2, id: id2, nombre: nombre2, anoEstreno: anoEstreno2} = resultados[i + 1];
				if ((entidad1 == entidad2 && id1 == id2 && nombre1 == nombre2, anoEstreno1 == anoEstreno2))
					resultados.splice(i + 1, 1);
			}
		}

		// Envia la info al FE
		return res.json(resultados);
	},
};
