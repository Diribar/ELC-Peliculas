// ************ Requires ************
let validarRV = require("../../funciones/varias/RelacVida-errores");
let BD_varios = require("../../funciones/BD/varios");

// *********** Controlador ***********
module.exports = {
	validarPersonaje: (req, res) => {},

	validarHecho: (req, res) => {},

	personajesFecha: async (req, res) => {
		let { mes_id, dia } = req.query;
		[fecha] = await BD_varios.ObtenerTodos("dias_del_ano", "id")
			.then((n) => n.filter((m) => m.mes_id == mes_id))
			.then((n) => n.filter((m) => m.dia == dia))
			.then((n) => n.map((m) => m.id));
		casos = await BD_varios.ObtenerTodos("historicos_personajes", "nombre")
			.then((n) => n.filter((m) => m.dia_del_ano_id == fecha))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},
};
