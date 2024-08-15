"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");

module.exports = {
	// Redirecciona después de inactivar una captura
	redirecciona: {
		redireccionaInicio: (req, res) => res.redirect("/"), // redirecciona a Inicio
		inicio: (req, res) => {
			const vistaActual = vistasInstitucs.inicio;
			return res.render("CMP-0Estructura", {
				tema: "institucional",
				...vistaActual,
			});
		},
	},

	// Listados
	listados: {
		session: (req, res) => res.send(req.session), // session
		cookies: (req, res) => res.send(req.cookies), // cookies
		rclvs: async (req, res) => {
			// Variables
			const {ruta} = comp.reqBasePathUrl(req);
			const indice = ruta.lastIndexOf("/");
			const rclv = ruta.slice(indice + 1);
			const condicion = {id: {[Op.ne]: 1}};
			const include = [...variables.entidades.prods, "prodsEdiciones"];
			let rclvs = {};
			let resultado = {};

			// Lectura
			await baseDeDatos
				.obtieneTodosPorCondicion(rclv, condicion, include)
				.then((n) =>
					n.map((m) => {
						rclvs[m.nombre] = 0;
						for (let entidad of include) rclvs[m.nombre] += m[entidad].length;
					})
				)
				.then(() => {
					// Ordena los métodos según la cantidad de productos
					const metodos = Object.keys(rclvs).sort((a, b) =>
						rclvs[b] != rclvs[a] ? rclvs[b] - rclvs[a] : a < b ? -1 : 1
					);
					// Crea un objeto nuevo, con los métodos ordenados
					metodos.map((n) => (resultado[n] = rclvs[n]));
				});

			// Fin
			return res.send(resultado);
		},
		links: async (req, res) => {
			// Variables
			const entidades = variables.entidades.prods;
			let productos = [];
			let TR, GR, CC, cantLinks;

			// Busca las películas y filtra por las que tienen más de un link
			for (let entidad of entidades)
				productos.push(
					...(await baseDeDatos.obtieneTodos(entidad, "links").then((n) => n.filter((m) => m.links.length > 1)))
				);

			// Separa entre links TR, GR y CC
			for (let producto of productos) {
				// Trailer
				cantLinks = producto.links.filter((n) => n.tipo_id == 1).length;
				if (!TR || TR.cantLinks < cantLinks) TR = {nombre: producto.nombreCastellano, cantLinks};

				// Gratis
				cantLinks = producto.links.filter((n) => n.tipo_id == 2 && n.gratuito).length;
				if (!GR || GR.cantLinks < cantLinks) GR = {nombre: producto.nombreCastellano, cantLinks};

				// Gratis
				cantLinks = producto.links.filter((n) => n.tipo_id == 2 && !n.gratuito).length;
				if (!CC || CC.cantLinks < cantLinks) CC = {nombre: producto.nombreCastellano, cantLinks};
			}

			// Devuelve la info
			return res.send({TR, GR, CC});
		},
	},
};
