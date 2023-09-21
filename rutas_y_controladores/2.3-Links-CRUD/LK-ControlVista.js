"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/1-BD/Genericas");
const BD_especificas = require("../../funciones/1-BD/Especificas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./LK-FN-Procesos");
const variables = require("../../funciones/2-Procesos/Variables");

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
		for (let link of links) link.cond = procesos.condiciones(link, userID, tema);

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
};
