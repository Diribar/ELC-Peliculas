"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	obtenerVersionesDelProducto: async (entidad, prodID, userID) => {
		// Definir los campos include
		let includes = [
			"idioma_original",
			"en_castellano",
			"en_color",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
		];
		let includesOriginal = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOriginal.push("coleccion");
		else if (entidad == "colecciones") includesOriginal.push("capitulos");
		// Obtener el producto ORIGINAL
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			...includes,
			...includesOriginal,
		]);
		// Obtener el producto EDITADO
		let prodEditado = "";
		let producto_id = compartidas.obtenerEntidad_id(entidad);
		if (prodOriginal) {
			// Quitarle los campos 'null'
			prodOriginal = compartidas.quitarLosCamposSinContenido(prodOriginal);
			// Obtener los datos EDITADOS del producto
			prodEditado = await BD_genericas.obtenerPorCamposConInclude(
				"prods_edicion",
				{[producto_id]: prodID, editado_por_id: userID},
				includes
			);
			// Quitarle los campos 'null'
			if (prodEditado) prodEditado = compartidas.quitarLosCamposSinContenido(prodEditado);
		}
		return [prodOriginal, prodEditado];
	},
	prod_ActualizarCampoLG: async (prodEntidad, prodID) => {
		// Variables
		let datos = {};
		let entidad_id = compartidas.obtenerEntidad_id(prodEntidad);
		// Obtener el producto con include a links
		let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, [
			"links_gratuitos_cargados",
			"links_gratuitos_en_la_web",
			"links",
			"status_registro",
		]);
		// Obtener los links gratuitos de películas del producto
		let links = await BD_genericas.obtenerTodosPorCamposConInclude("links", {[entidad_id]: prodID}, [
			"status_registro",
			"tipo",
		])
			.then((n) => (n.length ? n.filter((n) => n.gratuito) : ""))
			.then((n) => (n.length ? n.filter((n) => n.tipo.pelicula) : ""));
		// Obtener los links 'Aprobados' y 'TalVez'
		let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : [];
		let linksTalVez = links.length ? links.filter((n) => n.status_registro.gr_pend_aprob) : [];
		if (linksActivos.length || linksTalVez.length) {
			// Obtener los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
			let no = si_no_parcial.find((n) => n.no).id;
			// Acciones para LINKS GRATUITOS EN LA WEB
			datos.links_gratuitos_en_la_web_id = linksActivos.length
				? si
				: producto.links_gratuitos_en_la_web_id != no
				? talVez
				: no;
			// Acciones para LINKS GRATUITOS CARGADOS
			datos.links_gratuitos_cargados_id = linksActivos.length ? si : linksTalVez.length ? talVez : no;
			// Actualizar la BD
			BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
		}
		return;
	},
	prod_ActualizarCampoLG_OK: async (prodEntidad, prodID, campo) => {
		if (campo == "gratuito" && prodEntidad.gratuito) {
			// Obtener los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			BD_genericas.actualizarPorId("links", prodID, {
				links_gratuitos_cargados_id: si,
				links_gratuitos_en_la_web_id: si,
			});
		}
	},

};
