"use strict";
// Variables
const procesos = require("./MS-Procesos");

module.exports = {
	inicio: (req, res) => {
		const vistaActual = vistasInstitucs.inicio;
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			...vistaActual,
		});
	},

	// Listados
	listados: {
		session: (req, res) => res.send(req.session), // session
		cookies: (req, res) => res.send(req.cookies), // cookies
		rclvs: async (req, res) => {
			// Variables
			const {ruta} = comp.partesDelUrl(req);
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
			let Trailer, Gratis, ConCosto, cantLinks;

			// Busca las películas y filtra por las que tienen más de un link
			for (let entidad of entidades)
				productos.push(
					...(await baseDeDatos.obtieneTodos(entidad, "links").then((n) => n.filter((m) => m.links.length > 1)))
				);

			// Separa entre links Trailer, Gratis y ConCosto
			for (let producto of productos) {
				// Trailer
				cantLinks = producto.links.filter((n) => n.tipo_id == linkTrailer_id).length;
				if (!Trailer || Trailer.cantLinks < cantLinks) Trailer = {nombre: producto.nombreCastellano, cantLinks};

				// Gratis
				cantLinks = producto.links.filter((n) => n.tipo_id == linkPelicula_id && n.gratuito).length;
				if (!Gratis || Gratis.cantLinks < cantLinks) Gratis = {nombre: producto.nombreCastellano, cantLinks};

				// Gratis
				cantLinks = producto.links.filter((n) => n.tipo_id == linkPelicula_id && !n.gratuito).length;
				if (!ConCosto || ConCosto.cantLinks < cantLinks) ConCosto = {nombre: producto.nombreCastellano, cantLinks};
			}

			// Devuelve la info
			return res.send({Trailer, Gratis, ConCosto});
		},
	},

	// Redirecciona después de inactivar una captura
	redirecciona: {
		inicio: (req, res) => res.redirect("/"),
		urlDeOrigen: async (req, res) => {
			// Variables
			const {origen: origenCodigo, origenUrl, prodEntidad, prodId, entidad, id, urlDestino, grupo} = req.query;
			let destino;

			// Casos particulares
			if (urlDestino) return res.redirect(urlDestino);
			if (!origenCodigo && !origenUrl) return res.redirect("/");

			// Rutina para encontrar el destino
			for (let origen of origenDeUrls)
				if ((origenCodigo && origenCodigo == origen.codigo) || (origenUrl && origenUrl == origen.url)) {
					destino = origen.url;
					if (origen.cola)
						destino += "/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodId ? prodId : id);
					break;
				}

			// Links
			if (!destino && ["LK", "LKM"].includes(origenCodigo))
				destino =
					"/links/abm/?entidad=" +
					(prodEntidad ? prodEntidad : entidad) +
					"&id=" +
					(prodId ? prodId : id) +
					(origenCodigo == "LKM" ? "&origen=TM" : "") +
					(grupo ? "&grupo=inactivo" : "");

			// Redirecciona a la vista que corresponda
			if (!destino) destino = "/";
			return res.redirect(destino);
		},
		rutasAntiguas: function (req, res) {
			// Variables
			const {entidad, id} = req.query;
			const rutasAntsActs = procesos.rutas(entidad);
			let {originalUrl} = req;
			let nuevoUrl, nuevaCola;

			// Obtiene el reqBase y el path
			const rutaAntAct = rutasAntsActs.find((n) => originalUrl.startsWith(n.ant));
			nuevoUrl = rutaAntAct.act;

			// Obtiene la 'cola'
			const colaActual = originalUrl.replace(rutaAntAct.ant, "");
			nuevaCola = colaActual.replace("entidad=" + entidad + "&", "");
			nuevaCola = nuevaCola.replace("/?id=" + id, "/" + id + "/?");

			// Terminación de la 'cola'
			nuevaCola = nuevaCola.replace("?&", "?");
			if (nuevaCola.endsWith("?")) nuevaCola = nuevaCola.slice(0, -1);
			if (nuevaCola.endsWith("/")) nuevaCola = nuevaCola.slice(0, -1);

			// Fin
			return res.redirect(nuevoUrl + nuevaCola);
		},
	},
};
