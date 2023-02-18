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
		let prodEntidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtiene los datos ORIGINALES y EDITADOS del producto
		let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(prodEntidad, prodID, userID);
		// Obtiene el avatar
		let imgDerPers = procsCRUD.avatarOrigEdic(prodOrig, prodEdic).edic;
		// Combina los datos Editados con la versión Original
		let producto = {...prodOrig, ...prodEdic, id: prodID};
		// Obtiene información de BD
		let links = await procesos.obtieneLinksActualizados(prodEntidad, prodID, userID);
		// Separar entre 'gr_activos' y 'gr_inactivos'
		// Configurar el producto, el título
		let prodNombre = comp.obtieneEntidadNombre(prodEntidad);
		let titulo = "ABM de Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtiene datos para la vista
		if (prodEntidad == "capitulos") {
			let coleccion_id =
				prodEdic && prodEdic.coleccion_id ? prodEdic.coleccion_id : prodOrig.coleccion_id;
			let temporada = prodEdic && prodEdic.temporada ? prodEdic.temporada : prodOrig.temporada;
			producto.capitulos = await BD_especificas.obtieneCapitulos(coleccion_id, temporada);
		}
		let motivos = await BD_genericas.obtieneTodos("altas_motivos_rech", "orden")
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		// Va a la vista
		//return res.send(links);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			entidad: prodEntidad,
			prodID,
			userID,
			titulo,
			producto,
			links,
			links_provs,
			links_tipos,
			vista: req.baseUrl + req.path,
			title: producto.nombre_castellano,
			calidades: variables.calidades,
			motivos,
			imgDerPers,
			cartelEscondido: true,
		});
	},
};
