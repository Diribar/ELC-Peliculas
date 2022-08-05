"use strict";
// Definir variables
const BD_especificas = require("../2-BD/Especificas");
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("./Compartidas");
const variables = require("./Variables");

module.exports = {
	// Producto
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
		// Variables
		let producto_id = funciones.obtenerEntidad_id(entidad);
		let includes = ["tipo", "prov", "status_registro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisarLinks().map((n) => n.nombreDelCampo);
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
				if (edicion)
					for (let campo in edicion)
						if (edicion[campo] !== null && camposARevisar.includes(campo))
							links[i][campo] = edicion[campo];
			}
		});
		// Fin
		return links;
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

	// RCLV y Links
	crear_original: async (entidad, datos, userID) => {
		datos.creado_por_id = userID;
		let id = await BD_genericas.agregarRegistro(entidad, datos).then((n) => n.id);
		if (entidad == "links") funciones.actualizarProdConLinkGratuito(datos.prodEntidad, datos.prodID);
		return id;
	},
	actualizar_original: async (entidad, id, datos) => {
		await BD_genericas.actualizarPorId(entidad, id, datos);
		if (entidad == "links") funciones.actualizarProdConLinkGratuito(datos.prodEntidad, datos.prodID);
		return "Registro original actualizado";
	},
	guardar_edicion: async (entidad, entidad_edicion, original, edicion, userID) => {
		// Depurar para dejar solamente las novedades de la edición
		edicion = funciones.quitarLasCoincidenciasConOriginal(original, edicion);
		// Obtener el campo 'entidad_id'
		let entidad_id = funciones.obtenerEntidad_id(entidad);
		// Si existe una edición de ese original y de ese usuario --> eliminarlo
		let objeto = {[entidad_id]: original.id, editado_por_id: userID};
		let registroEdic = await BD_genericas.obtenerPorCampos(entidad_edicion, objeto);
		if (registroEdic) await BD_genericas.eliminarPorId(entidad_edicion, registroEdic.id);
		// Averiguar si hay algún campo con novedad
		if (!Object.keys(edicion).length) return "Edición sin novedades respecto al original";
		// Completar la información
		edicion = {
			...edicion,
			[entidad_id]: original.id,
			editado_por_id: userID,
		};
		// Agregar la nueva edición
		await BD_genericas.agregarRegistro(entidad_edicion, edicion);
		// Fin
		return "Edición guardada";
	},
};

// Funciones
