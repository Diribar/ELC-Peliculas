"use strict";
// ************ Requires ************
const validar = require("../../funciones/Validar/RCLV");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = {
	buscarOtrosCasos: async (req, res) => {
		let {entidad, mes_id, dia, id} = req.query;
		let objeto = {mes_id, dia};
		let dia_del_ano_id = await BD_genericas.obtenerPorCampos("dias_del_ano", objeto).then((n) => n.id);
		let casos = await BD_genericas.obtenerTodosPorCampos(entidad, {dia_del_ano_id})
			.then((n) => n.filter((m) => m.id != id))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},
	validarCampo: async (req, res) => {
		let errores = await validar[req.query.RCLV](req.query);
		return res.json(errores);
	},
	validarConsolidado: async (req, res) => {
		let errores = await validar.consolidado(req.query);
		return res.json(errores);
	},
};
