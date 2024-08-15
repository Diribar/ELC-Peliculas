"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");

// Controlador
module.exports = {
	horarioInicial: async (req, res) => {
		// Variables
		const {entidad, id} = req.query;
		const userId = req.session.usuario.id;

		// Obtiene el registro
		const registro = await baseDeDatos.obtienePorId(entidad, id);
		const datos = {
			creadoEn: registro.creadoEn,
			creadoPor_id: registro.creadoPor_id,
			capturadoEn: registro.capturadoEn,
			capturadoPor_id: registro.capturadoPor_id,
			userId,
		};

		// Fin
		return res.json(datos);
	},
	busquedaRapida: async (req, res) => {
		// Variables
		const palabras = req.query.palabras;
		const userId = req.session.usuario ? req.session.usuario.id : 0;
		const entidadesProd = variables.entidades.prods;
		const entidadesRCLV = variables.entidades.rclvs;
		const camposProds = ["nombreCastellano", "nombreOriginal"];
		const camposRclvs = ["nombre", "nombreAltern"];
		const original = true;
		let datos = [];
		let resultados = [];

		// Armado de la variable 'datos' para productos originales
		for (let entidad of entidadesProd) datos.push({familia: "producto", entidad, campos: camposProds, original});

		// Armado de la variable 'datos' para rclvs originales
		for (let entidad of entidadesRCLV) {
			const campos = ["personajes", "hechos"].includes(entidad) ? camposRclvs : ["nombre"];
			datos.push({familia: "rclv", entidad, campos, original});
		}

		// Armado de la variable 'datos' para ediciones
		datos.push({familia: "producto", entidad: "prodsEdicion", campos: camposProds, include: variables.entidades.asocProds}); // productos
		datos.push({familia: "rclv", entidad: "rclvsEdicion", campos: camposRclvs, include: variables.entidades.asocRclvs}); // rclvs

		// Rutina
		for (let dato of datos) {
			// Obtiene las condiciones
			const condicion = procsFM.quickSearch.condicion(palabras, dato.campos, userId, dato.original);

			// Obtiene los registros que cumplen las condiciones
			resultados.push(
				dato.original
					? procsFM.quickSearch.registros(condicion, dato) // originales
					: procsFM.quickSearch.ediciones(condicion, dato) // ediciones
			);
		}
		resultados = await Promise.all(resultados).then((n) => n.flat());

		// Acciones si hay más de un resultado
		if (resultados.length > 1) {
			// Ordena los resultados
			resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : 1)); // segunda prioridad: nombre
			resultados.sort((a, b) => (a.familia < b.familia ? -1 : 1)); // primera prioridad: familia

			// Elimina duplicados
			for (let i = resultados.length - 2; i >= 0; i--) {
				const {entidad: entidad1, id: id1} = resultados[i];
				const {entidad: entidad2, id: id2} = resultados[i + 1];
				if (entidad1 == entidad2 && id1 == id2) resultados.splice(i + 1, 1);
			}
		}

		// Envia la info al FE
		return res.json(resultados);
	},
};
