"use strict";
// Variables
const valida = require("./RCLV-FN-Validar");
const procesos = require("./RCLV-FN-Procesos");

module.exports = {
	obtieneVars: {
		detalle: (req, res) => res.json({pppOpcsArray, pppOpcsSimples, setTimeOutStd}),
		edicion: (req, res) => res.json({rolesIglesia, canons, meses: meses.map((n) => n.abrev), hoyEstamos}),
	},
	validaSector: async (req, res) => {
		// Variables
		let datos = req.query;
		if (datos.stringify) datos = {funcion: datos.funcion, ...JSON.parse(datos.stringify)};

		// Obtiene el mensaje
		let mensaje = await valida[datos.funcion](datos);

		// Fin
		return res.json(mensaje);
	},
	registrosConEsaFecha: async (req, res) => {
		let {entidad, mes_id, dia, id} = req.query;
		let objeto = {mes_id, dia};
		let fechaDelAno_id = dia != "0" ? fechasDelAno.find((n) => n.dia == objeto.dia && n.mes_id == objeto.mes_id).id : 400;
		let casos = await BD_genericas.obtieneTodosPorCondicion(entidad, {fechaDelAno_id})
			.then((n) => n.filter((m) => m.id != id))
			.then((n) => n.filter((m) => m.id > 10))
			.then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},
	prefijos: (req, res) => res.json(variables.prefijos),
	obtieneLeyNombre: (req, res) => {
		const opciones = procesos.altaEdicForm.opcsLeyNombre(req.query);
		return res.json(opciones);
	},
};
