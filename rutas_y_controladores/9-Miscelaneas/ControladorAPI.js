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
		let errores = await validarRCLV["RCLV_"+req.query.RCLV](req.query);
		return res.json(errores);
	},

	// Quick Search
	quickSearch: async (req, res) => {
		palabras = req.query.palabras.split(" ");
		// Definir los campos en los cuales buscar
		let campos = ["nombre_original", "nombre_castellano"];
		// Crear el objeto literal con los valores a buscar
		let valoresOR = [];
		for (campo of campos) {
			let CondicionesDeCampo = [];
			for (palabra of palabras) {
				let CondiciondePalabra = {
					[Op.or]: [
						{[campo]: {[Op.like]: "% " + palabra + "%"}},
						{[campo]: {[Op.like]: palabra + "%"}},
					],
				};
				CondicionesDeCampo.push(CondiciondePalabra);
			}
			ResumenDeCampo = {[Op.and]: CondicionesDeCampo};
			valoresOR.push(ResumenDeCampo);
		}
		condiciones = {[Op.or]: valoresOR};
		// Enviar la info al FE
		let productos = await BD_especificas.quickSearch(condiciones);
		productos.sort((a, b) => {
			return a.nombre_castellano < b.nombre_castellano
				? -1
				: a.nombre_castellano > b.nombre_castellano
				? 1
				: 0;
		});
		return res.json(productos);
	},
};
