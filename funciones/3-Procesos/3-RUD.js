"use strict";
// Definir variables
const BD_especificas = require("../2-BD/Especificas");
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("../3-Procesos/Compartidas");

module.exports = {
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
	statusResumido: function (status, capturado_en, captura_activa) {
		let id =
			captura_activa && capturado_en > this.haceUnaHora()
				? 2
				: status.gr_pend_aprob
				? 1
				: status.aprobado
				? 3
				: 4;
		let nombres = ["Pend. Aprobac.", "En Revisión", "Aprobado", "Inactivado"];
		return {id, nombre: nombres[id - 1]};
	},
	quitarLosCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
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
			"editado_por",
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
			// prodEditado = {...prodOriginal, ...prodEditado};
		}
		return [prodOriginal, prodEditado];
	},
};
