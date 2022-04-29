"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("../3-Procesos/Compartidas");
const validar = require("../4-Validaciones/RUD");
const procesarRUD = require("./3-RUD");

module.exports = {
	quedanCampos: async function (prodOriginal, prodEditado) {
		// Variables
		let edicion = {...prodEditado};
		let noSeComparan;
		let entidad = funciones.obtenerEntidad(prodEditado);
		let statusAprobado = false;
		// Pulir la información a tener en cuenta
		edicion = procesarRUD.quitarLosCamposSinContenido(edicion);
		[edicion, noSeComparan] = procesarRUD.quitarLosCamposQueNoSeComparan(edicion);
		edicion = funciones.quitarLasCoincidenciasConOriginal(prodOriginal, edicion);
		// Averiguar si queda algún campo
		let quedanCampos = !!Object.keys(edicion).length;
		// Si no quedan, eliminar el registro
		if (!quedanCampos) {
			// Eliminar el registro de la edición
			await BD_genericas.eliminarRegistro("prods_edicion", prodEditado.id);
			// Averiguar si el original no tiene errores
			let errores = await validar.edicion(null, {...prodOriginal, entidad});
			// Si se cumple lo siguiente, cambiarle el status a 'aprobado'
			// 1. Que no tenga errores
			// 2. Que el status del original sea 'alta_aprob'
			if (!errores.hay && prodOriginal.status_registro.alta_aprob) {
				statusAprobado = true;
				// Obtener el 'id' del status 'aprobado'
				let aprobado_id = await this.obtenerELC_id("status_registro", {aprobado: 1});
				// Averiguar el Lead Time de creación en horas
				let ahora = funciones.ahora();
				let leadTime = funciones.obtenerHoras(prodOriginal.creado_en, ahora);
				// Cambiarle el status al producto y liberarlo
				let datos = {
					alta_terminada_en: ahora,
					lead_time_creacion: leadTime,
					status_registro_id: aprobado_id,
				};
				await BD_genericas.actualizarPorId(entidad, prodOriginal.id, {...datos, captura_activa: 0});
				// Si es una colección, cambiarle el status también a los capítulos
				if (entidad == "colecciones") {
					// Generar el objeto para filtrar
					let objeto = {coleccion_id: prodOriginal.id};
					// Actualizar el status de los capitulos
					BD_genericas.actualizarPorCampos("capitulos", objeto, datos);
				}
			}
		} else edicion = {...noSeComparan, ...edicion};
		// Fin
		return [quedanCampos, edicion, statusAprobado];
	},
	tituloCanonizacion: (datos) => {
		let tituloCanoniz = "";
		if (datos.entidad == "RCLV_personajes") {
			tituloCanoniz = datos.proceso_canonizacion.nombre;
			if (
				datos.proceso_canonizacion.nombre == "Santo" &&
				!datos.nombre.startsWith("Domingo") &&
				!datos.nombre.startsWith("Tomás") &&
				!datos.nombre.startsWith("Tomé") &&
				!datos.nombre.startsWith("Toribio")
			)
				tituloCanoniz = "San";
		}
		return tituloCanoniz;
	},
}