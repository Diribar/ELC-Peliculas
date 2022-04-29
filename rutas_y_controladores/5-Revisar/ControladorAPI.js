"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const variables = require("../../funciones/4-Compartidas/Variables");
const funciones = require("../../funciones/4-Compartidas/Funciones");
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

	// PRODUCTOS - 
	// Revisar el alta - Aprobar
	aprobarAlta: async (req, res) => {
		let {entidad, id} = req.query;
		// Averiguar el id del status
		let statusAltaAprob = await BD_genericas.obtenerPorCampos("status_registro", {alta_aprob: true}).then(
			(n) => n.id
		);
		// Cambiar el status, dejar la marca del usuario y fecha en que esto se realizó
		let datos = {
			status_registro_id: statusAltaAprob,
			alta_analizada_por_id: req.session.usuario.id,
			alta_analizada_en: funciones.ahora(),
		};
		await BD_genericas.actualizarPorId(entidad, id, datos);
		// Fin
		return res.json();
	},
	// Revisar el alta - Rechazar
	rechazarAlta: async (req, res) => {
		// Obtener las variables
		let {entidad, id, motivo_id} = req.query;
		let datos;
		// Detectar un eventual error
		if (!motivo_id) return res.json();
		// Averiguar el id del status
		let statusInactivar = await BD_genericas.obtenerPorCampos("status_registro", {inactivar: true}).then(
			(n) => n.id
		);
		// Cambiar el status en el original, dejar la marca del usuario y fecha en que esto se realizó
		datos = {
			status_registro_id: statusInactivar,
			alta_analizada_por_id: req.session.usuario.id,
			alta_analizada_en: funciones.ahora(),
			captura_activa: 0,
		};
		BD_genericas.actualizarPorId(entidad, id, datos);
		// Agregar el registro de borrados
		let producto = await BD_genericas.obtenerPorId(entidad, id);
		datos = {
			entidad: entidad,
			entidad_id: id,
			motivo_id: motivo_id,
			duracion: 0, // porque todavía lo tiene que analizar un segundo revisor
			input_por_id: producto.creado_por_id,
			input_en: producto.creado_en,
			evaluado_por_id: datos.alta_analizada_por_id,
			evaluado_en: datos.alta_analizada_en,
			status_registro_id: datos.status_registro_id,
		};
		BD_genericas.agregarRegistro("altas_rech", datos);
		return res.json();
	},
	// Revisar la edición
	aprobRechCampo: async (req, res) => {
		// Variables
		let {entidad, id: prodID, edicion_id: edicID, campo} = req.query;
		let aprobado = req.query.aprob == "true";
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		let prodEditado = await BD_genericas.obtenerPorId("prods_edicion", edicID);
		let userID = req.session.usuario.id;
		let datos;
		let ahora = funciones.ahora();
		// Obtener el motivo si es un rechazo
		if (!aprobado) var {motivo_id} = req.query;
		// Detectar un eventual error
		if (!prodEditado || !prodEditado[campo] || (!aprobado && !motivo_id)) return res.json("false");
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
		// Si la edición fue aprobada, actualiza el registro de 'original'
		if (aprobado) {
			// El nuevo valor
			datos = {[campo]: prodEditado[campo]};
			// Si el producto está en status 'aprobado', agregarle los datos de la 'edición'
			if (!prodOriginal.status_registro.aprobado)
				datos = {
					...datos,
					// Los datos de la edición (fecha, usuario)
					editado_por_id: prodEditado.editado_por_id,
					editado_en: prodEditado.editado_en,
					// Los datos de la revisión (fecha, usuario)
					edic_analizada_por_id: userID,
					edic_analizada_en: ahora,
				};
			// Actualiza el registro en la BD
			await BD_genericas.actualizarPorId(entidad, prodID, datos);
			// Actualiza la variable 'prodOriginal'
			prodOriginal = {...prodOriginal, ...datos};
		}
		// Actualizar el registro de 'edicion' quitándole el valor al campo
		await BD_genericas.actualizarPorId("prods_edicion", edicID, {[campo]: null});
		// Verificar si no había ya un registro de ese usuario para ese campo en ese producto
		datos = {
			entidad: entidad,
			entidad_id: prodID,
			campo: campo,
			input_por_id: prodEditado.editado_por_id,
		};
		let averiguar = await BD_genericas.obtenerPorCampos("edic_aprob", datos);
		// Si no lo había, agregar un registro en 'edic_aprob' / 'edicion_rech'
		if (!averiguar) {
			let titulo =
				campo == "avatar"
					? "Avatar"
					: variables.camposRevisarEdic().find((n) => n.nombreDelCampo == campo).titulo;
			datos = {
				...datos,
				titulo,
				valor: prodEditado[campo],
				input_en: prodEditado.editado_en,
				evaluado_por_id: userID,
				evaluado_en: ahora,
			};
			if (aprobado) BD_genericas.agregarRegistro("edic_aprob", datos);
			else {
				let duracion = await BD_genericas.obtenerPorId("edic_rech_motivos", motivo_id).then(
					(n) => n.duracion
				);
				datos = {...datos, duracion, motivo_id};
				BD_genericas.agregarRegistro("edic_rech", datos);
			}
		}
		// Actualiza la variable de 'edicion' quitándole el valor al campo
		prodEditado[campo] = null;
		// Averiguar si quedan campos por procesar
		// La consulta también tiene otros efectos:
		// 1. Elimina el registro de edición si ya no tiene más datos
		// 2. Actualiza el status del registro original, si corresponde
		let [quedanCampos, , statusAprobado] = await BD_especificas.quedanCampos(prodOriginal, prodEditado);
		// Fin
		return res.json([quedanCampos, statusAprobado]);
	},

	// RCLV
	// Aprobar el alta
	aprobarAltaRCLV: async (req, res) => {
		console.log(req.query);
	}
};
