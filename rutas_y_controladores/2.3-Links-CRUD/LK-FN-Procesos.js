"use strict";
// Definir variables
const BD_genericas = require("../../funciones/1-BD/Genericas");
const variables = require("../../funciones/2-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const comp = require("../../funciones/2-Procesos/Compartidas");

module.exports = {
	// Links - Controlador Vista
	obtieneLinksActualizados: async (entidad, prodID, userID) => {
		// Obtiene para el usuario los links 'personalizados', es decir el original editado por él
		// Variables
		let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let include = ["tipo", "prov", "statusRegistro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);
		// Obtiene los linksOriginales
		let links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: prodID}, include);
		// Ordenar por ID
		links.sort((a, b) => a.id - b.id);
		// Los combina con la edición, si existe
		links.forEach((link, i) => {
			if (link.ediciones.length) {
				let edicion = link.ediciones.find((n) => n.editadoPor_id == userID);
				if (edicion)
					for (let campo in edicion)
						if (edicion[campo] !== null && camposARevisar.includes(campo)) links[i][campo] = edicion[campo];
			}
		});
		// Fin
		return links;
	},
	datosLink: async (datos) => {
		// Datos del producto
		const campo_id = comp.obtieneDesdeEntidad.campo_id(datos.prodEntidad);
		datos[campo_id] = datos.prodID;

		// Obtiene el status del producto
		datos.prodAprob = await BD_genericas.obtienePorId(datos.prodEntidad, datos.prodID).then((n) =>
			[creadoAprob_id, aprobado_id].includes(n.statusRegistro_id)
		);

		// Obtiene el proveedor
		let proveedor = linksProvs.find((n) => n.url_distintivo && datos.url.includes(n.url_distintivo));
		proveedor = proveedor ? proveedor : linksProvs.find((n) => n.generico); // Si no se reconoce el proveedor, se asume el 'desconocido'
		datos.prov_id = proveedor.id;

		// Particularidades
		if (datos.castellano == "1") datos.subtitulos = null;
		if (datos.tipo_id == "1") datos.completo = 1;
		if (datos.completo == "1") datos.parte = "-";

		// Fin
		return datos;
	},
	condiciones: (link, userID, tema) => {
		// Variables
		let cond = {};
		cond.propio = link.statusSugeridoPor_id == userID;
		cond.ajeno = link.statusSugeridoPor_id != userID;
		cond.rud = tema == "links_crud";
		cond.revision = tema == "revisionEnts";

		// Condiciones de status
		cond.creado = link.statusRegistro.codigo == "creado";
		cond.creadoAprob = link.statusRegistro.creadoAprob;
		cond.aprobado = link.statusRegistro.aprobado;
		cond.inactivar = link.statusRegistro.inactivar;
		cond.recuperar = link.statusRegistro.recuperar;
		cond.inactivo = link.statusRegistro.inactivo;

		// Condiciones de status combinados
		cond.grCreado = cond.creado || cond.creadoAprob;
		cond.estable = cond.aprobado || cond.inactivo;
		cond.provisorio = cond.inactivar || cond.recuperar;
		cond.inactivos = (cond.rud && cond.inactivar) || cond.inactivo;

		// Condiciones de status y propio/ajeno
		cond.creadoPropio = cond.creado && cond.propio;
		cond.creadoAjeno = cond.creado && cond.ajeno;
		cond.inactivarPropio = cond.inactivar && cond.propio;
		cond.recuperarPropio = cond.recuperar && cond.propio;

		// Condiciones de status combinados y propio/ajeno
		cond.provPropio = cond.provisorio && cond.propio;
		cond.provAjeno = cond.provisorio && cond.ajeno;
		cond.propios = cond.creadoPropio || cond.provPropio;
		cond.ajenos = cond.creadoAjeno || cond.provAjeno;

		// Fin
		return cond;
	},
};
