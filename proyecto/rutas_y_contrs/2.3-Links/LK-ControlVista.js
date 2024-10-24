"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const procsProd = require("../2.1-Prods-RUD/PR-FN-Procesos");
const procesos = require("./LK-FN-Procesos");

// *********** Controlador ***********
module.exports = {
	abm: async (req, res) => {
		// Variables
		const tema = "linksCrud";
		const codigo = "abmLinks";
		const entidad = comp.obtieneEntidadDesdeUrl(req);
		const {id, grupo, origen} = req.query;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "ABM de Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		const usuario_id = req.session.usuario.id;

		// Obtiene los datos ORIGINALES y EDITADOS del producto
		const [original, edicion] = await procsFM.obtieneOriginalEdicion({entidad, entId: id, usuario_id});
		let producto = {...original, ...edicion, id}; // Combina los datos Editados con la versión Original

		// Obtiene información de BD
		const links = await procesos.obtieneLinksConEdicion(entidad, id, usuario_id);
		links.sort((a, b) => a.tipo_id - b.tipo_id); // primero los links de trailer, luego la película
		for (let link of links) {
			if (!link.prov.embededPoner || !link.gratuito) link.href = "//" + link.url; // prepara el url para usarse en la web
			link.cond = procesos.condicion(link, usuario_id, tema);
			link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";
		}

		// Actualiza linksEnProd
		comp.linksEnProd({entidad, id});

		// Obtiene datos para la vista
		if (entidad == "capitulos") {
			const coleccion_id = edicion && edicion.coleccion_id ? edicion.coleccion_id : original.coleccion_id;
			const temporada = edicion && edicion.temporada ? edicion.temporada : original.temporada;
			producto.capitulos = await procsFM.obtieneCapitulos(coleccion_id, temporada);
		}
		const motivos = statusMotivos.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const status_id = original.statusRegistro_id;
		const imgDerPers = procsFM.obtieneAvatar(original, edicion).edic; // Obtiene el avatar
		const sigProd = grupo == "inactivo" ? await procesos.sigProdInactivo({producto, entidad, usuario_id}) : null;
		const ayudasTitulo = [
			"Sé muy cuidadoso de incluir links que respeten los derechos de autor",
			"Al terminar, conviene que vayas a la de 'Detalle' para liberar el producto",
			"Si hay datos en rojo, es porque están editados por otro usuario",
		];
		const interesDelUsuario = await procsProd.obtieneInteresDelUsuario({usuario_id, entidad, entidad_id: id});
		const anchorEncab = true;

		// Va a la vista
		// return res.send(links);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo},
			...{entidad, familia: "producto", id, origen},
			...{registro: producto, links, status_id, interesDelUsuario},
			...{linksProvs, linksTipos, calidadesDeLink, motivos},
			...{usuario_id, imgDerPers, cartelGenerico: true, sigProd, grupo},
			...{vista: req.baseUrl + req.path, anchorEncab},
		});
	},
	mirarLink: async (req, res) => {
		// Variables
		const tema = "linksCrud";
		const codigo = "mirarLink";
		const {id} = req.query;
		const usuario = req.session.usuario ? req.session.usuario : null;
		const usuario_id = usuario ? usuario.id : "";
		const origen = req.query.origen ? req.query.origen : "";

		// Obtiene el link y su proveedor
		const link = await baseDeDatos.obtienePorId("links", id, "prov");
		const provEmbeded = provsEmbeded.find((n) => n.id == link.prov_id);
		link.url = "//" + link.url.replace(provEmbeded.embededQuitar, provEmbeded.embededPoner);

		// Obtiene el producto 'Original' y 'Editado'
		const entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
		const prodId = link[comp.obtieneDesdeCampo_id.campo_idProd(link)];
		const [original, edicion] = await procsFM.obtieneOriginalEdicion({entidad, entId: prodId, usuario_id});
		const prodComb = {...original, ...edicion, id: prodId}; // obtiene la versión más completa posible del producto
		const imgDerPers = procsFM.obtieneAvatar(original, edicion).edic;

		// Configura el título de la vista
		const nombre = prodComb.nombreCastellano ? prodComb.nombreCastellano : prodComb.nombreOriginal;
		const tituloDetalle = nombre;
		const titulo = nombre;

		// Va a la vista
		//return res.send(link)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, tituloDetalle, titulo, origen},
			...{entidad, id: prodId, familia: "producto", registro: prodComb, link},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			iconosMobile: true,
		});
	},
};
