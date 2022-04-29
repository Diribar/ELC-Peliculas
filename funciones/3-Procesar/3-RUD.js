"use strict";
// Definir variables
const BD_especificas = require("../2-BD/Especificas");
const BD_genericas = require("../2-BD/Genericas");
const especificas = require("../4-Compartidas/Especificas");

module.exports = {
	guardar_o_actualizar_Edicion: async (prodEntidad, prodID, userID, datos) => {
		let entidad_id = especificas.entidad_id(prodEntidad);
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
};
