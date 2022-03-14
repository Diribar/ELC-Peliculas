// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let {Op} = require("sequelize");

// *********** Controlador ***********
module.exports = {
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
