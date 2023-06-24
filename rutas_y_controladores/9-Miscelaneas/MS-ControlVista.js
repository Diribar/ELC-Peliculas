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
			: origen == "REP"
			? "/revision/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
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
		const includes = [...variables.entidades.prods, "prods_ediciones"];
		let rclvs = {};
		let resultado2 = {};

		// Lectura
		await BD_genericas.obtieneTodosPorCondicionConInclude(rclv, condicion, includes)
			.then((n) =>
				n.map((m) => {
					rclvs[m.nombre] = 0;
					for (let entidad of includes) rclvs[m.nombre] += m[entidad].length;
				})
			)
			.then(() => {
				// Ordena los métodos
				const metodos = Object.keys(rclvs).sort((a, b) => (rclvs[b] != rclvs[a] ? rclvs[b] - rclvs[a] : a < b ? -1 : 1));
				// Crea un objeto nuevo, con los métodos ordenados
				metodos.map((n) => (resultado2[n] = rclvs[n]));
			});

		// Fin
		return res.send(resultado2);
	},
};
