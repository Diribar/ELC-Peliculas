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
		let includes = ["link_tipo", "link_prov", "status_registro", "link_ediciones"];
		// Obtener los linksOriginales
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links_originales",
			{[producto_id]: prodID},
			includes
		);
		// Combinarlos con la edición, si existe
		links.forEach((link, i) => {
			if (link.link_ediciones.length) {
				let edicion = link.link_ediciones.find((n) => n.editado_por_id == userID);
				if (edicion) {
					if (edicion.calidad) links[i].calidad = edicion.calidad;
					if (edicion.link_tipo_id) links[i].link_tipo_id = edicion.link_tipo_id;
					if (edicion.completo) links[i].completo = edicion.completo;
					if (edicion.parte) links[i].parte = edicion.parte;
					if (edicion.gratuito) links[i].gratuito = edicion.gratuito;
				}
			}
			links[i] = funciones.quitarLosCamposSinContenido(links[i]);
		});
		// Fin
		return links;
	},
	altaDeLink: async (req, datos) => {
		if (!datos.parte) datos.parte = "-";
		// Generar información para el nuevo registro
		let userID = req.session.usuario.id;
		let producto_id = funciones.obtenerEntidad_id(datos.prodEntidad);
		datos = {
			...datos,
			[producto_id]: datos.prodID,
			creado_por_id: userID,
		};
		// Agregar el 'link' a la BD
		await BD_genericas.agregarRegistro("links_originales", datos);
		// Eliminar req.session.edicion
		delete req.session.links;
		// Adecuar el producto respecto al link
		productoConLinksWeb(datos.prodEntidad, datos.prodID);
	},
	guardarEdicionDeLink: async (userID, datos) => {
		// Adecuar la información del formulario
		if (!datos.parte) datos.parte = "-";
		// Averiguar si el link está en 'creado' y por este usuario
		let linkOriginal = await BD_genericas.obtenerPorIdConInclude(
			"links_originales",
			datos.id,
			"status_registro"
		);

		// Si el linkOriginal está en status 'creado' y fue creado por el usuario => la edición reemplaza el original
		if (linkOriginal.status_registro.creado && linkOriginal.creado_por_id == userID) {
			// 1. Actualizar el link Original
			linkOriginal = {...linkOriginal, ...datos};
			// 2. Actualizarlo en la BD
			await BD_genericas.actualizarPorId("links_originales", datos.id, linkOriginal);
		} else {
			// Si el linkOriginal no está en status 'creado' o no fue creado por el usuario => la edición se guarda como edición
			// 1. Obtener el link 'Edición'
			let linkEdicion = await BD_genericas.obtenerPorCampos("links_edicion", {
				link_id: link_id,
				editado_por_id: userID,
			});
			linkEdicion = funciones.quitarLosCamposSinContenido(linkEdicion);
			// 2. Actualizarlo
			linkEdicion = {...linkEdicion, ...datos};
			// 3. Quitar los coincidencias con el original
			let linkEdicion_id = linkEdicion.id;
			if (linkEdicion_id) delete linkEdicion.id;
			linkEdicion = funciones.quitarLasCoincidenciasConOriginal(linkOriginal, linkEdicion);
			// 4. Actualización de la tabla
			// 4.1. Si el linkEdicion existía => se lo actualiza
			if (linkEdicion_id)
				await BD_genericas.actualizarPorId("links_edicion", linkEdicion_id, linkEdicion);
			else {
				// 4.2. De lo contrario, se lo agrega
				// 4.2.1. Completa la información
				let producto_id = funciones.obtenerEntidad_id(linkOriginal);
				linkEdicion = {
					...linkEdicion,
					link_id: linkOriginal.id,
					[producto_id]: linkOriginal[producto_id],
					editado_por_id: userID,
				};
				// 4.2.2. Agrega el registro a la tabla de 'Edición'
				await BD_genericas.agregarRegistro("links_edicion", linkEdicion);
			}
		}
	},
	despejarLinkConNovedad: (datos) => {
		// Averigua si se trata de la fila de 'altas', de lo contrario será una edición
		datos.alta = datos.numeroFila == datos.calidad.length - 1;
		// Borrar datos innecesarios
		if (datos.alta) delete datos.id;
		delete datos.motivo_id;
		// Obtener los datos, de la fila que necesitamos
		for (let campo in datos)
			if (typeof datos[campo] == "object") datos[campo] = datos[campo][datos.numeroFila];
		// Quitar campos innecesarios
		datos = funciones.quitarLosCamposSinContenido(datos);
		// Fin
		return datos;
	},

	// Las 3 familias de entidades
	inactivar: async (entidad, entidad_id, userID, motivo_id) => {
		// Obtener el status_id de 'inactivar'
		let inactivarID = await BD_genericas.obtenerPorCampos("status_registro", {inactivar: true}).then(
			(n) => n.id
		);
		// Preparar los datos
		let datos = {
			cambio_status_propuesto_por_id: userID,
			cambio_status_propuesto_en: new Date(),
			motivo_id,
			status_registro_id: inactivarID,
		};
		// Actualiza el registro 'original' en la BD
		BD_genericas.actualizarPorId(entidad, entidad_id, datos);
	},
};

// Funciones
let productoConLinksWeb = async (entidad, prodID) => {
	// Obtener el producto con include a links
	let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, [
		"links_gratuitos_cargados",
		"links_gratuitos_en_la_web",
		"links",
		"status_registro",
	]);
	// Obtener los links gratuitos de películas del producto
	let links = await BD_genericas.obtenerTodosPorCamposConInclude(
		"links_originales",
		{[funciones.obtenerEntidad_id(entidad)]: prodID},
		["status_registro", "link_tipo"]
	)
		.then((n) => n.filter((n) => n.gratuito))
		.then((n) => n.filter((n) => n.link_tipo.pelicula));

	// Obtener los links 'Aprobados' y 'TalVez'
	let linksTalVez = links.length ? links.filter((n) => n.status_registro.gr_pend_aprob) : [];
	let linksActivos = links.length ? links.filter((n) => n.status_registro.aprobado) : [];
	if (!linksActivos.length && !linksTalVez.length) return;

	// Obtener los ID de si, no y TalVez
	let si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
	let si = si_no_parcial.find((n) => n.si).id;
	let talVez = si_no_parcial.find((n) => !n.si && !n.no).id;
	let no = si_no_parcial.find((n) => n.no).id;

	// Acciones si existen 'linksActivos'
	if (linksActivos.length) {
		let datos = {links_gratuitos_cargados_id: si, links_gratuitos_en_la_web_id: si};
		BD_genericas.actualizarPorId(entidad, prodID, datos);
		return;
	} else if (producto.links_gratuitos_en_la_web_id == si) {
		let datos = {links_gratuitos_en_la_web_id: talVez};
		BD_genericas.actualizarPorId(entidad, prodID, datos);
	}

	// Acciones si existen 'linksTalVez'
	if (linksTalVez.length) {
		let datos = {links_gratuitos_cargados_id: talVez};
		BD_genericas.actualizarPorId(entidad, prodID, datos);
		return;
	}

	// Acciones si no se cumplen los anteriores
	let datos = {links_gratuitos_cargados_id: no};
	BD_genericas.actualizarPorId(entidad, prodID, datos);
	return;
};
