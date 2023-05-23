"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/1-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const comp = require("../../funciones/1-Procesos/Compartidas");

module.exports = {
	// Links - Controlador Vista
	obtieneLinksActualizados: async (entidad, prodID, userID) => {
		// Obtiene para el usuario los links 'personalizados', es decir el original editado por él
		// Variables
		let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let include = ["tipo", "prov", "status_registro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		// Obtiene los linksOriginales
		let links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: prodID}, include);
		// Ordenar por ID
		links.sort((a, b) => a.id - b.id);
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
		let campo_id = comp.obtieneDesdeEntidad.campo_id(datos.prodEntidad);
		datos[campo_id] = datos.prodID;

		// Obtiene el proveedor
		let proveedor = links_provs.find((n) => n.url_distintivo && datos.url.includes(n.url_distintivo));
		// Si no se reconoce el proveedor, se asume el 'desconocido'
		proveedor = proveedor ? proveedor : links_provs.find((n) => n.generico);
		datos.prov_id = proveedor.id;

		// Particularidades
		if (datos.castellano == "1") datos.subtitulos = null;
		if (datos.tipo_id == "1") datos.completo = 1;
		if (datos.completo == "1") datos.parte = "-";
		// Fin
		return datos;
	},
	condiciones: (link, userID) => {
		// Variables
		let cond = {};
		cond.propio = link.sugerido_por_id == userID;
		cond.ajeno = link.sugerido_por_id != userID;
		cond.rud = tema == "links_crud";
		cond.revision = tema == "revisionEnts";

		// Condiciones de status
		cond.creado = link.status_registro.creado;
		cond.aprobado = link.status_registro.aprobado;
		cond.inactivar = link.status_registro.inactivar;
		cond.recuperar = link.status_registro.recuperar;
		cond.inactivo = link.status_registro.inactivo;

		// Condiciones de status combinados
		cond.creadoAprob = cond.creado || cond.aprobado;
		cond.estable = cond.aprobado || cond.inactivo;
		cond.provisorio = cond.inactivar || cond.recuperar;
		cond.inactivos = (cond.rud && cond.inactivar) || cond.inactivo;

		// Condiciones de status y propio/ajeno
		cond.creadoPropio = cond.creado && cond.propio;
		cond.creadoAjeno = cond.creado && cond.ajeno;
		cond.inactivarPropio = cond.inactivar && cond.propio;
		cond.recuperarPropio = cond.recuperar && cond.propio;
		
		cond.provPropio = cond.provisorio && cond.propio;
		cond.provAjeno = cond.provisorio && cond.ajeno;
		cond.propios = cond.creadoPropio || cond.provPropio;
		cond.ajenos = cond.creadoAjeno || cond.provAjeno;

		// Fin
		return cond
	},
};
