"use strict";
// Definir variables
const BD_especificas = require("../2-BD/Especificas");
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("./Compartidas");
const variables = require("./Variables");

module.exports = {
	// Producto
	statusResumido: (status_registro, capturado_en, captura_activa) => {
		// Variables
		let nombres = ["Pend. Aprobac.", "En Revisión", "Aprobado", "Inactivado"];
		let haceUnaHora = funciones.nuevoHorario(-1);
		// Obtener el ID del 'status resumido'
		let id =
			captura_activa && capturado_en > haceUnaHora
				? 2
				: status_registro.gr_pend_aprob
				? 1
				: status_registro.aprobado
				? 3
				: 4;
		return {id, nombre: nombres[id - 1]};
	},
	obtenerVersionesDelProducto: async (entidad, prodID, userID) => {
		// Definir los campos include
		let includes = [
			"idioma_original",
			"en_castellano",
			"en_color",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
			// A partir de acá, van los campos exclusivos de 'Original'
			"creado_por",
			"status_registro",
		];
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener el producto ORIGINAL
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		// Obtener el producto EDITADO
		let prodEditado = "";
		let producto_id = funciones.obtenerEntidad_id(entidad);
		if (prodOriginal) {
			// Quitarle los campos 'null'
			prodOriginal = funciones.quitarLosCamposSinContenido(prodOriginal);
			// Obtener los datos EDITADOS del producto
			if (entidad == "capitulos") includes.pop();
			prodEditado = await BD_genericas.obtenerPorCamposConInclude(
				"prods_edicion",
				{[producto_id]: prodID, editado_por_id: userID},
				includes.slice(0, -2)
			);
			if (prodEditado) {
				// Quitarle los campos 'null'
				prodEditado = funciones.quitarLosCamposSinContenido(prodEditado);
			}
		}
		return [prodOriginal, prodEditado];
	},

	// RCLV
	guardar_o_actualizar_Edicion: async (prodEntidad, prodID, userID, datos) => {
		let entidad_id = funciones.obtenerEntidad_id(prodEntidad);
		// Averiguar si ya exista la edición
		let edicID = await BD_especificas.obtenerELC_id("prods_edicion", {
			[entidad_id]: prodID,
			editado_por_id: userID,
		});
		// Acciones en función de si existe o no
		edicID
			? await BD_genericas.actualizarPorId("prods_edicion", edicID, datos)
			: await BD_genericas.agregarRegistro("prods_edicion", {[entidad_id]: prodID, ...datos});
	},

	// Links - Controlador Vista
	obtenerLinksActualizados: async (entidad, prodID, userID) => {
		// Obtiene para el usuario los links 'personalizados', es decir el original editado por él
		// Definir valores necesarios
		let producto_id = funciones.obtenerEntidad_id(entidad);
		let includes = ["tipo", "prov", "status_registro", "ediciones", "motivo"];
		// Obtener los linksOriginales
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[producto_id]: prodID},
			includes
		);
		// Ordenar por ID
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// Combinarlos con la edición, si existe
		links.forEach((link, i) => {
			if (link.ediciones.length) {
				let edicion = link.ediciones.find((n) => n.editado_por_id == userID);
				if (edicion) {
					if (edicion.calidad) links[i].calidad = edicion.calidad;
					if (edicion.tipo_id) links[i].tipo_id = edicion.tipo_id;
					if (edicion.completo !== null) links[i].completo = edicion.completo;
					if (edicion.parte) links[i].parte = edicion.parte;
					if (edicion.gratuito!== null) links[i].gratuito = edicion.gratuito;
				}
			}
		});
		// Fin
		return links;
	},
	actualizarProdConLinkGratuito: async (entidad, prodID) => {
		// Variables
		let datos = {};
		// Obtener el producto con include a links
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
			"links_gratuitos_cargados",
			"links_gratuitos_en_la_web",
			"links",
			"status_registro",
		]);
		// Obtener los links gratuitos de películas del producto
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[funciones.obtenerEntidad_id(entidad)]: prodID},
			["status_registro", "tipo"]
		)
			.then((n) => (n.length ? n.filter((n) => n.gratuito) : ""))
			.then((n) => (n.length ? n.filter((n) => n.tipo.pelicula) : ""));
		// Obtener los links 'Aprobados' y 'TalVez'
		let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : [];
		let linksTalVez = links.length ? links.filter((n) => n.status_registro.gr_pend_aprob) : [];
		if (linksActivos.length || linksTalVez.length) {
			// Obtener los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
			let no = si_no_parcial.find((n) => n.no).id;
			// Acciones para LINKS GRATUITOS EN LA WEB
			datos.links_gratuitos_en_la_web_id = linksActivos.length
				? si
				: producto.links_gratuitos_en_la_web_id != no
				? talVez
				: no;
			// Acciones para LINKS GRATUITOS CARGADOS
			datos.links_gratuitos_cargados_id = linksActivos.length ? si : linksTalVez.length ? talVez : no;
			// Actualizar la BD
			BD_genericas.actualizarPorId(entidad, prodID, datos);
		}
		return;
	},

	// Las 3 familias de entidades
	inactivar: async (entidad, entidad_id, userID, motivo_id) => {
		// Obtener el status_id de 'inactivar'
		let inactivarID = await BD_genericas.obtenerPorCampos("status_registro", {inactivar: true}).then(
			(n) => n.id
		);
		// Preparar los datos
		let datos = {
			sugerido_por_id: userID,
			sugerido_en: funciones.ahora(),
			motivo_id,
			status_registro_id: inactivarID,
		};
		// Actualiza el registro 'original' en la BD
		await BD_genericas.actualizarPorId(entidad, entidad_id, datos);
	},
};

// Funciones
