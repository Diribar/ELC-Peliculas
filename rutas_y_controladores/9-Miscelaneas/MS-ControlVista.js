"use strict";
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/1-Procesos/Variables");

// *********** Controlador ***********
module.exports = {
	// Redireccionar a Inicio
	redireccionarInicio: (req, res) => {
		return res.redirect("/institucional/inicio");
	},

	// Session y Cookies
	session: (req, res) => {
		return res.send(req.session);
	},
	cookies: (req, res) => {
		return res.send(req.cookies);
	},

	// Miscelaneas
	redireccionar: async (req, res) => {
		// Variables
		let {origen, prodEntidad, prodID, entidad, id, urlDestino} = req.query;
		// return res.send(req.query)
		// Si es 'tablero', ir a tablero
		let destino = false
			? null
			: // Producto
			origen == "DA"
			? "/producto/agregar/datos-adicionales"
			: origen == "DTP"
			? "/producto/detalle/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "EDP"
			? "/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "LK"
			? "/links/abm/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: // RCLV
			origen == "DTR"
			? "/rclv/detalle/?entidad=" + entidad + "&id=" + id
			: // Revisión
			origen == "TE"
			? "/revision/tablero-de-control"
			: origen == "RLK"
			? "/revision/links/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: // Otros
			origen == "TU"
			? "/revision/usuarios/tablero-de-control"
			: origen == "TM"
			? "/mantenimiento"
			: urlDestino
			? urlDestino
			: "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(destino);
	},
	listadoRCLVs: async (req, res) => {
		// Variables
		const rclv = req.path.slice(1);
		const condicion = {id: {[Op.ne]: 1}};
		const include = variables.entidades.prods;
		let resultado1 = {};
		let resultado2 = {};

		// Lectura
		await BD_genericas.obtieneTodosPorCondicionConInclude(rclv, condicion, include)
			.then((n) => n.map((m) => (resultado1[m.nombre] = m.peliculas.length + m.colecciones.length)))
			.then(() => {
				const campos = Object.keys(resultado1).sort((a, b) => resultado1[b] - resultado1[a]);
				campos.map((n) => (resultado2[n] = resultado1[n]));
			});

		// peliculas: [...m.peliculas, ...m.colecciones].map((o) => o.nombre_castellano),
		// .then((n) => n.sort((a, b) => b.cantidad - a.cantidad));

		// Fin
		return res.send(resultado2);
	},
};
