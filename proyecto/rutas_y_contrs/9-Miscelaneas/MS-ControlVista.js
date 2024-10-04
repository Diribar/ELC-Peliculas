"use strict";
const procsRE = require("../3-Rev-Entidades/RE-Procesos");
const procesos = require("./MS-Procesos");

module.exports = {
	inicio: (req, res) => {
		const vistaActual = vistasInstitucs.inicio;
		return res.render("CMP-0Estructura", {
			tema: "institucional",
			...vistaActual,
		});
	},
	// Tablero de mantenimiento
	tableroMantenim: async (req, res) => {
		// Variables
		const tema = "mantenimiento";
		const codigo = "tableroControl";
		const usuario_id = req.session.usuario.id;
		const omnipotente = req.session.usuario.rolUsuario_id == rolOmnipotente_id;

		// Productos
		let prods = procesos.obtieneProds(usuario_id).then((n) => procsRE.procesaCampos.prods(n));
		let rclvs = procesos.obtieneRCLVs(usuario_id).then((n) => procsRE.procesaCampos.rclvs(n));
		let prodsConLinksInactivos = procesos.obtieneLinksInactivos(usuario_id).then((n) => procsRE.procesaCampos.prods(n));

		// RCLVs
		[prods, rclvs, prodsConLinksInactivos] = await Promise.all([prods, rclvs, prodsConLinksInactivos]);

		// Une Productos y Links
		prods = {...prods, ...prodsConLinksInactivos};

		// Obtiene información para la vista
		const dataEntry = req.session.tableros && req.session.tableros.mantenimiento ? req.session.tableros.mantenimiento : {};

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Tablero de Mantenimiento", origen: "TM"},
			...{prods, rclvs, omnipotente},
			dataEntry,
		});
	},

	// Listados
	listados: {
		session: (req, res) => res.send(req.session), // session
		cookies: (req, res) => res.send(req.cookies), // cookies
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
			const origenDeUrl = procesos.origenDeUrls(prodEntidad ? prodEntidad : entidad).find(
				(n) =>
					(origenCodigo && origenCodigo == n.codigo) || // coincide el código de origen
					(origenUrl && origenUrl == origen.url) // coincide el url de origen
			);
			if (origenDeUrl) {
				destino = origenDeUrl.url;
				if (origenDeUrl.cola) destino += "/?id=" + (prodId ? prodId : id);
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

			// Quita la entidad de la 'cola'
			const colaActual = originalUrl.replace(rutaAntAct.ant, "");
			nuevaCola = colaActual.replace("?entidad=" + entidad, "");

			// Terminación de la 'cola'
			nuevaCola = nuevaCola.replace("/&", "/?");
			if (nuevaCola.endsWith("?")) nuevaCola = nuevaCola.slice(0, -1);
			if (nuevaCola.endsWith("/")) nuevaCola = nuevaCola.slice(0, -1);

			// Fin
			return res.redirect(nuevoUrl + nuevaCola);
		},
	},
};
