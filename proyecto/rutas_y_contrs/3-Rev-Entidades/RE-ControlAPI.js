"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const procsProd = require("../2.1-Prods-RUD/PR-FN-Procesos");
const procesos = require("./RE-Procesos");

module.exports = {
	// Productos y RCLV
	obtieneMotivoGenerico: (req, res) => res.json(motivoInfoErronea.id),
	edicAprobRech: async (req, res) => {
		// Variables
		const {entidad, edicId, campo, aprob, motivo_id} = req.query;
		const revId = req.session.usuario.id;
		const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		let statusAprob, reload;

		// Obtiene el registro editado
		let edicion = await baseDeDatos.obtienePorId(nombreEdic, edicId, include);

		// Obtiene la versión original con include
		const entId = entidad == "links" ? edicion.link_id : req.query.id;
		const original = await baseDeDatos.obtienePorId(entidad, entId, [...include, "statusRegistro"]);

		// Obtiene la versión a guardar
		const originalGuardado = aprob ? {...original, [campo]: edicion[campo]} : {...original}; // debe estar antes de que se procese la edición

		// Campos especiales - RCLVs
		if (familias == "rclvs") {
			if (campo == "fechaMovil" && originalGuardado.fechaMovil == "0") {
				await baseDeDatos.actualizaPorId(entidad, entId, {anoFM: null}); // debe serlo por el eventual solapamiento
				baseDeDatos.actualizaPorId(nombreEdic, edicId, {anoFM: null});
				reload = !aprob; // si fue rechazado, se debe recargar la vista para quitar 'anoFM'
			}
		}

		// Entre otras tareas, actualiza el original si fue aprobada la sugerencia, y obtiene la edición en su mínima expresión
		const objeto = {entidad, original, edicion, originalGuardado, revId, campo, aprob, motivo_id};
		edicion = await procesos.edicion.edicAprobRech(objeto);

		// Acciones si se terminó de revisar la edición
		if (!edicion) {
			let edicsEliminadas = procsFM.elimina.demasEdiciones({entidad, original: originalGuardado, id: entId}); // elimina las demás ediciones
			statusAprob = procsProd.accionesPorCambioDeStatus({entidad, registro: originalGuardado});
			[statusAprob, edicsEliminadas] = await Promise.all([statusAprob, edicsEliminadas]);

			// Específico de links
			if (entidad == "links") await comp.linksVencPorSem.actualizaCantLinksPorSem();
		}

		// Actualiza el solapamiento
		if (entidad == "epocasDelAno" && aprob) comp.actualizaSolapam();

		// Fin
		return res.json({OK: true, quedanCampos: !!edicion, statusAprob, reload});
	},
	actualizaVisibles: (req, res) => {
		// Variables
		const datos = JSON.parse(req.query.datos);
		const {circuito, familias, titulo, desplegar} = datos;

		// Crea el objeto si no existe
		if (!req.session) req.session = {};
		if (!req.session.tableros) req.session.tableros = {};
		if (!req.session.tableros[circuito]) req.session.tableros[circuito] = {};
		if (!req.session.tableros[circuito][familias]) req.session.tableros[circuito][familias] = {};

		// Guarda la session
		req.session.tableros[circuito][familias][titulo] = desplegar;

		// Fin
		return res.json();
	},

	// Links
	sigProdLinks: async (req, res) => {
		// Variables
		const {entidad, id} = req.query;
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const revId = req.session.usuario.id;
		let sigProd = true;

		// Si algún link del producto está en status inestable, indica que no se debe pasar al siguiente producto
		const links = await baseDeDatos.obtienePorId(entidad, id, "links").then((n) => n.links);
		for (let link of links) if (!estables_ids.includes(link.statusRegistro_id)) sigProd = null;

		// Si queda alguna edición de link del producto, indica que no se debe pasar al siguiente producto
		if (sigProd) sigProd = !(await baseDeDatos.obtienePorCondicion("linksEdicion", {[campo_id]: id}));

		// Averigua el producto siguiente
		if (sigProd) sigProd = await procesos.tablRevision.obtieneSigProd_Links(revId);

		// Fin
		return res.json(sigProd);
	},
};
