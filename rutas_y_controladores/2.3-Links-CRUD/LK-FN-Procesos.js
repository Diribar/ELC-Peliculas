"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Links - Controlador Vista
	obtieneLinksActualizados: async (entidad, prodID, userID) => {
		// Obtiene para el usuario los links 'personalizados', es decir el original editado por él
		// Variables
		let producto_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
		let includes = ["tipo", "prov", "status_registro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		// Obtiene los linksOriginales
		let links = await BD_genericas.obtieneTodosPorCamposConInclude(
			"links",
			{[producto_id]: prodID},
			includes
		);
		// Ordenar por ID
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// Los combina con la edición, si existe
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
		let entidad_id = comp.obtieneEntidad_idDesdeEntidad(prodEntidad);
		// Obtiene el producto con include a links
		let producto = await BD_genericas.obtienePorIdConInclude(prodEntidad, prodID, [
			"links_gratis_en_BD",
			"links_gratis_en_web",
			"links",
			"status_registro",
		]);
		// Obtiene los links gratuitos de películas del producto
		let links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[entidad_id]: prodID}, [
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
			let si_no_parcial = await BD_genericas.obtieneTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
			let no = si_no_parcial.find((n) => n.no).id;
			// Acciones para LINKS GRATUITOS EN LA WEB
			datos.links_gratis_en_web_id = linksActivos.length
				? si
				: producto.links_gratis_en_web_id != no
				? talVez
				: no;
			// Acciones para LINKS GRATUITOS CARGADOS
			datos.links_gratis_en_bd_id = linksActivos.length ? si : linksTalVez.length ? talVez : no;
			// Actualizar la BD
			BD_genericas.actualizaPorId(prodEntidad, prodID, datos);
		}
		return;
	},
	datosLink: async (datos) => {
		// Funcion
		let obtieneProveedorID = async (url) => {
			// Obtiene el proveedor
			let proveedores = await BD_genericas.obtieneTodos("links_provs", "nombre");
			// Averigua si algún 'distintivo de proveedor' está incluido en el 'url'
			let proveedor = proveedores.filter((n) => !n.generico).find((n) => url.includes(n.url_distintivo));
			// Si no se reconoce el proveedor, se asume el 'desconocido'
			proveedor = proveedor ? proveedor : proveedores.find((n) => n.generico);
			return proveedor.id;
		};		
		// Datos del producto
		let producto_id = comp.obtieneEntidad_idDesdeEntidad(datos.prodEntidad);
		datos[producto_id] = datos.prodID;
		// Datos del proveedor
		datos.prov_id = await obtieneProveedorID(datos.url);
		// Particularidades
		if (datos.castellano == "1") datos.subtit_castellano = null;
		if (datos.tipo_id == "1") datos.completo = 1;
		if (datos.completo == "1") datos.parte = "-";
		// Fin
		return datos
	},
};
