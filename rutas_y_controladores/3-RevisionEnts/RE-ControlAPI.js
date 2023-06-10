"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RE-Procesos");

// *********** Controlador ***********
module.exports = {
	// Productos y RCLV
	obtieneMotivoGenerico: (req, res) => {
		let motivoGenerico_id = motivosEdics.find((n) => n.info_erronea).id;
		return res.json(motivoGenerico_id);
	},
	edicAprobRech: async (req, res) => {
		// Variables
		const {entidad, edicID, campo, aprob, motivo_id} = req.query;
		const nombreEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		const revID = req.session.usuario.id;
		const camposDDA = ["diaDelAno_id", "diasDeDuracion"];
		let statusAprob;

		// Obtiene el registro editado
		const include = comp.obtieneTodosLosCamposInclude(entidad);
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

		// Procesa la edición - Realiza muchísimas tareas
		const objeto = {entidad, original, edicion, revID, campo, aprob, motivo_id};
		[edicion, statusAprob] = await procesos.edicion.edicAprobRech(objeto);

		// Si existen otras ediciones con los mismos valores que el original
		// 1. Elimina el valor de esos campos
		// 2. Evalúa si corresponde eliminar cada registro de edición, y en caso afirmativo lo elimina
		if (!edicion) {
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const condicion = {[campo_id]: entID};
			const ediciones = await BD_genericas.obtieneTodosPorCondicion(nombreEdic, condicion);
			if (ediciones.length) {
				const originalGuardado = await BD_genericas.obtienePorId(entidad, entID);
				for (let edic of ediciones) await procsCRUD.puleEdicion(entidad, originalGuardado, edic);
			}
		}

		// Solapamiento y diasDelAno
		if (entidad == "epocasDelAno" && camposDDA.includes(campo)) {
			// Si es necesario, actualiza el original quitándole el solapamiento
			if (original.solapamiento) BD_genericas.actualizaPorId(entidad, id, {solapamiento: false});

			// Averigua si en la edición quedan camposDDA
			let quedan = false;
			if (edicion) for (let campoDDA of camposDDA) if (edicion[campoDDA]) quedan = true;

			// Si el campo editado fue un campoDDA y en la edición no quedan más camposDDA, actualiza los 'diasDelAno'
			if (!quedan && camposDDA.includes(campo)) {
				// Variables
				const orig = await BD_genericas.obtienePorId(entidad, entID);
				const desde = orig.diaDelAno_id;
				const duracion = orig.diasDeDuracion - 1;

				// Actualiza los diasDelAno
				await procesos.guardar.actualizaDiasDelAno({id: entID, desde, duracion});
			}
		}

		// Fin
		return res.json({OK: true, quedanCampos: !!edicion, statusAprob});
	},
	// Links
	linkAltaBaja: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, url, IN, aprob, motivo_id} = req.query;
		const entidad = "links";

		// PROBLEMAS
		// Averigua si existe el dato del 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let original = await BD_genericas.obtienePorCondicionConInclude(entidad, {url}, ["statusRegistro", "tipo"]);
		const id = original.id;
		// El link no existe en la BD
		if (!original) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y tiene un status 'estable'
		if (original.statusRegistro.gr_estables) return res.json({mensaje: "En este status no se puede procesar", reload: true});

		// Variables de status
		const creado = original.statusRegistro.creado;
		const inactivar = original.statusRegistro.inactivar;
		const recuperar = original.statusRegistro.recuperar;

		// Más variables
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const revID = req.session.usuario.id;
		const ahora = comp.fechaHora.ahora();
		const altaRevisadaEn = ahora;
		const statusRegistro_id = IN == "SI" ? aprobado_id : inactivo_id;
		const decisAprob = aprob == "SI";
		const campoDecision = petitFamilias + (decisAprob ? "Aprob" : "Rech");

		// Arma los datos
		let datos = {
			statusRegistro_id,
			sugeridoPor_id: revID,
			sugeridoEn: altaRevisadaEn,
		};
		if (creado) {
			datos.altaRevisadaPor_id = revID;
			datos.altaRevisadaEn = altaRevisadaEn;
			datos.leadTimeCreacion = comp.obtieneLeadTime(original.creadoEn, altaRevisadaEn);
		}
		if (aprob != "SI" && IN != "SI") datos.motivo_id = motivo_id ? motivo_id : original.motivo_id;

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Agrega un registro en el histStatus
		let datosHist;
		let sugeridoPor_id = original.sugeridoPor_id;
		(() => {
			datosHist = {
				entidad_id: id,
				entidad,
				sugeridoPor_id,
				sugeridoEn: creado ? original.creadoEn : original.sugeridoEn,
				revisadoPor_id: revID,
				revisadoEn: ahora,
				statusOriginal_id: original.statusRegistro_id,
				statusFinal_id: statusRegistro_id,
				aprobado: decisAprob,
			};
			if (datos.motivo_id) {
				datosHist.motivo_id = datos.motivo_id;
				datosHist.motivo = motivosStatus.find((n) => n.id == motivo_id);
				datosHist.duracion = Number(datosHist.motivo.duracion);
			}
			return;
		})();
		// return res.json({});
		BD_genericas.agregaRegistro("histStatus", datosHist);

		// 3. Aumenta el valor de linksAprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", sugeridoPor_id, campoDecision, 1);

		// 4. Penaliza al usuario si corresponde
		if (datosHist.motivo) comp.usuarioPenalizAcum(sugeridoPor_id, datosHist.motivo, petitFamilias);

		// 5. Actualiza los productos, en los campos 'castellano', 'linksGratuitos' y 'linksGeneral'
		procsCRUD.accionesPorCambioDeStatus(entidad, {...original, statusRegistro_id});

		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
};
