"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const valida = require("./RCLV-FN-Validar");

module.exports = {
	registrosConEsaFecha: async (req, res) => {
		let {entidad, mes_id, dia, id} = req.query;
		let objeto = {mes_id, dia};
		let dia_del_ano_id = await BD_genericas.obtienePorCampos("dias_del_ano", objeto).then((n) => n.id);
		let casos = await BD_genericas.obtieneTodosPorCampos(entidad, {dia_del_ano_id})
			.then((n) => n.filter((m) => m.id != id))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},
	valida: async (req, res) => {
		let mensaje = await valida[req.query.funcion](req.query);
		return res.json(mensaje);
	},
	prefijos: (req, res) => {
		let prefijos=variables.prefijos
		return res.json(prefijos);
	},
};
