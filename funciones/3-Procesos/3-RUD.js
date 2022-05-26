"use strict";
// Definir variables
const BD_especificas = require("../2-BD/Especificas");
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("./Compartidas");
const variables = require("./Variables");

module.exports = {
	// Compartidos
	quitarLosCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
	},
	// Sin compartir
	guardar_o_actualizar_Edicion: async (prodEntidad, prodID, userID, datos) => {
		let entidad_id = funciones.entidad_id(prodEntidad);
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
	statusResumido: (status, capturado_en, captura_activa) => {
		let id =
			captura_activa && capturado_en > funciones.haceUnaHora()
				? 2
				: status.gr_pend_aprob
				? 1
				: status.aprobado
				? 3
				: 4;
		let nombres = ["Pend. Aprobac.", "En Revisión", "Aprobado", "Inactivado"];
		return {id, nombre: nombres[id - 1]};
	},
	quitarLosCamposQueNoSeComparan: (edicion) => {
		let noSeComparan = {};
		// Obtener los campos a comparar
		let camposAComparar = variables.camposRevisarEdic().map((n) => n.nombreDelCampo);
		// Quitar de edicion los campos que no se comparan
		for (let campo in edicion)
			if (!camposAComparar.includes(campo)) {
				noSeComparan[campo] = edicion[campo];
				delete edicion[campo];
			}
		return [edicion, noSeComparan];
	},
	obtenerVersionesDeProducto: async function (entidad, prodID, userID) {
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
		let producto_id = funciones.entidad_id(entidad);
		if (prodOriginal) {
			// Quitarle los campos 'null'
			prodOriginal = this.quitarLosCamposSinContenido(prodOriginal);
			// Obtener los datos EDITADOS del producto
			if (entidad == "capitulos") includes.pop();
			prodEditado = await BD_genericas.obtenerPorCamposConInclude(
				"prods_edicion",
				{[producto_id]: prodID, editado_por_id: userID},
				includes.slice(0, -2)
			);
			if (prodEditado) {
				// Quitarle los campos 'null'
				prodEditado = this.quitarLosCamposSinContenido(prodEditado);
			}
		}
		return [prodOriginal, prodEditado];
	},
	inactivar: async (motivo_id, usuario, link) => {
		// Obtener la duración
		let duracion = await BD_genericas.obtenerPorId("altas_motivos_rech", motivo_id).then(
			(n) => n.duracion
		);
		// Obtener el status_id de 'inactivar'
		let statusInactivar_id = await BD_genericas.obtenerPorCampos("status_registro", {inactivar: 1}).then(
			(n) => n.id
		);
		// Preparar los datos
		let datosParaLink = {
			editado_por_id: usuario.id,
			editado_en: new Date(),
			status_registro_id: statusInactivar_id,
		};
		// Actualiza el registro 'original' en la BD
		BD_genericas.actualizarPorId("links_originales", link.id, datosParaLink);
		// 3. Crea un registro en la BD de 'altas_registros_rech'
		let datosParaBorrados = {
			entidad: "links_originales",
			entidad_id: link.id,
			motivo_id: motivo_id,
			duracion: 0, // porque todavía lo tiene que evaluar un revisor

			input_por_id: link.creado_por_id,
			input_en: link.creado_en,
			evaluado_por_id: datosParaLink.editado_por_id,
			evaluado_en: datosParaLink.editado_en,
			status_registro_id: datosParaLink.status_registro_id,
		};
		BD_genericas.agregarRegistro("altas_registros_rech", datosParaBorrados);
	},
	// FUNCIONES --------------------------------------------------
	obtenerLinksActualizados: async function (entidad, prodID, userID) {
		// Obtiene los links fusionados entre el original y el editado por el usuario
		// Definir valores necesarios
		let producto_id = funciones.entidad_id(entidad);
		let includes = ["link_tipo", "link_prov", "status_registro", "motivo", "link_ediciones"];
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
				console.log(edicion);
				if (edicion) {
					if (edicion.calidad) links[i].calidad = edicion.calidad;
					if (edicion.link_tipo_id) links[i].link_tipo_id = edicion.link_tipo_id;
					if (edicion.completo) links[i].completo = edicion.completo;
					if (edicion.parte) links[i].parte = edicion.parte;
					if (edicion.gratuito) links[i].gratuito = edicion.gratuito;
				}
			}
			links[i] = this.quitarLosCamposSinContenido(linksCombinados[i]);
		});
		// Fin
		return links;
	},
	altaDeLink: async function (req, datos) {
		if (!datos.parte) datos.parte = "-";
		// Generar información para el nuevo registro
		let userID = req.session.usuario.id;
		let producto_id = funciones.entidad_id(datos.prodEntidad);
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
		this.productoConLinksWeb(datos.prodEntidad, datos.prodID);
	},
	productoConLinksWeb: async (entidad, prodID) => {
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
			{[funciones.entidad_id(entidad)]: prodID},
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
	},
	edicionDeLink: async function (req, datos) {
		// Adecuar la información del formulario
		if (!datos.parte) datos.parte = "-";
		// Averiguar si el link está en 'creado' y por este usuario
		let linkOriginal = await BD_genericas.obtenerPorIdConInclude(
			"links_originales",
			datos.id,
			"status_registro"
		);
		let userID = req.session.usuario.id;
		if (linkOriginal.status_registro.creado && linkOriginal.creado_por_id == userID) {
			// Editados reemplaza el original
			// 1. Obtener el link 'Original Nuevo'
			linkOriginalNuevo = {...linkOriginal, ...datos};
			//return linkOriginalNuevo
			// 2. Actualizarlo en la BD
			await BD_genericas.actualizarPorId("links_originales", datos.id, linkOriginalNuevo);
		} else {
			// Editados se guarda en versión edición
			// 1. Obtener el link 'Edición Nueva'
			// 1.1. Obtener el link 'combinado'
			let linkCombinado = await this.obtenerLinkCombinado(linkOriginal.id, userID);
			// 1.2. Adecuar la información del formulario
			datos.entidad = "links_edicion";
			// 1.3. Obtener el link 'Edición Nueva'
			var linkEdicionNueva = {...linkCombinado, ...datos};
			// 1.4. Quitar los coincidencias con el original
			linkEdicionNueva = funciones.quitarLasCoincidenciasConOriginal(linkOriginal, linkEdicionNueva);
			// 2. Temas de 'id'...
			// 2.1. Elimina el id de la edición nueva, porque no se necesita y puede entorpecer
			delete linkEdicionNueva.id;
			// 2.2. Si el linkCombinado incluye una edición previa, se toma su 'id' para eliminarla
			if (linkEdicionNueva.link_id)
				await BD_genericas.eliminarRegistro("links_edicion", linkCombinado.id);
			else {
				// 3. De lo contrario, se completa la info
				linkEdicionNueva = {
					...linkEdicionNueva,
					link_id: linkOriginal.id,
					editado_por_id: userID,
				};
			}
			// 3. Agregar 'edición' a la BD
			await BD_genericas.agregarRegistro("links_edicion", linkEdicionNueva);
		}
	},
	obtenerLinkCombinado: async (link_id, userID) => {
		let linkEditado = await BD_genericas.obtenerPorCamposConInclude("links_edicion", {
			link_id: link_id,
			editado_por_id: userID,
		});
		// Hacer la combinación
		// Si existe 'linkEditado', se preserva su 'id'
		let linkCombinado = {...linkOriginal, ...linkEditado};
		// Fin
		return linkCombinado;
	},
	limpiarLosDatos: function (datos) {
		// Adecuaciones iniciales al objeto 'datos'
		datos.alta = datos.numeroFila == datos.calidad.length - 1 || typeof datos.calidad == "string";
		if (datos.alta) delete datos.id;
		delete datos.motivo_id;
		// Obtener los datos de la fila que necesitamos
		for (let campo in datos) {
			if (typeof datos[campo] == "object") datos[campo] = datos[campo][datos.numeroFila];
		}
		// Quitar campos innecesarios
		datos = this.quitarLosCamposSinContenido(datos);
		// Fin
		return datos;
	},
};
