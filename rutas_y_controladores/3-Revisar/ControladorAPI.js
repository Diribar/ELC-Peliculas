"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");

// *********** Controlador ***********
module.exports = {
	// PRODUCTOS
	prodAlta: async (req, res) => {
		// Definir variables
		let {entidad, id: prodID} = req.query;
		let aprobado = req.query.aprob == "true";
		let userID = req.session.usuario.id;
		let ahora = compartidas.ahora();
		// Obtener el nuevo status_id
		const status = req.session.status_registro;
		let nuevoStatusID = aprobado
			? status.find((n) => n.alta_aprob).id
			: status.find((n) => n.inactivo).id;
		// Obtener el motivo si es un rechazo
		if (!aprobado) var {motivo_id} = req.query;
		if (!aprobado && !motivo_id) return res.json("false");
		// Cambiar el status en el original, dejar la marca del usuario y fecha en que esto se realizó
		let datos = {
			status_registro_id: nuevoStatusID,
			alta_analizada_por_id: userID,
			alta_analizada_en: ahora,
		};
		// Liberar la captura
		if (!aprobado) datos.captura_activa = 0;
		// Actualizar el status
		await BD_genericas.actualizarPorId(entidad, prodID, datos);
		// Agrega el registro en altas-aprob/rech
		let producto = await BD_genericas.obtenerPorId(entidad, prodID);
		let creador_ID = producto.creado_por_id;
		let entidad_id = compartidas.obtenerEntidad_id(entidad);
		datos = {
			[entidad_id]: prodID,
			sugerido_por_id: creador_ID,
			sugerido_en: producto.creado_en,
			analizado_por_id: userID,
			analizado_en: ahora,
			status_original_id: status.find((n) => n.creado).id,
			status_final_id: nuevoStatusID,
			aprobado,
		};
		if (!aprobado) {
			var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", {info_erronea: true});
			datos.motivo_id = motivo.id;
			datos.duracion = motivo.duracion;
		}
		BD_genericas.agregarRegistro("historial_cambios_de_status", datos);
		// Asienta la aprob/rech en el registro del usuario
		let campo = aprobado ? "prod_aprob" : "prod_rech";
		BD_genericas.aumentarElValorDeUnCampo("usuarios", creador_ID, campo, 1);
		// Penaliza al usuario si corresponde
		if (datos.duracion) procesos.usuario_Penalizar(creador_ID, motivo, "prod_");
		// Fin
		return res.json();
	},
	// Revisar la edición
	prodEdic: async (req, res) => {
		// Variables
		let {entidad: prodEntidad, id: prodID, edicion_id: edicID, campo} = req.query;
		const edicAprob = req.query.aprob == "true";
		const decision = edicAprob ? "edic_aprob" : "edic_rech";
		const userID = req.session.usuario.id;
		const ahora = compartidas.ahora();
		const status = req.session.status_registro;
		const RCLV_ids = ["personaje_id", "hecho_id", "valor_id"];
		let datos;
		// Obtener registros original
		let includes = [
			"en_castellano",
			"en_color",
			"idioma_original",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
		];
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, [
			...includes,
			"status_registro",
		]);
		let statusOrigAprob = prodOriginal.status_registro.aprobado;
		// Obtener el registro editado
		let prodEditado = await BD_genericas.obtenerPorIdConInclude("prods_edicion", edicID, includes);
		let editado_por_id = prodEditado.editado_por_id;
		// Detectar un eventual error
		if (
			!prodEditado &&
			((campo == "avatar" && !prodEditado.avatar_archivo) || (campo != "avatar" && !prodEditado[campo]))
		)
			return res.json("false");
		// Particularidades para el campo 'avatar'
		if (campo == "avatar") {
			// En 'edición', transfiere el valor de 'avatar_archivo' al campo 'avatar'
			datos = {avatar: prodEditado.avatar_archivo, avatar_archivo: null};
			prodEditado = {...prodEditado, ...datos};
			// Acciones si el avatarEdic fue aprobado
			if (edicAprob) {
				// Eliminar el avatar original (si es un archivo)
				let avatar = prodOriginal.avatar;
				if (!avatar.startsWith("http")) {
					let ruta = prodOriginal.status_registro.alta_aprob
						? "/imagenes/3-ProdRevisar/"
						: "/imagenes/2-Productos/";
					compartidas.borrarArchivo(ruta, avatar);
				}
				// Mover el avatarEdic a la carpeta definitiva
				compartidas.moverImagen(prodEditado.avatar, "3-ProdRevisar", "2-Productos");
			} else {
				// Eliminar el avatar editado
				compartidas.borrarArchivo("./publico/imagenes/3-ProdRevisar", prodEditado.avatar);
				// Acciones si el status es 'alta-aprobada'
				if (prodOriginal.status_registro.alta_aprob) {
					let avatar = prodOriginal.avatar;
					// Si el avatar original es un archivo, moverlo a su carpeta definitiva
					if (avatar && !avatar.startsWith("http"))
						compartidas.moverImagen(avatar, "3-ProdRevisar", "2-Productos");
				}
			}
		}
		// Si la edición fue aprobada, actualiza el registro de 'original' *******************
		if (edicAprob) {
			// Obtiene el nuevo valor
			datos = {[campo]: prodEditado[campo]};
			// Obtiene el Lead Time de Edición
			let leadTime = compartidas.obtenerLeadTime(prodEditado.editado_en, ahora);
			// Agrega datos de la 'edición'
			datos.editado_por_id = prodEditado.editado_por_id;
			datos.editado_en = prodEditado.editado_en;
			datos.edic_analizada_por_id = userID;
			datos.edic_analizada_en = ahora;
			datos.lead_time_edicion = leadTime;
			// Actualiza el registro ORIGINAL ***********************************************
			await BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
			prodOriginal = {...prodOriginal, ...datos};
		}
		// Asienta la aprob/rech en el registro del usuario
		BD_genericas.aumentarElValorDeUnCampo("usuarios", editado_por_id, decision, 1);
		// Actualiza el registro de 'EDICIÓN' quitándole el valor al campo
		datos = {[campo]: null};
		if (campo == "avatar") datos.avatar_archivo = null;
		await BD_genericas.actualizarPorId("prods_edicion", edicID, datos);
		// Verificar si no había ya un registro de ese usuario para ese campo en ese producto
		datos = {
			entidad: prodEntidad,
			entidad_id: prodID,
			campo,
			input_por_id: prodEditado.editado_por_id,
		};
		let averiguar = await BD_genericas.obtenerPorCampos(decision, datos);
		// Si no lo había, agregar un registro en esa tabla
		if (!averiguar) {
			// Obtener el título
			let titulo = variables.camposRevisarProd().find((n) => n.nombreDelCampo == campo).titulo;
			// Completar los datos
			datos = {
				...datos,
				titulo,
				input_en: prodEditado.editado_en,
				evaluado_por_id: userID,
				evaluado_en: ahora,
			};
			// Si fue rechazado, agregar campos
			if (!edicAprob) {
				let {motivo_id} = req.query;
				let condicion = motivo_id ? {id: motivo_id} : {info_erronea: true};
				var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", condicion);
				datos.duracion = motivo.duracion;
				datos.motivo_id = motivo.id;
			}
			// Obtiene los valores aprob/rech de edición, cuando es un ID
			let valores = await procesos.prod_EdicValores(edicAprob, prodOriginal, prodEditado, campo);
			datos = {...datos, ...valores};
			// Actualizar la BD de 'edic_aprob' / 'edicion_rech'
			BD_genericas.agregarRegistro(decision, datos);
		}
		// Penaliza al usuario si corresponde
		if (datos.duracion) procesos.usuario_Penalizar(editado_por_id, motivo, "edic_");
		// Borra los datos editados
		prodEditado[campo] = null;
		// Realiza estas tareas:
		// 1. Averigua si quedan campos por procesar
		// 2. Elimina el registro de edición si ya no tiene más datos
		// 3. Actualiza el status del registro original, si corresponde
		let [quedanCampos, , statusAprob] = await procesos.prod_Feedback(prodOriginal, prodEditado);
		// Si el producto está aprobado y se cambió un campo RCLV, actualizar en el RCLV el campo 'prod_aprob'
		if (
			prodOriginal[campo] != 1 &&
			((RCLV_ids.includes(campo) && edicAprob && statusAprob) || // Se cambió el campo RCLV, y el status está aprobado
				(!statusOrigAprob && statusAprob)) // El registro no estaba aprobado y ahora sí lo está
		)
			procesos.RCLVs_ActualizarProdAprobOK(prodOriginal, status); // Actualizar en RCLVs el campo 'prod_aprob'
		// Fin
		return res.json([quedanCampos, statusAprob]);
	},

	// RCLV
	// Aprobar el alta
	RCLV_Alta: async (req, res) => {
		// Variables
		let datos = req.query;
		let asociaciones = ["peliculas", "colecciones", "capitulos"];
		// Campos en el Include
		let includes = ["dia_del_ano"];
		if (datos.entidad == "personajes") includes.push("proceso_canonizacion", "rol_iglesia");
		// Obtener el RCLV_original
		let RCLV_original = await BD_genericas.obtenerPorIdConInclude(datos.entidad, datos.id, [
			...asociaciones,
			...includes,
		]);
		// Obtener los status
		const status = req.session.status_registro;
		let creado_id = status.find((n) => n.creado).id;
		let aprobado_id = status.find((n) => n.aprobado).id;
		// PROBLEMA 1: Registro no encontrado
		if (!RCLV_original) return res.json("Registro no encontrado");
		// PROBLEMA 2: El registro no está en status creado
		if (RCLV_original.status_registro_id != creado_id)
			return res.json("El registro no está en status creado");
		// Preparar el campo 'dia_del_ano_id'
		if (datos.desconocida == "false" && datos.mes_id && datos.dia) {
			let objeto = {mes_id: datos.mes_id, dia: datos.dia};
			let dia_del_ano = await BD_genericas.obtenerPorCampos("dias_del_ano", objeto);
			datos.dia_del_ano_id = dia_del_ano.id;
		} else if (datos.desconocida) datos.dia_del_ano_id = null;
		// Obtener el campo 'prod_aprob'
		let prod_aprob = await procesos.RCLV_averiguarSiTieneProdAprob(
			{...RCLV_original, status_registro_id: aprobado_id},
			status
		);
		// Preparar lead_time_creacion
		let alta_analizada_en = compartidas.ahora();
		let lead_time_creacion = (alta_analizada_en - RCLV_original.creado_en) / unaHora;
		// Preparar la información a ingresar
		datos = {
			...datos,
			prod_aprob,
			alta_analizada_por_id: req.session.usuario.id,
			alta_analizada_en,
			lead_time_creacion,
			status_registro_id: aprobado_id,
		};
		// Actualizar la versión original
		await BD_genericas.actualizarPorId(datos.entidad, datos.id, datos);
		// Actualizar la info de aprobados/rechazados
		procesos.RCLV_BD_AprobRech(datos.entidad, RCLV_original, includes, req.session.usuario.id);

		// Fin
		return res.json("Resultado exitoso");
	},

	// Links
	linkAlta: async (req, res) => {
		// Variables
		let api = req.query;
		let userID = req.session.usuario.id;
		let aprobado = api.aprobado == "SI";
		let status = req.session.status_registro;
		let st_aprobado = status.find((n) => n.aprobado).id;
		let st_inactivo = status.find((n) => n.inactivo).id;
		let ahora = compartidas.ahora();
		let datos;
		// Averiguar si no existe el 'url'
		if (!api.url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let link = await BD_genericas.obtenerPorCamposConInclude("links", {url: api.url}, [
			"status_registro",
		]);
		// El link no existe en la BD
		if (!link) return res.json({mensaje: "El link no existe en la base de datos", reload: true});
		// El link existe y no tiene status 'creado' o 'provisorio'
		let creado = link.status_registro.creado;
		let inactivar = link.status_registro.inactivar;
		let recuperar = link.status_registro.recuperar;
		let gr_provisorios = inactivar || recuperar;
		if (!creado && !gr_provisorios)
			return res.json({mensaje: "En este status no se puede procesos", reload: true});
		// Variables
		let decision = (!inactivar && aprobado) || (inactivar && !aprobado); // Obtener si la decisión valida al sugerido
		let sugerido_por_id = creado ? link.creado_por_id : link.sugerido_por_id;
		let motivo_id = !creado || !aprobado ? (creado ? api.motivo_id : link.motivo_id) : null;
		// USUARIO - Actualizaciones
		let campo = "link_" + (decision ? "aprob" : "rech");
		BD_genericas.aumentarElValorDeUnCampo("usuarios", sugerido_por_id, campo, 1);
		// USUARIO - Verifica la penalidad - sólo para 'creado/recuperar' + 'rechazado'
		if (!inactivar && !aprobado) {
			var motivo = await BD_genericas.obtenerPorId("altas_motivos_rech", motivo_id);
			procesos.usuario_Penalizar(sugerido_por_id, motivo, "link_");
		}
		// LINK - Pasa a status aprobado/rechazado -
		datos = {status_registro_id: aprobado ? st_aprobado : st_inactivo};
		if (creado) {
			// Datos para el link
			datos.alta_analizada_por_id = userID;
			datos.alta_analizada_en = compartidas.ahora();
			datos.lead_time_creacion = 1;
			if (!aprobado) {
				datos.sugerido_por_id = userID;
				datos.sugerido_en = ahora;
				datos.motivo_id = motivo_id;
			}
		}
		await BD_genericas.actualizarPorId("links", link.id, datos);
		// HISTORIAL DE CAMBIOS DE STATUS - Se agrega un registro
		let duracion = motivo ? motivo.duracion : 0;
		datos = {
			link_id: link.id,
			sugerido_por_id,
			sugerido_en: creado ? link.creado_en : link.sugerido_en,
			analizado_por_id: userID,
			analizado_en: ahora,
			status_original_id: link.status_registro_id,
			status_final_id: aprobado ? st_aprobado : st_inactivo,
			aprobado: decision,
			motivo_id,
			duracion,
		};
		BD_genericas.agregarRegistro("historial_cambios_de_status", datos);
		// PRODUCTO - Actualizar si tiene links gratuitos
		if (aprobado) compartidas.prodActualizar_campoProdLG(api.prodEntidad, api.prodID);
		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
	linkEdic: async (req, res) => {
		// Variables
		let api = req.query;
		let campo = api.campo;
		let userID = req.session.usuario.id;
		let aprobado = api.aprobado == "SI";
		let decision = aprobado ? "aprob" : "rech";
		// Obtener la edicion
		let edicion = await BD_genericas.obtenerPorId("links_edicion", api.edicion_id);
		if (!edicion) return res.json({mensaje: "No se encuentra el registro de la edición", reload: true});
		let link_id = edicion.link_id;
		let edicion_id = edicion.id;
		let sugerido_por_id = edicion.editado_por_id;
		// Se prepara el feedback a guardar
		let feedback = {[campo]: aprobado ? edicion[campo] : null};
		if (campo == "tipo_id" && edicion.completo !== null)
			feedback.completo = aprobado ? edicion.completo : null;
		if (campo == "tipo_id" && edicion.parte !== null) feedback.parte = aprobado ? edicion.parte : null;
		// Se guarda el feedback en LINKS o LINKS_EDICIONES
		aprobado
			? // Si fue aprobado => en el link original
			  await BD_genericas.actualizarPorId("links", link_id, feedback)
			: // Si fue rechazado => en el link editado
			  await BD_genericas.actualizarPorId("links_edicion", edicion_id, feedback);
		// Se prepara la información para agregar en la tabla de ediciones aprob/rech
		let datos = {
			entidad: "links",
			entidad_id: link_id,
			campo: campo,
			titulo: campo,
			valor_aprob: edicion[campo],
			input_por_id: sugerido_por_id,
			input_en: edicion.editado_en,
			evaluado_por_id: userID,
		};
		if (!aprobado) {
			var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", {info_erronea: true});
			datos.motivo_id = motivo.id;
			datos.duracion = motivo.duracion;
		}
		// Se agrega el registro en EDICIONES APROB/RECH
		BD_genericas.agregarRegistro("edic" + decision, datos);
		// Purga las ediciones
		let link = await BD_genericas.obtenerPorIdConInclude("links", link_id, ["ediciones"]); // Obtiene el link con sus ediciones
		let camposVacios = {};
		variables.camposRevisarLinks().forEach((campo) => (camposVacios[campo.nombreDelCampo] = null)); // Genera un objeto con valores null
		link.ediciones.forEach(async (edicion) => {
			// Purga cada edición
			let edicID = edicion.id;
			[quedanCampos, edicion] = await compartidas.pulirEdicion(link, edicion);
			// Si quedan campos, actualiza la edición
			if (quedanCampos)
				await BD_genericas.actualizarPorId("links_edicion", edicID, {
					...camposVacios,
					...edicion,
				});
			// Eliminar el registro de la edición
			else await BD_genericas.eliminarPorId("links_edicion", edicID);

		});
		// Actualizaciones en el USUARIO
		BD_genericas.aumentarElValorDeUnCampo("usuarios", sugerido_por_id, "edic" + decision, 1);
		if (!aprobado) procesos.usuario_Penalizar(sugerido_por_id, motivo, "edic_");
		// Actualizar si el producto tiene links gratuitos
		if (campo == "gratuito") compartidas.prodActualizar_campoProdLG(api.prodEntidad, api.prodID);
		// Se recarga la vista
		return res.json({mensaje: "Campo eliminado de la edición", reload: true});
	},
};
