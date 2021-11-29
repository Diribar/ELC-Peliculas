// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let {Op} = require("sequelize");

// *********** Controlador ***********
module.exports = {
	// RCLV
	buscarOtrosCasos: async (req, res) => {
		let {mes_id, dia, entidad} = req.query;
		dia_del_ano_id = await BD_varias.obtenerTodos("dias_del_ano", "id")
			.then((n) => n.filter((m) => m.mes_id == mes_id))
			.then((n) => n.find((m) => m.dia == dia))
			.then((n) => n.id);
		casos = await BD_varias.obtenerTodos(entidad, "nombre")
			.then((n) => n.filter((m) => m.dia_del_ano_id == dia_del_ano_id))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},

	// RCLV
	validarRCLV: async (req, res) => {
		let errores = await validarRCLV.RCLV(req.query);
		return res.json(errores);
	},

	// Quick Search
	quickSearch: async (req, res) => {
		palabras = req.query.palabras.split(" ");
		// Definir los campos en los cuales buscar
		let campos = ["nombre_original", "nombre_castellano"];
		// Crear el objeto literal con los valores a buscar
		condicion = {
			[Op.or]: [
				// valoresOR
				{
					// ResumenDeCampo
					[Op.and]: [
						// CondicionesDeCampo
						{nombre_original: {[Op.like]: "%palabra1%"}}, // condicionPorPalabra
						{nombre_original: {[Op.like]: "%palabra2%"}}, // condicionPorPalabra
					],
				},
				{
					// ResumenDeCampo
					[Op.and]: [
						// CondicionesDeCampo
						{nombre_castellano: {[Op.like]: "%palabra1%"}}, // condicionPorPalabra
						{nombre_castellano: {[Op.like]: "%palabra2%"}}, // condicionPorPalabra
					],
				},
			],
		};
		// Crear lascondiciones
		let valoresOR = [];
		for (campo of campos) {
			let CondicionesDeCampo = [];
			for (palabra of palabras) {
				CondicionesDeCampo.push({[campo]: {[Op.like]: "%" + palabra + "%"}});
				//console.log(CondicionesDeCampo);
			}
			ResumenDeCampo = {[Op.and]: CondicionesDeCampo};
			//console.log(ResumenDeCampo);
			valoresOR.push(ResumenDeCampo);
			console.log(valoresOR);
		}
		condiciones = {[Op.or]: valoresOR};
		console.log(condiciones);
		let productos = "";
		await BD_especificas.quickSearch(condiciones);
		// Enviar la info al FE
		//console.log(productos);
		// if (productos.length>0) productos.map(n=> {
		// 	console.log(n.nombre_original)
		// })
		return res.json(productos);
	},
};
