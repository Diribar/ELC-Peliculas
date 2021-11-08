// ************ Requires ************
let validarRV = require("../../funciones/varias/RelacVida-errores");
let BD_varios = require("../../funciones/BD/varios");

// *********** Controlador ***********
module.exports = {
	buscarOtrosCasos: async (req, res) => {
		let { mes_id, dia, rubro } = req.query;
		dia_del_ano_id = await BD_varios.obtenerTodos("dias_del_ano", "id")
			.then((n) => n.filter((m) => m.mes_id == mes_id))
			.then((n) => n.filter((m) => m.dia == dia))
			.then((n) => n[0].id);
		casos = await BD_varios.obtenerTodos(
			"historicos_" + rubro + "s",
			"nombre"
		)
			.then((n) => n.filter((m) => m.dia_del_ano_id == dia_del_ano_id))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},

	validarRV: async (req, res) => {
		let errores = await validarRV.relacionConLaVida(req.query);
		return res.json(errores);
	},
};
