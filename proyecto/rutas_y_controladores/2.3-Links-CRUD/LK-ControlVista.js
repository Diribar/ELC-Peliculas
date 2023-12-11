"use strict";
// Variables
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./LK-FN-Procesos");


// *********** Controlador ***********
module.exports = {
	links: async (req, res) => {
		// Variables
		const tema = "linksCRUD";
		const codigo = "abmLinks";
		const {entidad, id, grupo, origen} = req.query;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "ABM de Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		const userID = req.session.usuario.id;

		// Obtiene los datos ORIGINALES y EDITADOS del producto
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		let producto = {...original, ...edicion, id}; // Combina los datos Editados con la versión Original

		// Obtiene información de BD
		const links = await procesos.obtieneLinksActualizados(entidad, id, userID);
		links.sort((a, b) => a.tipo_id - b.tipo_id);
		for (let link of links) {
			link.cond = procesos.condiciones(link, userID, tema);
			link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";
		}

		// Actualiza linksEnProd
		procsCRUD.revisiones.linksEnProd({entidad, id});

		// Obtiene datos para la vista
		if (entidad == "capitulos") {
			const coleccion_id = edicion && edicion.coleccion_id ? edicion.coleccion_id : original.coleccion_id;
			const temporada = edicion && edicion.temporada ? edicion.temporada : original.temporada;
			producto.capitulos = await BD_especificas.obtieneCapitulos(coleccion_id, temporada);
		}
		const motivos = motivosStatus.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const status_id = original.statusRegistro_id;
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic; // Obtiene el avatar
		const siguienteProducto = grupo == "inactivo" ? await procesos.sigProdInactivo({producto, entidad, userID}) : null;

		// Va a la vista
		//return res.send(links);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, title: producto.nombreCastellano},
			...{entidad, familia: "producto", id, origen},
			...{registro: producto, links, status_id},
			...{linksProvs, linksTipos, calidades: variables.calidades, motivos},
			...{userID, imgDerPers, cartelGenerico: true, siguienteProducto},
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

		// Obtiene el link
		const link = await BD_genericas.obtienePorId("links", linkID); // link
		const provLink = linksProvs.find((n) => n.id == link.prov_id); // provLink
		const entidad = comp.obtieneDesdeEdicion.entidadProd(link); // entidad del producto
		const id = link[comp.obtieneDesdeEdicion.campo_idProd(link)]; // id del producto

		// Obtiene el producto 'Original' y 'Editado'
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		const prodComb = {...original, ...edicion, id}; // obtiene la versión más completa posible del producto
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Configura el título de la vista
		const nombre = prodComb.nombreCastellano ? prodComb.nombreCastellano : prodComb.nombreOriginal;
		const tituloDetalle = nombre + "(" + provLink.nombre + ")";
		const titulo = nombre;

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, tituloDetalle, titulo},
			...{entidad, id, familia: "producto", registro: prodComb},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
		});
	},
};
