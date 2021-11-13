// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/RCLV-Errores");
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	buscarOtrosCasos: async (req, res) => {
		let { mes_id, dia, entidad } = req.query;
		dia_del_ano_id = await BD_varias.obtenerTodos("dias_del_ano", "id")
			.then((n) => n.filter((m) => m.mes_id == mes_id))
			.then((n) => n.filter((m) => m.dia == dia))
			.then((n) => n[0].id);
		casos = await BD_varias.obtenerTodos(
			"historicos_" + entidad + "s",
			"nombre"
		)
			.then((n) => n.filter((m) => m.dia_del_ano_id == dia_del_ano_id))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},

	validarRCLV: async (req, res) => {
		let errores = await validarRCLV.RCLV(req.query);
		return res.json(errores);
	},
};
