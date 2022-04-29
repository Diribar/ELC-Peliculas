"use strict";
// ************ Requires ************
const validarRCLV = require("../../funciones/Validar/RCLV");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = {
	// RCLV
	buscarOtrosCasos: async (req, res) => {
		let {entidad, mes_id, dia, id} = req.query;
		let objeto = {mes_id, dia};
		let dia_del_ano_id = await BD_genericas.obtenerPorCampos("dias_del_ano", objeto).then((n) => n.id);
		let casos = await BD_genericas.obtenerTodosPorCampos(entidad, {dia_del_ano_id})
			.then((n) => n.filter((m) => m.id != id))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},

	// RCLV
	validarRCLV: async (req, res) => {
		let errores = await validarRCLV["RCLV_" + req.query.RCLV](req.query);
		return res.json(errores);
	},
};
