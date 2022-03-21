"use strict";
// ************ Requires ************
const validarRCLV = require("../../funciones/Varias/ValidarRCLV");
const BD_varias = require("../../funciones/BD/varias");
const BD_especificas = require("../../funciones/BD/especificas");
const {Op} = require("sequelize");

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
		let errores = await validarRCLV["RCLV_" + req.query.RCLV](req.query);
		return res.json(errores);
	},

};
