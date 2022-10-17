"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const validar = require("./FN-Validar");

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
	validar: async (req, res) => {
		let mensaje = await validar[req.query.funcion](req.query);
		return res.json(mensaje);
	},
};
