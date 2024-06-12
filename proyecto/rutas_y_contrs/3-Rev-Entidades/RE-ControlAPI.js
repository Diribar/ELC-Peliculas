"use strict";
// Variables
const procsCRUD = require("../2.0-Familias/FM-Procesos");
const procesos = require("./RE-Procesos");

// *********** Controlador ***********
module.exports = {
	// Productos y RCLV
	obtieneMotivoGenerico: (req, res) => {
		return res.json(motivoInfoErronea.id);
	},
	edicAprobRech: async (req, res) => {
		// Variables
		const {entidad, edicID, campo, aprob, motivo_id} = req.query;
		const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const revID = req.session.usuario.id;
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		let statusAprob;

		// Obtiene el registro editado
		let edicion = await BD_genericas.obtienePorIdConInclude(nombreEdic, edicID, include);

		// PROBLEMAS
		// 1. No existe la edición
		if (!edicion) return res.json({mensaje: "No se encuentra la edición"});
		// 2. No existe el campo a analizar
		if (edicion[campo] === null) return res.json({mensaje: "El campo no está pendiente para procesar"});
		// 3. Rechazado sin motivo
		if (!aprob && !motivo_id) return res.json({mensaje: "Falta especificar el motivo del rechazo"});

		// Obtiene la versión original con include
		const entID = entidad == "links" ? edicion.link_id : req.query.id;
		const original = await BD_genericas.obtienePorIdConInclude(entidad, entID, [...include, "statusRegistro"]);

		// Obtiene la versión a guardar
		const originalGuardado = aprob ? {...original, [campo]: edicion[campo]} : {...original}; // debe estar antes de que se procese la edición

		// Entre otras tareas, actualiza el original si fue aprobada la sugerencia, y obtiene la edición en su mínima expresión
		const objeto = {entidad, original, edicion, originalGuardado, revID, campo, aprob, motivo_id};
		edicion = await procesos.edicion.edicAprobRech(objeto);

		// Acciones si se terminó de revisar la edición
		if (!edicion) {
			let edicsEliminadas = procsCRUD.eliminaDemasEdiciones({entidad, original: originalGuardado, id: entID}); // elimina las demás ediciones
			statusAprob = procsCRUD.statusAprob({entidad, registro: originalGuardado});
			[statusAprob, edicsEliminadas] = await Promise.all([statusAprob, edicsEliminadas]);
		}

		// Actualiza el solapamiento
		if (entidad == "epocasDelAno" && ["fechaDelAno_id", "diasDeDuracion"].includes(campo) && aprob)
			await comp.actualizaSolapam();

		// Fin
		return res.json({OK: true, quedanCampos: !!edicion, statusAprob});
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
	links: {
		altaBaja: async (req, res) => {
			// Variables
			const {url} = req.query;
			const link = await BD_genericas.obtienePorCondicionConInclude("links", {url}, variables.entidades.asocProds);

			// Más variables
			const {id, statusRegistro_id, statusCreado, decisAprob, datos, campoDecision, motivo_id, revID} =
				procesos.links.variables({link, req});

			// CONSECUENCIAS - Actualiza el registro del link
			await BD_genericas.actualizaPorId("links", id, datos);

			// CONSECUENCIAS - Acciones si es un link sugerido por un usuario distinto a'automático'
			const statusOriginalPor_id = link.statusSugeridoPor_id;
			if (statusOriginalPor_id != usAutom_id) {
				// Agrega un registro en el histStatus
				let datosHist = {
					entidad_id: id,
					entidad: "links",
					statusOriginal_id: link.statusRegistro_id,
					statusFinal_id: statusRegistro_id,
					statusOriginalPor_id,
					statusFinalPor_id: revID,
					statusOriginalEn: statusCreado ? link.creadoEn : link.statusSugeridoEn,
					aprobado: decisAprob,
				};
				let motivo;
				if (motivo_id) {
					motivo = motivosStatus.find((n) => n.id == motivo_id);
					datosHist.motivo_id = motivo_id;
					datosHist.duracion = Number(motivo.duracion);
					datosHist.comentario = motivo.descripcion;
				}
				BD_genericas.agregaRegistro("histStatus", datosHist);

				// Aumenta el valor de linksAprob/rech en el registro del usuario
				BD_genericas.aumentaElValorDeUnCampo("usuarios", statusOriginalPor_id, campoDecision, 1);

				// Penaliza al usuario si corresponde
				if (motivo) comp.penalizacAcum(statusOriginalPor_id, motivo, "links");
			}

			// CONSECUENCIAS - Actualiza los productos en los campos de 'links'
			await procsCRUD.accionesPorCambioDeStatus("links", {...link, statusRegistro_id});

			// Fin
			return res.json("");
		},
		sigProd: async (req, res) => {
			// Variables
			const {entidad, id} = req.query;
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const revID = req.session.usuario.id;
			let sigProd = true;

			// Si algún link del producto está en status inestable, indica que no se debe pasar al siguiente producto
			const links = await BD_genericas.obtienePorIdConInclude(entidad, id, "links").then((n) => n.links);
			for (let link of links) if (!estables_ids.includes(link.statusRegistro_id)) sigProd = null;

			// Averigua si queda alguna edición de link del producto
			if (sigProd) sigProd = !(await BD_genericas.obtienePorCondicion("linksEdicion", {[campo_id]: id}));

			// Averigua el producto siguiente
			if (sigProd) sigProd = await procesos.TC.obtieneSigProd_Links(revID);

			// Fin
			return res.json(sigProd);
		},
		obtieneEmbededLink: async (req, res) => {
			// Variables
			const {linkID, linkUrl} = req.query;

			// Obtiene el link y el proveedor
			const link = linkID
				? await BD_genericas.obtienePorId("links", linkID)
				: await BD_genericas.obtienePorCondicion("links", {url: linkUrl});
			const provEmbeded = provsEmbeded.find((n) => n.id == link.prov_id);

			// Acciones si es embeded
			let url = provEmbeded ? "//" + link.url.replace(provEmbeded.embededQuitar, provEmbeded.embededPoner) : "";
			//if (url.includes("youtube.com")) url += "?autoplay=1&mute=1";

			// Fin
			return res.json(url);
		},
	},
};
