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
		const mensaje = await valida[datos.funcion](datos);

		// Fin
		return res.json(mensaje);
	},
	registrosConEsaFecha: async (req, res) => {
		// Variables
		const {entidad, mes_id, dia, id} = req.query;
		if (dia == "0") return res.json([]);

		// Más variables
		const fechaDelAno_id = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes_id).id;
		const condicion = {fechaDelAno_id};
		if (id) condicion.id = {[Op.ne]: id};

		// Obtiene los casos
		const casos = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion).then((n) => n.map((m) => m.nombre));
		return res.json(casos);
	},
	prefijos: (req, res) => res.json(prefijos),
	obtieneLeyNombre: (req, res) => {
		const opciones = procesos.altaEdicForm.opcsLeyNombre(req.query);
		return res.json(opciones);
	},
};
