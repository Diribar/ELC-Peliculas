"use strict";
// Definir variables
const BD_genericas = require("../../funciones/1-BD/Genericas");
const variables = require("../../funciones/2-Procesos/Variables");
const procsMS = require("../9-Miscelaneas/MS-Procesos");
const comp = require("../../funciones/2-Procesos/Compartidas");

module.exports = {
	// Links - Controlador Vista
	obtieneLinksActualizados: async (entidad, prodID, userID) => {
		// Variables
		let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let include = ["tipo", "prov", "statusRegistro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);

		// Obtiene los linksOriginales
		let links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: prodID}, include);

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
			aprobados_ids.includes(n.statusRegistro_id)
		);

		// Obtiene el proveedor
		let proveedor = linksProvs.find((n) => n.urlDistintivo && datos.url.includes(n.urlDistintivo));
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
		cond.rud = tema == "linksCRUD";
		cond.revision = tema == "revisionEnts";

		// Condiciones de status
		cond.creado = link.statusRegistro_id == creado_id;
		cond.creadoAprob = link.statusRegistro_id == creadoAprob_id;
		cond.aprobado = link.statusRegistro_id == aprobado_id;
		cond.inactivar = link.statusRegistro_id == inactivar_id;
		cond.recuperar = link.statusRegistro_id == recuperar_id;
		cond.inactivo = link.statusRegistro_id == inactivo_id;

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
	sigProdInactivo: async ({producto, entidad, userID}) => {
		// Variables
		const productos = await procsMS.obtieneProds_Links(userID).then((n) => n.LI);

		// Obtiene el siguiente producto
		const siguienteProducto = productos.find((n) => n.entidad != entidad || n.id != producto.id);

		// Genera el link
		const link = siguienteProducto
			? "/inactivar-captura/?entidad=" +
			  entidad +
			  "&id=" +
			  producto.id +
			  "&prodEntidad=" +
			  siguienteProducto.entidad +
			  "&prodID=" +
			  siguienteProducto.id +
			  "&origen=LKM&grupo=inactivo"
			: "/mantenimiento";

		// Fin
		return link;
	},
};
