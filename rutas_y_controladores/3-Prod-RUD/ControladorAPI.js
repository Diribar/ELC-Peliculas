// ************ Requires *************
let procesarProd = require("../../funciones/Prod-RUD/1-Procesar");
// let BD_varias = require("../../funciones/BD/varias");
// let BD_especificas = require("../../funciones/BD/especificas");

// *********** Controlador ***********
module.exports = {
	averiguarSiEstaCapturado: async (req, res) => {
		// Viene con los datos de la entidad y el producto_id
		let {entidad, id} = req.query;
		// Los envía a una función y recibe 'true/false'
		let feedback = req.session.usuario
			? await procesarProd.averiguarSiEstaCapturado(entidad, id, req.session.usuario.id)
			: "hacerLogin";
		console.log(feedback);
		// Devuelve la info
		return res.json(feedback);
	},
};
