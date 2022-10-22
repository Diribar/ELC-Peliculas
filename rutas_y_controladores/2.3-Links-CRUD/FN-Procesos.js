"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	// Links - Controlador Vista
	obtenerLinksActualizados: async (entidad, prodID, userID) => {
		// Obtiene para el usuario los links 'personalizados', es decir el original editado por él
		// Variables
		let producto_id = comp.obtieneEntidad_id(entidad);
		let includes = ["tipo", "prov", "status_registro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisarLinks.map((n) => n.nombreDelCampo);
		// Obtiene los linksOriginales
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[producto_id]: prodID},
			includes
		);
		// Ordenar por ID
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// Combinarlos con la edición, si existe
		links.forEach((link, i) => {
			if (link.ediciones.length) {
				let edicion = link.ediciones.find((n) => n.editado_por_id == userID);
				if (edicion)
					for (let campo in edicion)
						if (edicion[campo] !== null && camposARevisar.includes(campo))
							links[i][campo] = edicion[campo];
			}
		});
		// Fin
		return links;
	},
	prodCampoLG: async (prodEntidad, prodID) => {
		// Variables
		let datos = {};
		let entidad_id = comp.obtieneEntidad_id(prodEntidad);
		// Obtiene el producto con include a links
		let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, [
			"links_gratuitos_cargados",
			"links_gratuitos_en_la_web",
			"links",
			"status_registro",
		]);
		// Obtiene los links gratuitos de películas del producto
		let links = await BD_genericas.obtenerTodosPorCamposConInclude("links", {[entidad_id]: prodID}, [
			"status_registro",
			"tipo",
		])
			.then((n) => (n.length ? n.filter((n) => n.gratuito) : ""))
			.then((n) => (n.length ? n.filter((n) => n.tipo.pelicula) : ""));
		// Obtiene los links 'Aprobados' y 'TalVez'
		let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : [];
		let linksTalVez = links.length ? links.filter((n) => n.status_registro.gr_creado) : [];
		if (linksActivos.length || linksTalVez.length) {
			// Obtiene los ID de si, no y TalVez
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
};
