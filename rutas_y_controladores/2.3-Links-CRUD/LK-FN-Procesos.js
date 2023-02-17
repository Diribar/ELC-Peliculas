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
		let links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[producto_id]: prodID}, includes);
		// Ordenar por ID
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// Los combina con la edición, si existe
		links.forEach((link, i) => {
			if (link.ediciones.length) {
				let edicion = link.ediciones.find((n) => n.editado_por_id == userID);
				if (edicion)
					for (let campo in edicion)
						if (edicion[campo] !== null && camposARevisar.includes(campo)) links[i][campo] = edicion[campo];
			}
		});
		// Fin
		return links;
	},
	datosLink: (datos) => {
		// Datos del producto
		let producto_id = comp.obtieneEntidad_idDesdeEntidad(datos.prodEntidad);
		datos[producto_id] = datos.prodID;

		// Obtiene el proveedor
		let proveedor = proveedores.find((n) => n.url_distintivo && datos.url.includes(n.url_distintivo));
		// Si no se reconoce el proveedor, se asume el 'desconocido'
		proveedor = proveedor ? proveedor : proveedores.find((n) => n.generico);
		datos.prov_id = proveedor.id;

		// Particularidades
		if (datos.castellano == "1") datos.subtit_castellano = null;
		if (datos.tipo_id == "1") datos.completo = 1;
		if (datos.completo == "1") datos.parte = "-";
		// Fin
		return datos;
	},
};
