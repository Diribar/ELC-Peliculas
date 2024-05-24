"use strict";
// Variables
const procsCRUD = require("../2.0-Familias/FM-Procesos");
const procesos = require("./LK-FN-Procesos");

// *********** Controlador ***********
module.exports = {
	abm: async (req, res) => {
		// Variables
		const tema = "linksCRUD";
		const codigo = "abmLinks";
		const {entidad, id, grupo, origen} = req.query;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "ABM de Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		const userID = req.session.usuario.id;

		// Obtiene los datos ORIGINALES y EDITADOS del producto
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion({entidad, entID: id, userID});
		let producto = {...original, ...edicion, id}; // Combina los datos Editados con la versión Original

		// Obtiene información de BD
		const links = await procesos.obtieneLinksConEdicion(entidad, id, userID);
		links.sort((a, b) => a.tipo_id - b.tipo_id); // primero los links de trailer, luego la película
		for (let link of links) {
			if (!link.prov.embededPoner || !link.gratuito) link.href = "//" + link.url; // prepara el url para usarse en la web
			link.cond = procesos.condiciones(link, userID, tema);
			link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";
		}

		// Actualiza linksEnProd
		procsCRUD.linksEnProd({entidad, id});

		// Obtiene datos para la vista
		if (entidad == "capitulos") {
			const coleccion_id = edicion && edicion.coleccion_id ? edicion.coleccion_id : original.coleccion_id;
			const temporada = edicion && edicion.temporada ? edicion.temporada : original.temporada;
			producto.capitulos = await BD_especificas.obtieneCapitulos(coleccion_id, temporada);
		}
		const motivos = motivosStatus.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const status_id = original.statusRegistro_id;
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic; // Obtiene el avatar
		const sigProd = grupo == "inactivo" ? await procesos.sigProdInactivo({producto, entidad, userID}) : null;
		const ayudasTitulo = [
			"Sé muy cuidadoso de incluir links que respeten los derechos de autor",
			"Al terminar, conviene que vayas a la de 'Detalle' para liberar el producto",
			"Si hay datos en rojo, es porque están editados por otro usuario",
		];

		// Va a la vista
		// return res.send(links);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo},
			...{entidad, familia: "producto", id, origen},
			...{registro: producto, links, status_id},
			...{linksProvs, linksTipos, calidades: variables.calidades, motivos},
			...{userID, imgDerPers, cartelGenerico: true, sigProd, grupo},
			vista: req.baseUrl + req.path,
		});
	},
	visualizacion: async (req, res) => {
		// Variables
		const tema = "linksCRUD";
		const codigo = "visualizacion";
		const linkID = req.query.link_id;
		const usuario = req.session.usuario ? req.session.usuario : null;
		const userID = usuario ? usuario.id : "";
		const origen = req.query.origen ? req.query.origen : "";

		// Obtiene el link y su proveedor
		const link = await BD_genericas.obtienePorIdConInclude("links", linkID, "prov");
		const provEmbeded = provsEmbeded.find((n) => n.id == link.prov_id);
		link.url = "//" + link.url.replace(provEmbeded.embededQuitar, provEmbeded.embededPoner);

		// Obtiene el producto 'Original' y 'Editado'
		const entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
		const id = link[comp.obtieneDesdeCampo_id.campo_idProd(link)];
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion({entidad, entID: id, userID});
		const prodComb = {...original, ...edicion, id}; // obtiene la versión más completa posible del producto
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Configura el título de la vista
		const nombre = prodComb.nombreCastellano ? prodComb.nombreCastellano : prodComb.nombreOriginal;
		const tituloDetalle = nombre;
		const titulo = nombre;

		// Va a la vista
		//return res.send(link)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, tituloDetalle, titulo, origen},
			...{entidad, id, familia: "producto", registro: prodComb, link},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			iconosMobile: true,
		});
	},
};
