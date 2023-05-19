"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./LK-FN-Procesos");
const variables = require("../../funciones/1-Procesos/Variables");

// *********** Controlador ***********
module.exports = {
	linksForm: async (req, res) => {
		// DETALLE - ABM
		// Tema y Código
		const tema = "links_crud";
		const codigo = "abmLinks";

		// Variables
		const entidad = req.query.entidad;
		const id = req.query.id;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const titulo = "ABM de Links de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		const userID = req.session.usuario.id;
		const origen = req.query.origen;

		// Obtiene los datos ORIGINALES y EDITADOS del producto
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// Obtiene el avatar
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;
		// Combina los datos Editados con la versión Original
		let producto = {...original, ...edicion, id};
		// Obtiene información de BD
		const links = await procesos.obtieneLinksActualizados(entidad, id, userID);

		// Actualiza linksEnProd
		procsCRUD.linksEnProd({entidad, id});
		// Obtiene datos para la vista
		if (entidad == "capitulos") {
			const coleccion_id = edicion && edicion.coleccion_id ? edicion.coleccion_id : original.coleccion_id;
			const temporada = edicion && edicion.temporada ? edicion.temporada : original.temporada;
			producto.capitulos = await BD_especificas.obtieneCapitulos(coleccion_id, temporada);
		}
		const motivos = motivos_status.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const status_id = original.status_registro_id;
		// Va a la vista
		//return res.send(links);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, title: producto.nombre_castellano},
			...{entidad, familia: "producto", id, origen},
			...{registro: producto, links, status_id},
			...{links_provs, links_tipos, calidades: variables.calidades, motivos},
			userID,
			vista: req.baseUrl + req.path,
			imgDerPers,
			cartelGenerico: true,
		});
	},
};
