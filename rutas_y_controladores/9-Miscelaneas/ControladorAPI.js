// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");
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
		// where: {
		// 	[Op.and]: [{ a: 5 }, { b: 6 }],            // (a = 5) AND (b = 6)
		// 	[Op.or]: [{ a: 5 }, { b: 6 }],             // (a = 5) OR (b = 6)

		for (campo of campos) {
			valores = [];
			for (palabra of palabras) {
				valores.push({[campo]: {[Op.like]: "%"+ palabra + "%"}});
				//console.log(valores)
			}
			string = {[Op.and]: valores};
			//console.log(string);
		}
		let productos = await BD_varias.quickSearch(condicion)
		// Enviar la info al FE
		return res.json("palabras");
	},
};
