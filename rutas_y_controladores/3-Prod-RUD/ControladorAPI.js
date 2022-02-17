// ************ Requires *************
let procesar = require("../../funciones/Prod-RUD/1-Procesar");
let validar = require("../../funciones/Prod-RUD/2-Validar");
// let BD_varias = require("../../funciones/BD/varias");
// let BD_especificas = require("../../funciones/BD/especificas");

// *********** Controlador ***********
module.exports = {
	averiguarSiEstaDisponible: async (req, res) => {
		// Viene con los datos de la entidad y el producto_id
		let {entidad, id} = req.query;
		// Los envía a una función y recibe 'true/false'
		let disponible = req.session.usuario
			? await procesar.averiguarSiEstaDisponible(entidad, id, req.session.usuario)
			: {status: false, codigo: "hacerLogin"};
		// Devuelve la info
		return res.json(disponible);
	},

	validarEdicion: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await validar.edicion(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},

	validarLinks: async (req, res) => {
		// Obtiene los campos
		let campos = Object.keys(req.query);
		// Averigua los errores solamente para esos campos
		let errores = await validar.links(campos, req.query);
		// Devuelve el resultado
		return res.json(errores);
	},
};
