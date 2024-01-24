"use strict";
// Variables
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
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
			let edicsEliminadas = procsCRUD.revisiones.eliminaDemasEdiciones({entidad, original: originalGuardado, id: entID}); // elimina las demás ediciones
			statusAprob = procsCRUD.revisiones.statusAprob({entidad, registro: originalGuardado});
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
	// Links
	linkAltaBaja: async (req, res) => {
		// Variables
		const {url, IN, aprob, motivo_id} = req.query;
		const entidad = "links";
		const ahora = comp.fechaHora.ahora();
		if (!cantLinksVencPorSem) await comp.actualizaLinksVencPorSem();

		// PROBLEMAS
		if (!url) return res.json("Falta el 'url' del link"); // Averigua si existe el dato del 'url'
		const original = await BD_genericas.obtienePorCondicionConInclude(entidad, {url}, "statusRegistro"); // Se obtiene el status original del link
		if (!original) return res.json("El link no existe en la base de datos"); // El link no existe en la BD
		if (original.statusRegistro.estables) return res.json("En este status no se puede procesar"); // El link existe y tiene un status 'estable'

		// Semana de vencimiento
		if (IN == "SI") {
			const semMinima = linksPrimRev / unaSemana;
			for (var semana = linksSemsVidaUtil - 1; semana > semMinima; semana--)
				if (cantLinksVencPorSem[semana] < cantLinksVencPorSem.cantPromedio) break;
			if (semana == semMinima) return res.json("En esta semana ya no se puede revisar este link");
		}

		// Fecha de vencimiento
		const anoActual = new Date().getFullYear();
		const anoReciente = anoActual - linkAnoReciente;
		const noTrailer = original.tipo_id != linkTrailer_id;
		const ahoraTiempo = ahora.getTime();
		const statusCreado = original.statusRegistro_id == creado_id;
		const fechaVencim =
			IN != "SI"
				? null
				: statusCreado || // si está recién creado
				  !original.anoEstreno || // si se desconoce su año de estreno
				  (original.anoEstreno > anoReciente && noTrailer) // si es reciente y no es un trailer
				? new Date(ahoraTiempo + linksPrimRev)
				: original.capitulo_id && noTrailer // si es un capitulo y no es un trailer
				? new Date(ahoraTiempo + linksVidaUtil)
				: new Date(ahoraTiempo + semana * unaSemana);
		console.log(113, fechaVencim);

		// Más variables
		const id = original.id;
		const petitFamilias = "links";
		const revID = req.session.usuario.id;
		const statusRegistro_id = IN == "SI" ? aprobado_id : inactivo_id;
		const decisAprob = aprob == "SI";
		const campoDecision = "links" + (decisAprob ? "Aprob" : "Rech");

		// Arma los datos
		let datos = {
			fechaVencim,
			statusSugeridoPor_id: revID,
			statusSugeridoEn: ahora,
			statusRegistro_id,
			motivo_id: statusRegistro_id == inactivo_id ? (motivo_id ? motivo_id : original.motivo_id) : null,
		};
		if (statusCreado) {
			datos.altaRevisadaPor_id = revID;
			datos.altaRevisadaEn = ahora;
			datos.leadTimeCreacion = comp.obtieneLeadTime(original.creadoEn, ahora);
		} else datos.yaTuvoPrimRev = true;

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// Acciones salvo que sea links sugerido por 'automático'
		const sugeridoPor_id = original.statusSugeridoPor_id;
		if (sugeridoPor_id != usAutom_id) {
			// 2. Agrega un registro en el histStatus
			let datosHist = {
				entidad_id: id,
				entidad,
				sugeridoPor_id,
				sugeridoEn: statusCreado ? original.creadoEn : original.statusSugeridoEn,
				revisadoPor_id: revID,
				revisadoEn: ahora,
				statusOriginal_id: original.statusRegistro_id,
				statusFinal_id: statusRegistro_id,
				aprobado: decisAprob,
				comentario: statusRegistros.find((n) => n.id == statusRegistro_id).nombre,
			};
			if (datos.motivo_id) {
				datosHist.motivo_id = datos.motivo_id;
				datosHist.motivo = motivosStatus.find((n) => n.id == datos.motivo_id);
				datosHist.duracion = Number(datosHist.motivo.duracion);
				datosHist.comentario += " - " + datosHist.motivo.descripcion;
			}
			BD_genericas.agregaRegistro("histStatus", datosHist);

			// 3. Aumenta el valor de linksAprob/rech en el registro del usuario
			BD_genericas.aumentaElValorDeUnCampo("usuarios", sugeridoPor_id, campoDecision, 1);

			// 4. Penaliza al usuario si corresponde
			if (datosHist.motivo) comp.usuarioPenalizAcum(sugeridoPor_id, datosHist.motivo, petitFamilias);
		}

		// 5. Actualiza los productos en los campos de 'links'
		procsCRUD.revisiones.accionesPorCambioDeStatus(entidad, {...original, statusRegistro_id});

		// Se recarga la vista
		return res.json("");
	},
};
