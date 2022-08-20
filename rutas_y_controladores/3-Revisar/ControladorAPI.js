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
		// Variables
		const {entidad: prodEntidad, id: prodID} = req.query;
		const altaAprob = req.query.aprob == "true";
		const decision = edicAprob ? "prod_aprob" : "prod_rech";
		const userID = req.session.usuario.id;
		const ahora = compartidas.ahora();
		// Obtiene el nuevo status_id
		const status = req.session.status_registro;
		let nuevoStatusID = altaAprob
			? status.find((n) => n.alta_aprob).id
			: status.find((n) => n.inactivo).id;
		// Obtiene el motivo si es un rechazo
		if (!altaAprob) var {motivo_id} = req.query;
		if (!altaAprob && !motivo_id) return res.json("false");
		// Cambiar el status en el original, dejar la marca del usuario y fecha en que esto se realizó
		let datos = {
			status_registro_id: nuevoStatusID,
			alta_analizada_por_id: userID,
			alta_analizada_en: ahora,
		};
		// Liberar la captura
		if (!altaAprob) datos.captura_activa = 0;
		// Actualizar el status
		await BD_genericas.actualizarPorId(prodEntidad, prodID, datos);
		// Agrega el registro en altas-aprob/rech
		let producto = await BD_genericas.obtenerPorId(prodEntidad, prodID);
		let creador_ID = producto.creado_por_id;
		let entidad_id = compartidas.obtenerEntidad_id(prodEntidad);
		datos = {
			[entidad_id]: prodID,
			sugerido_por_id: creador_ID,
			sugerido_en: producto.creado_en,
			analizado_por_id: userID,
			analizado_en: ahora,
			status_original_id: status.find((n) => n.creado).id,
			status_final_id: nuevoStatusID,
			aprobado: altaAprob,
		};
		if (!altaAprob) {
			var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", {info_erronea: true});
			datos.motivo_id = motivo.id;
			datos.duracion = motivo.duracion;
		}
		BD_genericas.agregarRegistro("historial_cambios_de_status", datos);
		// Asienta la aprob/rech en el registro del usuario
		BD_genericas.aumentarElValorDeUnCampo("usuarios", creador_ID, decision, 1);
		// Penaliza al usuario si corresponde
		if (datos.duracion) procesos.usuario_Penalizar(creador_ID, motivo);
		// Fin
		return res.json();
	},
	// Revisar la edición
	prodEdic: async (req, res) => {
		// Variables
		const {entidad: prodEntidad, id: prodID, edicion_id: edicID, campo} = req.query;
		const edicAprob = req.query.aprob == "true";
		const status = req.session.status_registro;
		const userID = req.session.usuario.id;
		// Obtiene el registro editado
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
		let prodEdic = await BD_genericas.obtenerPorIdConInclude("prods_edicion", edicID, includes);
		// Verificación: averigua si existe la edición y el campo a analizar
		let condicion1 = campo == "avatar" && prodEdic && !prodEdic.avatar_archivo;
		let condicion2 = campo != "avatar" && prodEdic && !prodEdic[campo];
		if (!prodEdic || condicion1 || condicion2) return res.json("false");
		// Obtiene el producto original
		let prodOrig, statusOrigAprob;
		datos = [entidad, id, includes, edicAprob, prodEdic, campo];
		[prodOrig, prodEdic, statusOrigAprob] = await obtieneProdOrig(...datos);
		// Si la edición fue aprobada, actualiza el registro 'original' *******************
		datos = {[campo]: prodEdic[campo]};
		if (edicAprob) prodOrig = await actualizaOriginal(prodOrig, prodEdic, datos, userID);
		// Actualizaciones en el USUARIO
		accionesEnUsuario(req, prodOrig, prodEdic);
		// Limpia la edición  y cambia el status del producto si corresponde
		let [quedanCampos, , statusAprob] = await procesos.prodEdic_feedback(prodOrig, prodEdic);
		// Actualiza en RCLVs el campo 'prod_aprob', si corresponde
		procesos.RCLV_productosAprob(prodOrig, campo, edicAprob, statusOrigAprob, statusAprob, status);
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
		// Obtiene el RCLV_original
		let RCLV_original = await BD_genericas.obtenerPorIdConInclude(datos.entidad, datos.id, [
			...asociaciones,
			...includes,
		]);
		// Obtiene los status
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
		// Obtiene el campo 'prod_aprob'
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
		const {prodEntidad, prodID, url, motivo_id} = req.query;
		const altaAprob = req.query.aprob == "true";
		const userID = req.session.usuario.id;
		const status = req.session.status_registro;
		const st_aprobado = status.find((n) => n.aprobado).id;
		const st_inactivo = status.find((n) => n.inactivo).id;
		const ahora = compartidas.ahora();
		let datos;
		// Averiguar si no existe el 'url'
		if (!url) return res.json({mensaje: "Falta el 'url' del link", reload: true});
		// Se obtiene el status original del link
		let link = await BD_genericas.obtenerPorCamposConInclude("links", {url}, ["status_registro"]);
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
		let decision = (!inactivar && altaAprob) || (inactivar && !altaAprob); // Obtiene si la decisión valida al sugerido
		let sugerido_por_id = creado ? link.creado_por_id : link.sugerido_por_id;
		motivo_id = !creado || !altaAprob ? (creado ? motivo_id : link.motivo_id) : null;
		// USUARIO - Actualizaciones
		let campo = "link_" + (decision ? "aprob" : "rech");
		BD_genericas.aumentarElValorDeUnCampo("usuarios", sugerido_por_id, campo, 1);
		// USUARIO - Verifica la penalidad - sólo para 'creado/recuperar' + 'rechazado'
		if (!inactivar && !altaAprob) {
			var motivo = await BD_genericas.obtenerPorId("altas_motivos_rech", motivo_id);
			procesos.usuario_Penalizar(sugerido_por_id, motivo);
		}
		// LINK - Pasa a status aprobado/rechazado -
		datos = {status_registro_id: altaAprob ? st_aprobado : st_inactivo};
		if (creado) {
			// Datos para el link
			datos.alta_analizada_por_id = userID;
			datos.alta_analizada_en = compartidas.ahora();
			datos.lead_time_creacion = 1;
			if (!altaAprob) {
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
			status_final_id: altaAprob ? st_aprobado : st_inactivo,
			aprobado: decision,
			motivo_id,
			duracion,
		};
		BD_genericas.agregarRegistro("historial_cambios_de_status", datos);
		// PRODUCTO - Actualizar si tiene links gratuitos
		if (altaAprob) procesos.links_prodCampoLG_OK(prodEntidad, prodID);
		// Se recarga la vista
		return res.json({mensaje: "Status actualizado", reload: true});
	},
	linkEdic: async (req, res) => {
		// Variables
		const {prodEntidad, prodID, edicion_id: edicID, campo} = req.query;
		const edicAprob = req.query.aprob == "true";
		const decision = edicAprob ? "edic_aprob" : "edic_rech";
		const userID = req.session.usuario.id;
		let datos;
		// Obtiene el registro editado
		let linkEdic = await BD_genericas.obtenerPorId("links_edicion", edicID);
		// Verificación: averigua si existe la edición y el campo a analizar
		let condicion = linkEdic && !linkEdic[campo];
		if (!linkEdic || condicion) return res.json({mensaje: "false", reload: true});
		// Obtiene los campos 'consecuencia'
		let campos = obtieneCamposLinkEdic(edicAprob, linkEdicion, campo);
		// Si la edición fue aprobada, actualiza el registro 'original' *******************
		let linkID = linkEdic.link_id;
		let linkOrig = {id: linkID};
		if (edicAprob) linkOrig = await actualizaOriginal(linkOrig, linkEdic, campos, userID);
		// Actualizaciones en el USUARIO
		accionesEnUsuario(req, linkOrig, linkEdic);
		// Limpia las ediciones
		await linksEdic_LimpiarEdiciones(linkOrig);
		// Actualiza si el producto tiene links gratuitos
		if (edicAprob) procesos.links_prodCampoLG_OK(prodEntidad, prodID, campo);
		// Se recarga la vista
		return res.json({mensaje: "Campo eliminado de la edición", reload: true});
	},
};

let obtieneProdOrig = async (entidad, id, includes, edicAprob, prodEdic, campo) => {
	// Obtiene el registro original
	includes.push("status_registro");
	let prodOrig = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes);
	// Guarda el dato de si el registro original está aprobado
	statusOrigAprob = prodOrig.status_registro.aprobado;
	// Particularidades para el campo 'avatar'
	if (campo == "avatar") prodEdic = accionesSiElCampoEsAvatar(edicAprob, prodOrig, prodEdic);
	// Fin
	return [prodOrig, prodEdic, statusOrigAprob];
};
let accionesSiElCampoEsAvatar = (edicAprob, prodOrig, prodEdic) => {
	// En 'edición', transfiere el valor de 'avatar_archivo' al campo 'avatar'
	let datos = {avatar: prodEdic.avatar_archivo, avatar_archivo: null};
	prodEdic = {...prodEdic, ...datos};
	// Acciones si el avatarEdic fue aprobado
	if (edicAprob) {
		// Mueve el 'avatar editado' a la carpeta definitiva
		compartidas.moverImagen(prodEdic.avatar, "3-ProdRevisar", "2-Productos");
		// Elimina el 'avatar original' (si es un archivo)
		let avatar = prodOrig.avatar;
		if (!avatar.startsWith("http")) {
			let ruta = prodOrig.status_registro.alta_aprob
				? "/imagenes/3-ProdRevisar/"
				: "/imagenes/2-Productos/";
			compartidas.borrarArchivo(ruta, avatar);
		}
	} else {
		// Elimina el 'avatar editado'
		compartidas.borrarArchivo("./publico/imagenes/3-ProdRevisar", prodEdic.avatar);
		// Mueve el 'avatar original' a la carpeta definitiva (si es un archivo y está en status 'altaAprob')
		if (prodOrig.status_registro.alta_aprob && prodOrig.avatar && !prodOrig.avatar.startsWith("http"))
			compartidas.moverImagen(prodOrig.avatar, "3-ProdRevisar", "2-Productos");
	}
	return prodEdic;
};
let obtieneCamposLinkEdic = (edicAprob, linkEdicion, campo) => {
	// Se preparan los datos 'consecuencia' a guardar
	let datos = {[campo]: edicAprob ? linkEdicion[campo] : null};
	if (campo == "tipo_id" && linkEdicion.completo !== null)
		datos.completo = edicAprob ? linkEdicion.completo : null;
	if (campo == "tipo_id" && linkEdicion.parte !== null) datos.parte = edicAprob ? linkEdicion.parte : null;
	// Fin
	return datos;
};
let actualizaOriginal = async (original, edicion, datos, userID) => {
	// Variables
	const ahora = compartidas.ahora();
	const entidad = compartidas.obtieneEntidadOrigDesdeEdicion(edicion);

	// Genera la información a actualizar
	datos = {
		...datos,
		editado_por_id: edicion.editado_por_id,
		editado_en: edicion.editado_en,
		edic_analizada_por_id: userID,
		edic_analizada_en: ahora,
		lead_time_edicion: compartidas.todos_obtenerLeadTime(edicion.editado_en, ahora),
	};
	// Actualiza el registro ORIGINAL ***********************************************
	await BD_genericas.actualizarPorId(entidad, original.id, datos);
	original = {...original, ...datos};
	// Fin
	return original;
};
let accionesEnUsuario = async (req, original, edicion) => {
	// 1. Contabiliza la aprob/rech en el registro del usuario
	// 2. Agrega un registro en la tabla de 'aprob/rech'
	// 3. Si corresponde, penaliza al usuario

	// Variables
	const edicAprob = req.query.aprob == "true";
	const decision = edicAprob ? "edic_aprob" : "edic_rech";
	const {entidad, id, campo} = req.query;
	const userID = req.session.usuario.id;
	let datos;

	// Función
	let justDoIt = async () => {
		// Aumenta el campo Aprob/Rech en el registro de usuario
		BD_genericas.aumentarElValorDeUnCampo("usuarios", edicion.editado_por_id, decision, 1);

		// Amplía la información
		datos = {
			...datos,
			titulo: variables.camposRevisarProd().find((n) => n.nombreDelCampo == campo).titulo,
			evaluado_por_id: userID,
		};
		// Si fue rechazado, agregar campos
		if (!edicAprob) {
			let {motivo_id} = req.query;
			let condicion = motivo_id ? {id: motivo_id} : {info_erronea: true};
			var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", condicion);
			datos = {
				...datos,
				duracion: motivo.duracion,
				motivo_id: motivo.id,
			};
		}
		// Obtiene los valores aprob/rech de edición
		let valoresAprobRech = await procesos.prodEdic_aprobRech(edicAprob, original, edicion, campo);
		datos = {...datos, ...valoresAprobRech};
		// Actualiza la BD de 'edic_aprob' / 'edicion_rech'
		BD_genericas.agregarRegistro(decision, datos);
		// Si corresponde, penaliza al usuario
		if (datos.duracion) procesos.usuario_Penalizar(edicion.editado_por_id, motivo);
		// Fin
		return;
	};

	// Prepara información
	datos = {
		entidad,
		entidad_id: id,
		campo,
		input_por_id: edicion.editado_por_id,
		input_en: edicion.editado_en,
	};
	// Averigua si ya está contabilizado ese feedback
	let yaHecho = await BD_genericas.obtenerPorCampos(decision, datos);
	// Si no lo había, realiza acciones
	if (!yaHecho) justDoIt();
	// Fin
	return;
};
