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
		const camposDDA = ["fechaDelAno_id", "diasDeDuracion"];
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

		// Realiza muchísimas tareas y obtiene la edición en su mínima expresión
		const objeto = {entidad, original, edicion, originalGuardado, revID, campo, aprob, motivo_id};
		edicion = await procesos.edicion.edicAprobRech(objeto);

		// Acciones si se terminó de revisar la edición
		if (!edicion) {
			let edicsEliminadas = procsCRUD.eliminaDemasEdiciones({entidad, original: originalGuardado, id: entID}); // elimina las demás ediciones
			statusAprob = procsCRUD.statusAprob({entidad, registro: originalGuardado});
			[statusAprob, edicsEliminadas] = await Promise.all([statusAprob, edicsEliminadas]);
		}

		// Solapamiento y fechasDelAno
		if (entidad == "epocasDelAno" && camposDDA.includes(campo)) {
			// Si es necesario, actualiza el original quitándole el solapamiento
			if (original.solapamiento) BD_genericas.actualizaPorId(entidad, id, {solapamiento: false});

			// Averigua si en la edición quedan camposDDA
			let quedan = false;
			if (edicion) for (let campoDDA of camposDDA) if (edicion[campoDDA]) quedan = true;

			// Si el campo editado fue un campoDDA y en la edición no quedan más camposDDA, actualiza los 'fechasDelAno'
			if (!quedan && camposDDA.includes(campo)) {
				// Variables
				const orig = await BD_genericas.obtienePorId(entidad, entID);
				const desde = orig.fechaDelAno_id;
				const duracion = orig.diasDeDuracion - 1;

				// Actualiza los fechasDelAno
				await procesos.guardar.actualizaDiasDelAno({id: entID, desde, duracion});
			}
		}

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
			const {url, IN} = req.query;
			const ahora = comp.fechaHora.ahora();
			let semana = 0;

			// PROBLEMA - Valida que exista el dato del 'url'
			if (!url) return res.json("Falta el 'url' del link");

			// PROBLEMA - Valida que el link exista en la BD
			const link = await BD_genericas.obtienePorCondicionConInclude("links", {url}, variables.entidades.asocProds);
			if (!link) return res.json("El link no existe en la base de datos");

			// PROBLEMA - Valida que el link tenga un status distinto a 'estable'
			if (estables_ids.includes(link.statusRegistro_id)) return res.json("En este status no se puede procesar");

			// PROBLEMA - Si es con restricción y no queda lugar, interrumpe la función
			const linkEstandarAprob = IN == "SI" && comp.linksVencPorSem.categoria_id(link) == linkEstandar_id;
			if (
				linkEstandarAprob &&
				((link.capitulo_id && !cantLinksVencPorSem.paraProc.capitulos) || // es un capítulo y no queda lugar
					(!link.capitulo_id && !cantLinksVencPorSem.paraProc.pelisColes)) // no es un capítulo y no queda lugar
			)
				return res.json("En esta semana ya no se puede revisar este link");

			// Si se aprobó el link y es una categoría estándar, averigua su semana
			if (linkEstandarAprob) {
				// Semana para capítulo
				if (link.capitulo_id) semana = linksSemsVidaUtil;
				// Semana para los demás
				else {
					// Variables
					const semPrimRev = linksPrimRev / unaSemana;
					const corte = semPrimRev + 1; // 'semPrimRev'--> nuevos, '+1'--> estreno reciente
					const piso = corte + 1;

					// Obtiene la semana a la cual agregarle una fecha de vencimiento (método 'flat')
					const cantLinksVencPorSemMayorCorte = Object.values(cantLinksVencPorSem)
						.slice(piso) // descarta los registros de la semanas anteriores al piso
						.slice(0, -3) // descarta los registros finales
						.map((n) => n.prods);
					console.log(129, cantLinksVencPorSemMayorCorte);
					const cantMin = Math.min(...cantLinksVencPorSemMayorCorte);
					semana = cantLinksVencPorSemMayorCorte.lastIndexOf(cantMin) + piso;
				}
			}

			// Más variables
			const {id, statusRegistro_id, decisAprob, datos, campoDecision, motivo_id, statusCreado, revID} =
				procesos.links.variables({link, ahora, req, semana});

			// CONSECUENCIAS - Actualiza el registro del link
			await BD_genericas.actualizaPorId("links", id, datos);

			// CONSECUENCIAS - Acciones si es un link sugerido por un usuario distinto a'automático'
			const sugeridoPor_id = link.statusSugeridoPor_id;
			if (sugeridoPor_id != usAutom_id) {
				// Agrega un registro en el histStatus
				let datosHist = {
					entidad_id: id,
					entidad: "links",
					sugeridoPor_id,
					sugeridoEn: statusCreado ? link.creadoEn : link.statusSugeridoEn,
					revisadoPor_id: revID,
					revisadoEn: ahora,
					statusOriginal_id: link.statusRegistro_id,
					statusFinal_id: statusRegistro_id,
					aprobado: decisAprob,
					comentario: statusRegistros.find((n) => n.id == statusRegistro_id).nombre,
				};
				if (motivo_id) {
					datosHist.motivo_id = motivo_id;
					datosHist.motivo = motivosStatus.find((n) => n.id == motivo_id);
					datosHist.duracion = Number(datosHist.motivo.duracion);
					datosHist.comentario += " - " + datosHist.motivo.descripcion;
				}
				BD_genericas.agregaRegistro("histStatus", datosHist);

				// Aumenta el valor de linksAprob/rech en el registro del usuario
				BD_genericas.aumentaElValorDeUnCampo("usuarios", sugeridoPor_id, campoDecision, 1);

				// Penaliza al usuario si corresponde
				if (datosHist.motivo) comp.penalizacAcum(sugeridoPor_id, datosHist.motivo, "links");
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