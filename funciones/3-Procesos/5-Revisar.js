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
	fichaDelUsuario: async function (userID, ahora) {
		// Obtener los datos del usuario
		let includes = "rol_iglesia";
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// Variables
		let anos = 1000 * 60 * 60 * 24 * 365;
		// Edad
		if (usuario.fecha_nacimiento) {
			var edad = parseInt((ahora - new Date(usuario.fecha_nacimiento).getTime()) / anos) + " años";
		}
		// Antigüedad
		let antiguedad =
			(parseInt(((ahora - new Date(usuario.creado_en).getTime()) / anos) * 10) / 10)
				.toFixed(1)
				.replace(".", ",") + " años";
		// Datos a enviar
		let enviar = {};
		enviar.apodo = ["Apodo", usuario.apodo];
		if (usuario.rol_iglesia) enviar.rolIglesia = ["Vocación", usuario.rol_iglesia.nombre];
		if (usuario.fecha_nacimiento) enviar.edad = ["Edad", edad];
		enviar.antiguedad = ["Tiempo en ELC", antiguedad];
		// Fin
		return enviar;
	},
	calidadAltas: async function (userID) {
		// Obtener los datos del usuario
		let includes = ["status_registro", "peliculas", "colecciones"];
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// 1. Obtener los status
		let altaAprobId = await BD_genericas.obtenerPorCampos("status_registro", {alta_aprob: 1}).then(
			(n) => n.id
		);
		let aprobadoId = await BD_genericas.obtenerPorCampos("status_registro", {aprobado: 1}).then(
			(n) => n.id
		);
		let editadoId = await BD_genericas.obtenerPorCampos("status_registro", {editado: 1}).then(
			(n) => n.id
		);
		let inactivadoId = await BD_genericas.obtenerPorCampos("status_registro", {inactivado: 1}).then(
			(n) => n.id
		);
		// 2. Contar los casos aprobados
		let cantAprob = usuario.peliculas.length
			? usuario.peliculas.filter(
					(n) =>
						n.status_registro_id == altaAprobId ||
						n.status_registro_id == aprobadoId ||
						n.status_registro_id == editadoId
			  ).length
			: 0;
		cantAprob += usuario.colecciones.length
			? usuario.colecciones.filter(
					(n) =>
						n.status_registro_id == altaAprobId ||
						n.status_registro_id == aprobadoId ||
						n.status_registro_id == editadoId
			  ).length
			: 0;
		// 3. Contar los casos rechazados
		let cantRech = usuario.peliculas.length
			? usuario.peliculas.filter((n) => n.status_registro_id == inactivadoId).length
			: 0;
		cantRech += usuario.colecciones.length
			? usuario.colecciones.filter((n) => n.status_registro_id == inactivadoId).length
			: 0;
		// 4. Precisión de altas
		let cantAltas = cantAprob + cantRech;
		let calidadInputs = cantAltas ? parseInt((cantAprob / cantAltas) * 100) + "%" : "-";
		let diasPenalizacion = await BD_genericas.sumarValores("altas_rech", {id: userID}, "duracion");
		// Datos a enviar
		let enviar = {
			calidadAltas: ["Calidad Altas", calidadInputs],
			cantAltas: ["Cant. Alta Productos", cantAltas],
			diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	calidadEdic: async function (userID) {
		// Obtener la cantidad de aprobaciones y de rechazos
		let cantAprob = await BD_genericas.contarCasos("edic_aprob", {input_por_id: userID});
		let rechazados = await BD_genericas.obtenerTodosPorCampos("edic_rech", {input_por_id: userID});
		let cantRech = rechazados.length ? rechazados.length : 0;
		// Obtener la calidad de las ediciones
		let cantEdics = cantAprob + cantRech;
		let calidadInputs = cantEdics ? parseInt((cantAprob / cantEdics) * 100) + "%" : "-";
		// Obtener la cantidad de penalizaciones con días
		let cantPenalizConDias = rechazados.length ? rechazados.filter((n) => n.duracion).length : "-";
		// Obtener la cantidad de días penalizados
		let diasPenalizacion = rechazados.length ? rechazados.reduce((suma, n) => suma + n.duracion, 0) : "-";
		// Datos a enviar
		let enviar = {
			calidadEdiciones: ["Calidad Edición", calidadInputs],
			cantEdiciones: ["Cant. Campos Proces.", cantEdics],
			cantPenalizConDias: ["Cant. Penaliz. c/Días", cantPenalizConDias],
			diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
}