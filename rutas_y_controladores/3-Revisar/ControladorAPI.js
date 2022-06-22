"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const procesar = require("../../funciones/3-Procesos/4-Revisar");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const path = require("path");

// *********** Controlador ***********
module.exports = {
	// USO COMPARTIDO
	liberarSalir: async (req, res) => {
		let {entidad, id} = req.query;
		// Liberar y salir
		let datos = {captura_activa: 0};
		await BD_genericas.actualizarPorId(entidad, id, datos);
		return res.json();
	},

	// PRODUCTOS
	prodAltas: async (req, res) => {
		// Definir variables
		let {entidad, id: prodID} = req.query;
		let aprobado = req.query.aprob == "true";
		let archivo = aprobado ? "altas_aprob" : "altas_rech";
		let revisor_ID = req.session.usuario.id;
		let ahora = funciones.ahora();
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
			alta_analizada_por_id: revisor_ID,
			alta_analizada_en: ahora,
		};
		// Liberar la captura
		if (!aprobado) datos.captura_activa = 0;
		// Actualizar el status
		await BD_genericas.actualizarPorId(entidad, prodID, datos);
		// Agrega el registro en altas-aprob/rech
		let producto = await BD_genericas.obtenerPorId(entidad, prodID);
		let creador_ID = producto.creado_por_id;
		datos = {
			entidad: entidad,
			entidad_id: prodID,
			input_por_id: creador_ID,
			input_en: producto.creado_en,
			evaluado_por_id: revisor_ID,
			evaluado_en: ahora,
		};
		if (!aprobado) {
			var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", {info_erronea: true});
			datos.motivo_id = motivo.id;
			datos.duracion = motivo.duracion;
		}
		BD_genericas.agregarRegistro(archivo, datos);
		// Asienta la aprob/rech en el registro del usuario
		let campo = aprobado ? "cant_altas_aprob" : "cant_altas_rech";
		BD_genericas.aumentarElValorDeUnCampo("usuarios", creador_ID, campo, 1);
		// Penaliza al usuario si corresponde
		if (datos.duracion) procesar.usuario_Penalizar(creador_ID, motivo, "prod_");
		// Actualizar en RCLVs el campo 'prod_aprob'
		if (
			nuevoStatusID == status.find((n) => n.aprobado).id ||
			nuevoStatusID == status.find((n) => n.inactivo).id
		)
			procesar.RCLV_actualizarProdAprob(producto, status);
		// Fin
		return res.json();
	},
	// Revisar la edición
	prodEdics: async (req, res) => {
		// Variables
		let {entidad, id: prodID, edicion_id: edicID, campo} = req.query;
		let aprobado = req.query.aprob == "true";
		let archivo = aprobado ? "edic_aprob" : "edic_rech";
		let revisor_ID = req.session.usuario.id;
		let ahora = funciones.ahora();
		let datos;
		const status = req.session.status_registro;
		let RCLV_ids = ["personaje_id", "hecho_id", "valor_id"];
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
			"status_registro",
		];
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		let producto = {...prodOriginal};
		// Obtener el registro editado
		includes.splice(-1);
		let prodEditado = await BD_genericas.obtenerPorIdConInclude("prods_edicion", edicID, includes);
		let editor_ID = prodEditado.editado_por_id;
		// Detectar un eventual error
		if (!prodEditado || !prodEditado[campo]) return res.json("false");
		// Particularidades para el campo 'avatar'
		if (campo == "avatar") {
			if (aprobado) {
				// Eliminar el avatar original (si es un archivo)
				let avatar = prodOriginal.avatar;
				if (avatar.slice(0, 4) != "http") {
					let ruta = prodOriginal.status_registro.alta_aprob
						? "/imagenes/3-ProdRevisar/"
						: "/imagenes/2-Productos/";
					funciones.borrarArchivo(ruta, avatar);
				}
				// Mover el nuevo avatar a la carpeta definitiva
				funciones.moverImagenCarpetaDefinitiva(prodEditado.avatar, "3-ProdRevisar", "2-Productos");
			} else {
				// Eliminar el avatar editado
				funciones.borrarArchivo("./public/imagenes/3-ProdRevisar", prodEditado.avatar);
				// Acciones si el status es 'alta-aprobada'
				if (prodOriginal.status_registro.alta_aprob) {
					let avatar = prodOriginal.avatar;
					// Si el avatar original es un url, convertirlo a archivo en la carpeta '3-ProdRevisar'
					if (avatar.slice(0, 4) == "http") {
						// Obtener el nombre
						let nombre = Date.now() + path.extname(prodOriginal.avatar);
						// Obtener la ruta con el nombre
						let rutaYnombre = "./public/imagenes/2-Productos/" + nombre;
						// Convertir el url en un archivo
						await funciones.descargar(prodOriginal.avatar, rutaYnombre);
						// Actualizar el nombre del avatar en la BD
						await BD_genericas.actualizarPorId(entidad, prodID, {avatar: nombre});
					} else if (avatar)
						// Mover el archivo avatar a la carpeta definitiva
						funciones.moverImagenCarpetaDefinitiva(avatar, "3-ProdRevisar", "2-Productos");
				}
			}
		}
		// Si la edición fue aprobada, actualiza el registro de 'original' *******************
		if (aprobado) {
			// El nuevo valor
			datos = {[campo]: prodEditado[campo]};
			// Obtener el Lead Time de Edición
			let leadTime = funciones.obtenerLeadTime(prodEditado.editado_en, ahora);

			// Agregarle datos de la 'edición'
			datos.editado_por_id = prodEditado.editado_por_id;
			datos.editado_en = prodEditado.editado_en;
			datos.edic_analizada_por_id = revisor_ID;
			datos.edic_analizada_en = ahora;
			datos.lead_time_edicion = leadTime;
			// Actualiza el registro en la BD original ***************************************
			await BD_genericas.actualizarPorId(entidad, prodID, datos);
			producto = RCLV_ids.includes(campo)
				? await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [...includes, "status_registro"])
				: {...prodOriginal, ...datos};
			// Actualiza la variable 'prodOriginal'
			// Asienta la aprobación en el registro del usuario
			BD_genericas.aumentarElValorDeUnCampo("usuarios", editor_ID, "cant_edic_aprob", 1);
			// Asienta el rechazo en el registro del usuario
		} else BD_genericas.aumentarElValorDeUnCampo("usuarios", editor_ID, "cant_edic_rech", 1);
		// Actualizar el registro de 'edicion' quitándole el valor al campo
		await BD_genericas.actualizarPorId("prods_edicion", edicID, {[campo]: null});
		// Verificar si no había ya un registro de ese usuario para ese campo en ese producto
		datos = {
			entidad: entidad,
			entidad_id: prodID,
			campo: campo,
			input_por_id: prodEditado.editado_por_id,
		};
		let averiguar = await BD_genericas.obtenerPorCampos(archivo, datos);
		// Si no lo había, agregar un registro en 'edic_aprob' / 'edicion_rech'
		if (!averiguar) {
			// Obtener el título
			let titulo =
				campo == "avatar"
					? "Avatar"
					: variables.camposRevisarProd().find((n) => n.nombreDelCampo == campo).titulo;
			// Completar los datos
			datos = {
				...datos,
				titulo,
				input_en: prodEditado.editado_en,
				evaluado_por_id: revisor_ID,
				evaluado_en: ahora,
			};
			// Si fue rechazado, agregar campos
			if (!aprobado) {
				let {motivo_id} = req.query;
				let condicion = motivo_id ? {id: motivo_id} : {info_erronea: true};
				var motivo = await BD_genericas.obtenerPorCampos("edic_motivos_rech", condicion);
				datos.duracion = motivo.duracion;
				datos.motivo_id = motivo.id;
			}
			// Obtener el valor de edición, cuando es un ID
			let valores = await procesar.prod_EdicValores(aprobado, prodOriginal, prodEditado, campo);
			datos = {...datos, ...valores};
			// Actualizar la BD de 'edic_aprob' / 'edicion_rech'
			BD_genericas.agregarRegistro(archivo, datos);
		}
		// Actualiza la variable de 'edicion' quitándole el valor al campo
		prodEditado[campo] = null;
		// Averiguar si quedan campos por procesar
		// Elimina el registro de edición si ya no tiene más datos
		// Actualiza el status del registro original, si corresponde
		let [quedanCampos, , statusAprobado] = await procesar.prod_QuedanCampos(producto, prodEditado);
		// Penalizar al usuario si corresponde
		if (datos.duracion) procesar.usuario_Penalizar(editor_ID, motivo, "edic_");
		// Si el producto estaba aprobado y se cambió un campo RCLV, actualizar en el RCLV descartado el campo 'prod_aprob'
		if (
			RCLV_ids.includes(campo) &&
			aprobado &&
			prodOriginal.status_registro.aprobado &&
			prodOriginal[campo] != 1
		)
			procesar.RCLV_actualizarProdAprob(prodOriginal, status);
		// Otras particularidades para el campo RCLV
		if (
			// Se cambió el campo RCLV, y el status está aprobado
			(RCLV_ids.includes(campo) && aprobado && statusAprobado) ||
			// El registro no estaba aprobado y ahora sí lo está
			(!prodOriginal.status_registro.aprobado && statusAprobado)
		) {
			// Actualizar en el producto, el campo 'dia_del_ano_id'
			procesar.prod_DiaDelAno(entidad, producto, status);
			// Actualizar en RCLVs el campo 'prod_aprob'
			procesar.RCLV_actualizarProdAprob(producto, status);
		}
		// Fin
		return res.json([quedanCampos, statusAprobado]);
	},

	// RCLV
	// Aprobar el alta
	RCLV_Altas: async (req, res) => {
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
		let prod_aprob = await procesar.RCLV_averiguarSiTieneProdAprob(
			{...RCLV_original, status_registro_id: aprobado_id},
			status
		);
		// Preparar lead_time_creacion
		let alta_analizada_en = funciones.ahora();
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
		// Si 'datos.dia_del_ano_id' tiene un valor, actualizar el dato en 'productos'
		let RCLV = {...RCLV_original, dia_del_ano_id: datos.dia_del_ano_id};
		procesar.prods_DiaDelAno(RCLV, status);
		// Actualizar la info de aprobados/rechazados
		procesar.RCLV_BD_AprobRech(datos.entidad, RCLV_original, includes, req.session.usuario.id);

		// Fin
		return res.json("Resultado exitoso");
	},

	// Links
	linkEdic: async (req, res) => {
		// Variables
		let api = req.query;
		let campo = api.campo;
		let userID = req.session.usuario.id;
		let camposVacios = {};
		variables.camposRevisarLinks().forEach((campo) => {
			camposVacios[campo.nombreDelCampo] = null;
		});
		let aprobado = api.aprobado == "SI";
		let decision = aprobado ? "edic_aprob" : "edic_rech";
		let datos;
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
		datos = {
			entidad: "links",
			entidad_id: link_id,
			campo: campo,
			titulo: campo,
			valor_aceptado: edicion[campo],
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
		BD_genericas.agregarRegistro(decision, datos);
		// Purgar las ediciones
		let link = await BD_genericas.obtenerPorIdConInclude("links", link_id, ["ediciones"]);
		link.ediciones.forEach(async (edicion) => {
			// Se eliminan los campos sin contenido
			edicion = funciones.quitarLosCamposSinContenido(edicion);
			// Se eliminan los campos que no se comparan
			let edicID = edicion.id;
			edicion = funciones.quitarLosCamposQueNoSeComparan(edicion, "Links");
			// Se eliminan los campos con el mismo valor que el original
			if (aprobado) edicion = funciones.quitarLasCoincidenciasConOriginal(link, edicion);
			// Se eliminan los registros editados que quedan vacíos
			let quedanCampos = await funciones.eliminarEdicionSiEstaVacio("links_edicion", edicID, edicion);
			// Si quedan campos, actualiza la edición
			if (quedanCampos)
				await BD_genericas.actualizarPorId("links_edicion", edicID, {
					...camposVacios,
					...edicion,
				});
		});
		// Actualizaciones en el USUARIO
		BD_genericas.aumentarElValorDeUnCampo("usuarios", sugerido_por_id, decision, 1);
		if (datos.duracion) procesar.usuario_Penalizar(sugerido_por_id, motivo, "edic_");
		// Actualizar si el producto tiene links gratuitos
		if (campo == "gratuito") funciones.actualizarProdConLinkGratuito(api.prodEntidad, api.prodID);
		// Se recarga la vista
		return res.json({mensaje: "Campo eliminado de la edición", reload: true});
	},

	cambiarA_aprobado: async (req, res) => {},

	cambiarA_inactivo: async (req, res) => {},

	eliminar: async (req, res) => {
		// Definir las variables
		let {prodEntidad, prodID, url} = req.query;
		let respuesta = {};
		let link;
		// Averiguar si no existe el 'url'
		if (!url) respuesta = {mensaje: "Falta el 'url' del link", reload: true};
		else {
			// Obtener el link
			link = await BD_genericas.obtenerPorCamposConInclude("links", {url: url}, [
				"status_registro",
				"ediciones",
			]);
			// El link no existe en la BD
			if (!link) respuesta = {mensaje: "El link no existe en la base de datos", reload: true};
			// El link existe y no tiene status 'inactivo'
			else if (!link.status_registro.inactivo)
				respuesta = {mensaje: "En este status no se puede eliminar", reload: true};
			else {
				// El link está en status 'inactivo" --> se elimina definitivamente
				// Eliminar las ediciones que tenga
				if (link.ediciones)
					link.ediciones.forEach(async (edicion) => {
						await BD_genericas.eliminarPorId("links_edicion", edicion.id);
					});
				// Eliminar el link
				await BD_genericas.eliminarPorId("links", link.id);
				// Actualizar si el producto tiene links gratuitos
				funciones.actualizarProdConLinkGratuito(prodEntidad, prodID);
				// Preparar la respuesta
				respuesta = {mensaje: "El link fue eliminado con éxito", ocultar: true};
			}
			return res.json(respuesta);
		}
	},
};
