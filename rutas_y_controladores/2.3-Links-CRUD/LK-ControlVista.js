"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./LK-FN-Procesos");
const variables = require("../../funciones/3-Procesos/Variables");

// *********** Controlador ***********
module.exports = {
	linksForm: async (req, res) => {
		// DETALLE - ABM
		// Tema y Código
		const tema = "links_crud";
		const codigo = "abmLinks";
		// Obtiene los datos identificatorios del producto y del usuario
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario.id;
		// Obtiene los datos ORIGINALES y EDITADOS del producto
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// Obtiene el avatar
		let imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;
		// Combina los datos Editados con la versión Original
		let producto = {...original, ...edicion, id};
		// Obtiene información de BD
		let links = await procesos.obtieneLinksActualizados(entidad, id, userID);
		// Separar entre 'gr_activos' y 'gr_inactivos'
		// Obtiene el producto y el título
		let prodNombre = comp.obtieneEntidadNombreDesdeEntidad(entidad);
		let titulo = "ABM de Links de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Actualiza linksEnProd
		procsCRUD.linksEnProd({entidad, id});
		// Obtiene datos para la vista
		if (entidad == "capitulos") {
			let coleccion_id = edicion && edicion.coleccion_id ? edicion.coleccion_id : original.coleccion_id;
			let temporada = edicion && edicion.temporada ? edicion.temporada : original.temporada;
			producto.capitulos = await BD_especificas.obtieneCapitulos(coleccion_id, temporada);
		}
		const motivos = motivos_rech_altas.filter((n) => n.links).map((n) => ({id: n.id, descripcion: n.descripcion}));
		const origen = req.query.origen ? req.query.origen : "DTP";
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
